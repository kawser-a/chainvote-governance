// /app/api/candidate/results/route.js
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { dbConnect } from '@/lib/db';
import Candidate from '@/models/Candidate';
import Election from '@/models/Election';
import Vote from '@/models/Vote';
import Manifesto from '@/models/Manifesto';
import mongoose from 'mongoose';

async function candidateAuth() {
  const c = await cookies();
  const t = c.get('candidate_session')?.value;
  if (!t) throw new Error('no token');
  const p = jwt.verify(t, process.env.JWT_SECRET);
  if (p.role !== 'candidate') throw new Error('not candidate');
  return p.sub;
}

export async function GET() {
  try {
    await dbConnect();
    const cid = await candidateAuth();

    const cand = await Candidate.findById(cid, { seat: 1 }).lean();
    if (!cand) return NextResponse.json({ ok: false, error: 'Candidate not found' }, { status: 404 });

    // Completed elections relevant to their seat
    const elections = await Election.find({
      status: 'completed',
      'eligibility.scope': { $in: ['seat', 'all', 'country'] },
      $or: [
        { seats: { $in: [cand.seat] } },
        { 'eligibility.seats': { $in: [cand.seat] } }
      ]
    }).sort({ endAt: -1 }).lean();

    const results = [];

    for (const e of elections) {
      const eid = new mongoose.Types.ObjectId(e._id);
      // Get manifesto votes for this candidate
      const mans = await Manifesto.find({ candidateId: cid, seat: cand.seat, status: 'approved' }, { _id: 1, title: 1 }).lean();
      const manIds = mans.map(m => m._id);

      const counts = manIds.length ? await Vote.aggregate([
        { $match: { electionId: eid, manifestoId: { $in: manIds } } },
        { $group: { _id: '$manifestoId', count: { $sum: 1 } } }
      ]) : [];

      const byManifesto = mans.map(m => ({
        manifestoId: m._id,
        title: m.title,
        votes: (counts.find(c => String(c._id) === String(m._id))?.count || 0),
      }));

      // Determine seat winner
      const allVotes = await Vote.aggregate([
        { $match: { electionId: eid, manifestoId: { $ne: null } } },
        { $lookup: { from: 'manifestos', localField: 'manifestoId', foreignField: '_id', as: 'm' } },
        { $unwind: '$m' },
        { $group: { _id: { seat: '$m.seat', candidateId: '$m.candidateId' }, total: { $sum: 1 } } },
      ]);

      const seatVotes = allVotes.filter(v => v._id.seat === cand.seat);
      let winnerId = null, maxVotes = -1;
      for (const v of seatVotes) {
        if (v.total > maxVotes) {
          maxVotes = v.total;
          winnerId = String(v._id.candidateId);
        }
      }

      results.push({
        election: { _id: e._id, name: e.name, endAt: e.endAt },
        seat: cand.seat,
        youWon: winnerId === String(cid),
        byManifesto,
      });
    }

    return NextResponse.json({ ok: true, data: results });
  } catch (err) {
    console.error('GET /api/candidate/results', err);
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }
}
