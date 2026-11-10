import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { dbConnect } from '@/lib/db';
import Petition from '@/models/Petition';
import Candidate from '@/models/Candidate';
import Voter from '@/models/Voter';
import mongoose from 'mongoose';

async function requireAdmin() {
  const c = await cookies();
  const t = c.get('admin_session')?.value;
  if (!t) throw new Error('no token');
  const p = jwt.verify(t, process.env.JWT_SECRET);
  if (p.role !== 'admin') throw new Error('not admin');
}

export async function GET(req) {
  try {
    await requireAdmin();
    await dbConnect();

    const sp = req.nextUrl.searchParams;
    const electionId = sp.get('electionId') || ''; // optional filter
    const statusFilter = sp.getAll('status'); // e.g., ?status=verified&status=open
    const includeStatuses = statusFilter.length ? statusFilter : ['verified']; // default: use verified only

    const match = {};
    if (electionId) match.electionId = new mongoose.Types.ObjectId(electionId);
    if (includeStatuses.length) match.status = { $in: includeStatuses };

    // Group petitions by election + candidate
    const agg = await Petition.aggregate([
      { $match: match },
      {
        $group: {
          _id: { electionId: '$electionId', candidateId: '$candidateId' },
          count: { $sum: 1 },
          seats: { $addToSet: '$seat' },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Load candidate & seat → compute voter base for threshold
    const thresholdPercent = parseFloat(process.env.PETITION_REMOVE_THRESHOLD_PERCENT || '30');
    const res = [];
    for (const g of agg) {
      const electionId = g._id.electionId;
      const candidateId = g._id.candidateId;
      const count = g.count;

      const cand = await Candidate.findById(candidateId).lean();
      if (!cand) continue;

      // Count eligible voters in this seat
      const eligibleVoters = await Voter.countDocuments({
        seat: cand.seat,
        canVote: true,
        isBanned: false,
        enrollmentDone: true,
      });

      const thresholdCount = Math.ceil((eligibleVoters * thresholdPercent) / 100);
      const canRemove = count >= thresholdCount;

      res.push({
        electionId,
        candidate: {
          _id: cand._id,
          name: cand.name,
          seat: cand.seat,
          partyName: cand.partyName || null,
          independent: !!cand.independent,
          removed: !!cand.removed,
        },
        petitionCount: count,
        eligibleVoters,
        thresholdPercent,
        thresholdCount,
        canRemove,
      });
    }

    return NextResponse.json({ ok: true, data: res });
  } catch (e) {
    console.error('GET /api/admin/petitions/summary', e);
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }
}
