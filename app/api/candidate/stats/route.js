import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { dbConnect } from '@/lib/db';
import Voter from '@/models/Voter';
import Candidate from '@/models/Candidate';
import Manifesto from '@/models/Manifesto';
import Vote from '@/models/Vote';
import Election from '@/models/Election';
import mongoose from 'mongoose';

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function auth() {
  const c = await cookies();
  const t = c.get('candidate_session')?.value;
  if (!t) throw new Error('no token');
  const p = jwt.verify(t, process.env.JWT_SECRET);
  if (p.role !== 'candidate') throw new Error('not candidate');
  return p.sub;
}

export async function GET() {
  try {
    const cid = await auth();
    await dbConnect();

    const cand = await Candidate.findById(cid).lean();
    if (!cand) return NextResponse.json({ ok: false }, { status: 401 });

    const seat = (cand.seat || '').trim();
    // Case-insensitive, exact (anchors ^$) seat match to avoid whitespace/case issues
    const seatRx = { $regex: `^${escapeRegExp(seat)}$`, $options: 'i' };

    // (1) Everyone assigned to this seat (regardless of enrollment)
    const seatAssignedTotal = await Voter.countDocuments({ seat: seatRx });

    // (2) Registered & eligible voters on this seat (what you expect on dashboard)
    const registeredVoters = await Voter.countDocuments({
      seat: seatRx,
      enrollmentDone: true,
      pinHash: { $ne: null },
      canVote: true,
      isBanned: false,
    });

    // Opposition candidates (active)
    const oppositionCount = await Candidate.countDocuments({
      seat: seatRx,
      _id: { $ne: new mongoose.Types.ObjectId(cid) },
      active: true,
    });

    // Ongoing elections for this seat
    const now = new Date();
    const ongoing = await Election.find({
      seat: seat, // if you want to be lenient, you can also use seat: seatRx
      startAt: { $lte: now },
      endAt: { $gte: now },
    }).lean();

    // Manifesto votes aggregation
    const myMan = await Manifesto.find({ candidateId: cid }).lean();
    const manIds = myMan.map((m) => m._id);

    let votesAgg = [];
    if (manIds.length) {
      const pipeline = [
        { $match: { manifestoId: { $in: manIds } } },
        { $group: { _id: '$manifestoId', count: { $sum: 1 } } },
      ];
      try {
        votesAgg = await Vote.aggregate(pipeline);
      } catch {
        const coll = mongoose.connection.db.collection('votes');
        votesAgg = await coll.aggregate(pipeline).toArray();
      }
    }

    const voteMap = Object.fromEntries(votesAgg.map((x) => [String(x._id), x.count]));
    const myApproved = myMan
      .filter((m) => m.status === 'approved')
      .map((m) => ({
        _id: m._id,
        title: m.title,
        votes: voteMap[String(m._id)] || 0,
      }));

    return NextResponse.json({
      ok: true,
      seat,
      // Use registeredVoters as the dashboard number (your “two registered” will show correctly)
      totalVoters: registeredVoters,
      // Also returning this if you want to display both later
      seatAssignedTotal,
      oppositionCount,
      ongoingElections: ongoing.map((e) => ({
        id: e._id,
        name: e.name,
        startAt: e.startAt,
        endAt: e.endAt,
      })),
      myManifestos: myApproved,
    });
  } catch (e) {
    console.error('GET /api/candidate/stats', e);
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }
}
