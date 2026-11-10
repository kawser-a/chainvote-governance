// // /app/api/elections/[id]/winners/route.js
// import { NextResponse } from 'next/server';
// import { dbConnect } from '@/lib/db';
// import Election from '@/models/Election';
// import Vote from '@/models/Vote';
// import Candidate from '@/models/Candidate';
// import Manifesto from '@/models/Manifesto';
// import mongoose from 'mongoose';

// export const revalidate = 0;
// export const dynamic = 'force-dynamic';

// function addMonths(date, months) {
//   const d = new Date(date);
//   d.setMonth(d.getMonth() + months);
//   return d;
// }

// export async function GET(_req, ctx) {
//   try {
//     await dbConnect();
//     const { id } = await ctx.params;

//     const e = await Election.findById(id).lean();
//     if (!e) return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });

//     const eid = new mongoose.Types.ObjectId(id);

//     // Calculate votes per manifesto
//     const manifestoCounts = await Vote.aggregate([
//       { $match: { electionId: eid, manifestoId: { $ne: null } } },
//       { $group: { _id: '$manifestoId', count: { $sum: 1 } } },
//     ]);

//     const manIds = manifestoCounts.map(x => x._id);
//     const mans = manIds.length ? await Manifesto.find({ _id: { $in: manIds } }, { _id: 1, candidateId: 1, seat: 1, title: 1, targetWindowMonths: 1 }).lean() : [];
//     const cands = mans.length ? await Candidate.find(
//       { _id: { $in: mans.map(m => m.candidateId) } },
//       { _id: 1, name: 1, seat: 1, partyName: 1, independent: 1, age: 1, gender: 1, occupation: 1, shortSpeech: 1 }
//     ).lean() : [];

//     const mMap = new Map(mans.map(m => [String(m._id), m]));
//     const cMap = new Map(cands.map(c => [String(c._id), c]));
//     const countsMap = new Map(manifestoCounts.map(v => [String(v._id), v.count]));

//     // Aggregate by candidate per seat to determine winners
//     const candidateSeatVotes = new Map(); // `${seat}:${candidateId}` -> total votes
//     mans.forEach(m => {
//       const key = `${m.seat}:${String(m.candidateId)}`;
//       const count = countsMap.get(String(m._id)) || 0;
//       candidateSeatVotes.set(key, (candidateSeatVotes.get(key) || 0) + count);
//     });

//     const seatWinners = {}; // seat -> winner object
//     for (const [key, totalVotes] of candidateSeatVotes.entries()) {
//       const [seat, candidateId] = key.split(':');
//       const candidate = cMap.get(candidateId);
//       const party = candidate?.independent ? 'Independent' : (candidate?.partyName || 'Unknown');

//       if (!seatWinners[seat] || totalVotes > seatWinners[seat].totalVotes) {
//         seatWinners[seat] = {
//           seat,
//           candidateId,
//           candidateName: candidate?.name || 'Unknown',
//           partyName: party,
//           gender: candidate?.gender || null,
//           age: candidate?.age || null,
//           occupation: candidate?.occupation || '',
//           shortSpeech: candidate?.shortSpeech || '',
//           totalVotes,
//         };
//       }
//     }

//     // For each seat's winner, fetch approved manifestos to display with timeline
//     const winnersDetailed = [];
//     const electionEnd = new Date(e.endAt);

//     for (const seat of Object.keys(seatWinners)) {
//       const w = seatWinners[seat];

//       // Get approved manifestos of winning candidate for that seat
//       const winnerManifests = await Manifesto.find({
//         candidateId: w.candidateId,
//         seat: seat,
//         status: 'approved'
//       }, { _id: 1, title: 1, summary: 1, targetWindowMonths: 1 }).lean();

//       const withDue = winnerManifests.map(m => {
//         const months = m.targetWindowMonths || 0;
//         const dueDate = months > 0 ? addMonths(electionEnd, months) : null;
//         const isOverdue = dueDate ? (new Date() > dueDate) : false;
//         return {
//           _id: m._id,
//           title: m.title,
//           summary: m.summary,
//           targetWindowMonths: m.targetWindowMonths || null,
//           dueDate,
//           isOverdue,
//         };
//       });

//       winnersDetailed.push({
//         seat,
//         candidate: {
//           _id: w.candidateId,
//           name: w.candidateName,
//           partyName: w.partyName,
//           gender: w.gender,
//           age: w.age,
//           occupation: w.occupation,
//           shortSpeech: w.shortSpeech,
//         },
//         totalVotes: w.totalVotes,
//         manifestos: withDue,
//       });
//     }

//     return NextResponse.json({
//       ok: true,
//       election: {
//         _id: e._id, name: e.name, startAt: e.startAt, endAt: e.endAt, status: e.status,
//         type: e.type, ballotType: e.ballotType,
//       },
//       winners: winnersDetailed,
//     });
//   } catch (err) {
//     console.error('GET /api/elections/:id/winners', err);
//     return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
//   }
// }

import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Election from '@/models/Election';
import Candidate from '@/models/Candidate';
import Manifesto from '@/models/Manifesto';
import Vote from '@/models/Vote';
import mongoose from 'mongoose';

function addMinutes(date, minutes) {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() + minutes);
  return d;
}
function addMonths(date, months) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}
function computeDue(createdAt, m) {
  if (m.targetWindowMinutes) {
    return addMinutes(createdAt, m.targetWindowMinutes);
  }
  if (m.targetWindowMonths) {
    return addMonths(createdAt, m.targetWindowMonths);
  }
  return null;
}

export async function GET(req, ctx) {
  try {
    await dbConnect();
    const { id } = await ctx.params;

    const e = await Election.findById(id).lean();
    if (!e) return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });
    if (e.type !== 'national' || e.ballotType !== 'manifesto') {
      // Winners logic is focused on manifesto elections
      // (You can adapt to candidate-ballot elections too.)
    }

    const eid = new mongoose.Types.ObjectId(id);

    // Aggregate manifesto votes per candidate per seat
    const agg = await Vote.aggregate([
      { $match: { electionId: eid, manifestoId: { $ne: null } } },
      { $group: { _id: '$manifestoId', votes: { $sum: 1 } } }
    ]);

    const voteMap = new Map(agg.map(a => [String(a._id), a.votes]));

    // Resolve manifestos used on ballot with candidate
    const manIds = (e.ballot || []).filter(b => b.manifestoId).map(b => b.manifestoId);
    const mans = manIds.length ? await Manifesto.find({ _id: { $in: manIds } }).lean() : [];
    const candIds = mans.map(m => m.candidateId);
    const cands = candIds.length ? await Candidate.find({ _id: { $in: candIds } }).lean() : [];

    const candMap = Object.fromEntries(cands.map(c => [String(c._id), c]));
    const bySeat = new Map();

    // Tally candidate totals seat-wise
    for (const m of mans) {
      const seat = m.seat || '—';
      const cand = candMap[String(m.candidateId)];
      const candKey = cand ? String(cand._id) : 'unknown';
      const mvotes = voteMap.get(String(m._id)) || 0;

      if (!bySeat.has(seat)) bySeat.set(seat, new Map());
      const seatMap = bySeat.get(seat);
      const old = seatMap.get(candKey) || { candidate: cand, totalVotes: 0, manifestos: [] };
      old.totalVotes += mvotes;
      old.manifestos.push(m);
      seatMap.set(candKey, old);
    }

    // Determine winners per seat (max votes)
    const winners = [];
    const now = Date.now();
    for (const [seat, cmap] of bySeat.entries()) {
      let picked = null;
      for (const [, v] of cmap.entries()) {
        if (!picked || v.totalVotes > picked.totalVotes) {
          picked = v;
        }
      }
      if (picked) {
        // enrich manifestos with dueDate & overdue flags
        const enriched = picked.manifestos.map(m => {
          const dueDate = computeDue(m.createdAt, m);
          const isOverdue = !!(dueDate && Date.now() > dueDate.getTime());
          return {
            _id: m._id,
            title: m.title,
            summary: m.summary,
            targetWindowMonths: m.targetWindowMonths || null,
            targetWindowMinutes: m.targetWindowMinutes || null,
            createdAt: m.createdAt,
            dueDate,
            isOverdue,
          };
        });
        winners.push({
          seat,
          candidate: {
            _id: picked.candidate?._id,
            name: picked.candidate?.name,
            partyName: picked.candidate?.partyName || 'Independent',
            shortSpeech: picked.candidate?.shortSpeech || '',
          },
          totalVotes: picked.totalVotes,
          manifestos: enriched,
        });
      }
    }

    return NextResponse.json({ ok: true, winners });
  } catch (e) {
    console.error('GET /api/elections/:id/winners', e);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
