// import { NextResponse } from 'next/server';
// import { dbConnect } from '@/lib/db';
// import Election from '@/models/Election';
// import Vote from '@/models/Vote';
// import Candidate from '@/models/Candidate';
// import Manifesto from '@/models/Manifesto';
// import mongoose from 'mongoose';

// export const revalidate = 0;
// export const dynamic = 'force-dynamic';

// export async function GET(_req, ctx) {
//     try {
//         await dbConnect();
//         const { id } = await ctx.params;

//         const e = await Election.findById(id).lean();
//         if (!e) return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });

//         if (e.ballotType !== 'manifesto') {
//             // For candidate/proposal-based elections, you can customize seat/party aggregation accordingly
//             return NextResponse.json({ ok: true, type: e.ballotType, data: { message: 'Results currently supported for manifesto ballots' } });
//         }

//         const eid = new mongoose.Types.ObjectId(id);

//         // votes by manifesto
//         const agg = await Vote.aggregate([
//             { $match: { electionId: eid, manifestoId: { $ne: null } } },
//             { $group: { _id: '$manifestoId', votes: { $sum: 1 } } },
//         ]);

//         const countsMap = new Map(agg.map(a => [String(a._id), a.votes]));

//         // get manifesto→candidate mapping
//         const manIds = Array.from(countsMap.keys()).map(x => new mongoose.Types.ObjectId(x));
//         const mans = manIds.length ? await Manifesto.find({ _id: { $in: manIds } }, { _id: 1, candidateId: 1, seat: 1 }).lean() : [];
//         const candidateIds = mans.map(m => m.candidateId);
//         const cands = candidateIds.length
//             ? await Candidate.find({ _id: { $in: candidateIds } }, { _id: 1, name: 1, partyName: 1, independent: 1, seat: 1 }).lean()
//             : [];

//         const candMap = Object.fromEntries(cands.map(c => [String(c._id), c]));

//         // compute per-candidate totals per seat
//         // and per-party totals
//         const seatCandidateTotals = new Map(); // `${seat}:${candId}` -> votes
//         const partyTotals = new Map(); // partyName (or 'Independent') -> votes
//         const manifestoBreakdown = []; // per-manifesto vote lines

//         for (const m of mans) {
//             const mvotes = countsMap.get(String(m._id)) || 0;
//             manifestoBreakdown.push({ manifestoId: String(m._id), candidateId: String(m.candidateId), seat: m.seat, votes: mvotes });

//             const c = candMap[String(m.candidateId)];
//             if (!c) continue;
//             const seatKey = `${m.seat}:${String(c._id)}`;
//             seatCandidateTotals.set(seatKey, (seatCandidateTotals.get(seatKey) || 0) + mvotes);

//             const party = c.partyName || 'Independent';
//             partyTotals.set(party, (partyTotals.get(party) || 0) + mvotes);
//         }

//         // determine winners per seat: candidate with highest total
//         const seatWinners = [];
//         const bySeat = new Map(); // seat -> [{candId, votes}]
//         for (const [key, total] of seatCandidateTotals.entries()) {
//             const [seat, candId] = key.split(':');
//             if (!bySeat.has(seat)) bySeat.set(seat, []);
//             bySeat.get(seat).push({ candId, total });
//         }
//         for (const [seat, arr] of bySeat.entries()) {
//             arr.sort((a, b) => b.total - a.total);
//             const winner = arr[0];
//             const cand = candMap[winner.candId];
//             seatWinners.push({
//                 seat,
//                 candidate: { _id: cand._id, name: cand.name, partyName: cand.partyName || 'Independent', seat: cand.seat || seat },
//                 votes: winner.total,
//             });
//         }

//         // format party totals array
//         const partyWise = Array.from(partyTotals.entries()).map(([party, votes]) => ({ party, votes }))
//             .sort((a, b) => b.votes - a.votes);

//         return NextResponse.json({
//             ok: true,
//             election: { _id: e._id, name: e.name, startAt: e.startAt, endAt: e.endAt, status: e.status },
//             results: {
//                 manifestoBreakdown,
//                 seatWinners,
//                 partyWise,
//             },
//         });
//     } catch (err) {
//         console.error('GET /api/elections/:id/results', err);
//         return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
//     }
// }

// /app/api/elections/[id]/results/route.js
import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Election from '@/models/Election';
import Vote from '@/models/Vote';
import Manifesto from '@/models/Manifesto';
import Candidate from '@/models/Candidate';
import mongoose from 'mongoose';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export async function GET(_req, ctx) {
  try {
    await dbConnect();

    const { id } = await ctx.params;
    if (!id) return NextResponse.json({ ok: false, error: 'Missing id' }, { status: 400 });

    const e = await Election.findById(id).lean();
    if (!e) return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });

    const eid = new mongoose.Types.ObjectId(id);

    // Count votes by manifestoId
    const manifestoCounts = await Vote.aggregate([
      { $match: { electionId: eid, manifestoId: { $ne: null } } },
      { $group: { _id: '$manifestoId', count: { $sum: 1 } } },
    ]);

    // join manifestos to candidates
    const manIds = manifestoCounts.map(x => x._id);
    const mans = manIds.length ? await Manifesto.find({ _id: { $in: manIds } }, { _id:1, title:1, candidateId:1, seat:1 }).lean() : [];
    const candIds = mans.map(m => m.candidateId);
    const cands = candIds.length ? await Candidate.find({ _id: { $in: candIds } }, { _id:1, name:1, partyName:1, independent:1, seat:1 }).lean() : [];

    const mMap = new Map(mans.map(m => [String(m._id), m]));
    const cMap = new Map(cands.map(c => [String(c._id), c]));

    // Build readable manifestos with votes
    const byManifesto = manifestoCounts.map(x => {
      const m = mMap.get(String(x._id));
      const c = m ? cMap.get(String(m.candidateId)) : null;
      return {
        manifestoId: x._id,
        votes: x.count,
        title: m?.title || 'Manifesto',
        candidateId: m?.candidateId || null,
        candidateName: c?.name || null,
        seat: m?.seat || c?.seat || null,
        partyName: c?.independent ? 'Independent' : (c?.partyName || null),
      };
    });

    // seat-wise winner (sum of all manifesto votes per candidate per seat)
    const seatWise = {}; // seat -> { candidateId, candidateName, partyName, totalVotes }
    const candidateVotesBySeat = new Map(); // `${seat}:${candidateId}` -> total
    for (const row of byManifesto) {
      if (!row.seat || !row.candidateId) continue;
      const key = `${row.seat}:${row.candidateId}`;
      candidateVotesBySeat.set(key, (candidateVotesBySeat.get(key) || 0) + row.votes);
    }
    for (const [key, total] of candidateVotesBySeat.entries()) {
      const [seat, candidateId] = key.split(':');
      // read candidate info
      const c = cMap.get(candidateId);
      const party = c?.independent ? 'Independent' : (c?.partyName || null);
      if (!seatWise[seat] || total > seatWise[seat].totalVotes) {
        seatWise[seat] = {
          seat,
          candidateId,
          candidateName: c?.name || 'Unknown',
          partyName: party,
          totalVotes: total,
        };
      }
    }

    // party-wise total aggregated across seats
    const partyTotals = {};
    for (const [key, total] of candidateVotesBySeat.entries()) {
      const [, candidateId] = key.split(':');
      const c = cMap.get(candidateId);
      const party = c?.independent ? 'Independent' : (c?.partyName || 'Unknown');
      partyTotals[party] = (partyTotals[party] || 0) + total;
    }
    const byParty = Object.entries(partyTotals).map(([party, votes]) => ({ partyName: party, votes }));

    const totalVotes = byManifesto.reduce((acc, r) => acc + r.votes, 0);

    return NextResponse.json({
      ok: true,
      election: {
        _id: e._id, name: e.name, ballotType: e.ballotType, type: e.type,
        startAt: e.startAt, endAt: e.endAt, status: e.status,
      },
      totalVotes,
      byManifesto, // list of manifesto’s counts
      seatWise: Object.values(seatWise), // winners per seat
      byParty, // aggregated votes by party
    });
  } catch (err) {
    console.error('GET /api/elections/:id/results', err);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
