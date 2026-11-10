
// // /app/api/elections/[id]/vote/route.js
// import { NextResponse } from 'next/server';
// import { cookies } from 'next/headers';
// import jwt from 'jsonwebtoken';
// import { dbConnect } from '@/lib/db';
// import Election from '@/models/Election';
// import Voter from '@/models/Voter';
// import Manifesto from '@/models/Manifesto';
// import Candidate from '@/models/Candidate';
// import Vote from '@/models/Vote';
// import mongoose from 'mongoose';

// async function requireVoter() {
//     const c = await cookies();
//     const t = c.get('session')?.value;
//     if (!t) throw new Error('no token');
//     const p = jwt.verify(t, process.env.JWT_SECRET);
//     // payload: { sub: NID, cc: credentialCommitment }
//     return { nid: p.sub, cc: p.cc };
// }

// export async function POST(req, ctx) {
//     try {
//         await dbConnect();
//         const { id } = await ctx.params; // election id
//         const body = await req.json();

//         // 1) auth
//         const { nid } = await requireVoter();
//         const voter = await Voter.findOne({ nid }).lean();
//         if (!voter) return NextResponse.json({ ok: false, error: 'Voter not found' }, { status: 404 });

//         // 2) election checks
//         const election = await Election.findById(id).lean();
//         if (!election) return NextResponse.json({ ok: false, error: 'Election not found' }, { status: 404 });

//         const now = Date.now();
//         const activeWindow = now >= Date.parse(election.startAt) && now <= Date.parse(election.endAt);

//         // block if paused or not in window
//         if (election.status !== 'active' || !activeWindow) {
//             const why = election.status === 'paused' ? 'Election is paused' : 'Election is not active';
//             return NextResponse.json({ ok: false, error: why }, { status: 409 });
//         }

//         // 3) eligibility checks
//         const elig = election.eligibility || {};
//         if (elig.requireEnrolled && !voter.enrollmentDone) {
//             return NextResponse.json({ ok: false, error: 'Enrollment required' }, { status: 403 });
//         }
//         if (elig.canVoteOnly) {
//             if (voter.isBanned) return NextResponse.json({ ok: false, error: 'You are banned' }, { status: 403 });
//             if (voter.canVote === false) return NextResponse.json({ ok: false, error: 'Voting disabled' }, { status: 403 });
//         }
//         // scope
//         const scope = elig.scope || 'seat';
//         if (scope === 'seat') {
//             const seats = elig.seats || election.seats || [];
//             if (!seats.includes(voter.seat)) {
//                 return NextResponse.json({ ok: false, error: 'Not eligible for this seat' }, { status: 403 });
//             }
//         } else if (scope === 'role') {
//             // expects voter.roles array if using role-based (e.g., MPs)
//             const roles = elig.roles || [];
//             const voterRoles = voter.roles || []; // optional field on Voter
//             const ok = roles.some(r => voterRoles.includes(r));
//             if (!ok) return NextResponse.json({ ok: false, error: 'Not authorized by role' }, { status: 403 });
//         } else if (scope === 'country') {
//             // all eligible citizens → no-op here
//         } else if (scope === 'location') {
//             // you can extend with location-matching logic if your Voter has address fields
//             // skipping strict check for now
//         } else {
//             // 'all' → no-op
//         }

//         // 4) ballot type handling
//         const eid = new mongoose.Types.ObjectId(id);
//         const ballotType = election.ballotType || 'manifesto';
//         const multi = !!election.multiSelect;

//         // build helpers to ensure the choice belongs to ballot
//         const ballot = election.ballot || [];

//         async function voteManifests(manifestoIds) {
//             // verify each is in this election's ballot
//             const allowedSet = new Set(
//                 ballot.filter(b => b.manifestoId).map(b => String(b.manifestoId))
//             );
//             const picks = manifestoIds
//                 .map(x => String(x))
//                 .filter(x => allowedSet.has(x));

//             if (!picks.length) return { ok: false, error: 'Invalid manifesto selection' };

//             // if multiSelect=false, ensure only one
//             if (!multi && picks.length > 1) return { ok: false, error: 'Only one selection allowed' };

//             // prevent duplicate votes per manifesto (and whole-election when multi=false)
//             const existing = await Vote.find({
//                 electionId: eid,
//                 voterNid: nid,
//                 manifestoId: { $in: picks.map(p => new mongoose.Types.ObjectId(p)) },
//             }).lean();

//             const already = new Set(existing.map(v => String(v.manifestoId)));
//             const toInsert = picks.filter(p => !already.has(p));

//             if (!toInsert.length) return { ok: false, error: 'Already voted for selected manifesto(s)' };

//             // if multi=false and voter already has any vote in this election, block
//             if (!multi) {
//                 const hasAny = await Vote.exists({ electionId: eid, voterNid: nid });
//                 if (hasAny) return { ok: false, error: 'You have already voted' };
//             }

//             // create votes
//             const docs = toInsert.map(mid => ({
//                 electionId: eid,
//                 voterNid: nid,
//                 manifestoId: new mongoose.Types.ObjectId(mid),
//                 createdAt: new Date(),
//             }));
//             await Vote.insertMany(docs);
//             return { ok: true, count: docs.length };
//         }

//         async function voteCandidates(candidateIds) {
//             const allowedSet = new Set(
//                 ballot.filter(b => b.candidateId).map(b => String(b.candidateId))
//             );
//             const picks = candidateIds
//                 .map(x => String(x))
//                 .filter(x => allowedSet.has(x));

//             if (!picks.length) return { ok: false, error: 'Invalid candidate selection' };
//             if (!multi && picks.length > 1) return { ok: false, error: 'Only one selection allowed' };

//             // block if single-select and already voted
//             if (!multi) {
//                 const hasAny = await Vote.exists({ electionId: eid, voterNid: nid });
//                 if (hasAny) return { ok: false, error: 'You have already voted' };
//             }

//             // block duplicate per candidate
//             const existing = await Vote.find({
//                 electionId: eid,
//                 voterNid: nid,
//                 candidateId: { $in: picks.map(p => new mongoose.Types.ObjectId(p)) },
//             }).lean();
//             const already = new Set(existing.map(v => String(v.candidateId)));
//             const toInsert = picks.filter(p => !already.has(p));
//             if (!toInsert.length) return { ok: false, error: 'Already voted for selected candidate(s)' };

//             const docs = toInsert.map(cid => ({
//                 electionId: eid,
//                 voterNid: nid,
//                 candidateId: new mongoose.Types.ObjectId(cid),
//                 createdAt: new Date(),
//             }));
//             await Vote.insertMany(docs);
//             return { ok: true, count: docs.length };
//         }

//         async function voteProposal(ballotItemId, optionKey) {
//             // check ballot item exists & optionKey is valid
//             const b = ballot.find(x => String(x._id) === String(ballotItemId) && x.proposal);
//             if (!b) return { ok: false, error: 'Invalid proposal item' };
//             const allowed = new Set((b.proposal.options || []).map(o => o.key));
//             if (!allowed.has(optionKey)) return { ok: false, error: 'Invalid option' };

//             // single vote per proposal item per voter
//             const exists = await Vote.exists({
//                 electionId: eid, voterNid: nid, ballotItemId: new mongoose.Types.ObjectId(ballotItemId),
//             });
//             if (exists) return { ok: false, error: 'Already voted on this proposal' };

//             await Vote.create({
//                 electionId: eid,
//                 voterNid: nid,
//                 ballotItemId: new mongoose.Types.ObjectId(ballotItemId),
//                 optionKey,
//                 createdAt: new Date(),
//             });
//             return { ok: true, count: 1 };
//         }

//         // 5) dispatch by ballot type
//         let result;
//         if (ballotType === 'manifesto') {
//             const ids = body.manifestoIds || (body.manifestoId ? [body.manifestoId] : []);
//             result = await voteManifests(ids);
//         } else if (ballotType === 'candidate') {
//             const ids = body.candidateIds || (body.candidateId ? [body.candidateId] : []);
//             result = await voteCandidates(ids);
//         } else if (ballotType === 'proposal') {
//             result = await voteProposal(body.ballotItemId, body.optionKey);
//         } else {
//             return NextResponse.json({ ok: false, error: 'Unsupported ballot type' }, { status: 400 });
//         }

//         if (!result?.ok) {
//             return NextResponse.json({ ok: false, error: result?.error || 'Vote failed' }, { status: 400 });
//         }

//         return NextResponse.json({ ok: true, ...('count' in result ? { count: result.count } : {}) });
//     } catch (e) {
//         console.error('POST /api/elections/:id/vote', e);
//         return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
//     }
// }

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { dbConnect } from '@/lib/db';
import Election from '@/models/Election';
import Voter from '@/models/Voter';
import Vote from '@/models/Vote';
import mongoose from 'mongoose';
import crypto from 'crypto';   // <-- ✅ for hashing

async function requireVoter() {
  const c = await cookies();
  const t = c.get('session')?.value;
  if (!t) throw new Error('no token');
  const p = jwt.verify(t, process.env.JWT_SECRET);
  return { nid: p.sub, cc: p.cc };
}

function norm(s) {
  return (s ?? '').toString().trim().toLowerCase();
}

/** Build SHA256 hash for a vote doc content */
function makeHash(content) {
  return crypto.createHash('sha256').update(content).digest('hex');
}

/** Build chain-aware docs + hashes for a batch (sequentially) */
async function buildChainDocs(electionId, voterNid, voterSeat, baseDocs) {
  // get last hash from this election
  const last = await Vote.findOne({ electionId }).sort({ createdAt: -1 }).lean();
  let prevHash = last?.hash || null;

  const out = [];
  for (const base of baseDocs) {
    // Note: Minimal content for hash; expand as needed
    const ts = new Date();
    const content = [
      voterNid,
      electionId.toString(),
      voterSeat || '',
      base.manifestoId?.toString() || '',
      base.candidateId?.toString() || '',
      base.ballotItemId?.toString() || '',
      base.optionKey || '',
      ts.toISOString(),
      prevHash || '',
    ].join(':');

    const hash = makeHash(content);
    const doc = {
      electionId,
      voterNid,
      seat: voterSeat || null,
      prevHash,
      hash,
      createdAt: ts,
      ...base, // contains manifestoId OR candidateId OR ballotItemId+optionKey
    };
    out.push(doc);
    prevHash = hash; // chain forward
  }
  return out;
}

export async function POST(req, ctx) {
  try {
    await dbConnect();
    const { id } = await ctx.params; // election id
    const body = await req.json();

    // 1) auth
    const { nid } = await requireVoter();
    const voter = await Voter.findOne({ nid }).lean();
    if (!voter) return NextResponse.json({ ok: false, error: 'Voter not found' }, { status: 404 });

    // 2) election checks
    const election = await Election.findById(id).lean();
    if (!election) return NextResponse.json({ ok: false, error: 'Election not found' }, { status: 404 });

    const now = Date.now();
    const activeWindow = now >= Date.parse(election.startAt) && now <= Date.parse(election.endAt);
    if (election.status !== 'active' || !activeWindow) {
      const why = election.status === 'paused' ? 'Election is paused' : 'Election is not active';
      return NextResponse.json({ ok: false, error: why }, { status: 409 });
    }

    // 3) eligibility checks
    const elig = election.eligibility || {};
    if (elig.requireEnrolled && !voter.enrollmentDone) {
      return NextResponse.json({ ok: false, error: 'Enrollment required' }, { status: 403 });
    }
    if (elig.canVoteOnly) {
      if (voter.isBanned) return NextResponse.json({ ok: false, error: 'You are banned' }, { status: 403 });
      if (voter.canVote === false) return NextResponse.json({ ok: false, error: 'Voting disabled' }, { status: 403 });
    }

    // normalize seat-comparison with fallbacks
    const scope = elig.scope || 'seat';
    if (scope === 'seat') {
      const vSeat = norm(voter.seat);
      const fromElig = Array.isArray(elig.seats) ? elig.seats : [];
      const fromElection = Array.isArray(election.seats) ? election.seats : [];
      const fromBallot = (election.ballot || []).map(b => b.seat).filter(Boolean);
      const allowedSeats = [...new Set([...fromElig, ...fromElection, ...fromBallot])]
        .map(norm)
        .filter(Boolean);

      if (!vSeat || allowedSeats.length === 0) {
        return NextResponse.json(
          { ok: false, error: 'Not eligible for this seat (misconfigured election)' },
          { status: 403 }
        );
      }
      if (!allowedSeats.includes(vSeat)) {
        return NextResponse.json({ ok: false, error: 'Not eligible for this seat' }, { status: 403 });
      }
    } else if (scope === 'role') {
      const roles = elig.roles || [];
      const voterRoles = voter.roles || [];
      const ok = roles.some(r => voterRoles.includes(r));
      if (!ok) return NextResponse.json({ ok: false, error: 'Not authorized by role' }, { status: 403 });
    }

    // 4) ballot type handling
    const eid = new mongoose.Types.ObjectId(id);
    const ballotType = election.ballotType || 'manifesto';
    const multi = !!election.multiSelect;
    const ballot = election.ballot || [];

    // ====== Manifesto ======
    async function voteManifests(manifestoIds) {
      const allowedSet = new Set(
        ballot.filter(b => b.manifestoId).map(b => String(b.manifestoId))
      );
      const picks = manifestoIds
        .map(x => String(x))
        .filter(x => allowedSet.has(x));

      if (!picks.length) return { ok: false, error: 'Invalid manifesto selection' };
      if (!multi && picks.length > 1) return { ok: false, error: 'Only one selection allowed' };

      // if multi=false and voter already has any vote in this election, block
      if (!multi) {
        const hasAny = await Vote.exists({ electionId: eid, voterNid: nid });
        if (hasAny) return { ok: false, error: 'You have already voted' };
      }

      // prevent duplicate per manifesto
      const existing = await Vote.find({
        electionId: eid,
        voterNid: nid,
        manifestoId: { $in: picks.map(p => new mongoose.Types.ObjectId(p)) },
      }).lean();
      const already = new Set(existing.map(v => String(v.manifestoId)));
      const toInsert = picks.filter(p => !already.has(p));
      if (!toInsert.length) return { ok: false, error: 'Already voted for selected manifesto(s)' };

      // build docs w/ chain
      const baseDocs = toInsert.map(mid => ({
        manifestoId: new mongoose.Types.ObjectId(mid),
      }));
      const docs = await buildChainDocs(eid, nid, voter.seat, baseDocs);
      await Vote.insertMany(docs);
      return { ok: true, count: docs.length };
    }

    // ====== Candidate ======
    async function voteCandidates(candidateIds) {
      const allowedSet = new Set(
        ballot.filter(b => b.candidateId).map(b => String(b.candidateId))
      );
      const picks = candidateIds
        .map(x => String(x))
        .filter(x => allowedSet.has(x));

      if (!picks.length) return { ok: false, error: 'Invalid candidate selection' };
      if (!multi && picks.length > 1) return { ok: false, error: 'Only one selection allowed' };

      if (!multi) {
        const hasAny = await Vote.exists({ electionId: eid, voterNid: nid });
        if (hasAny) return { ok: false, error: 'You have already voted' };
      }

      const existing = await Vote.find({
        electionId: eid,
        voterNid: nid,
        candidateId: { $in: picks.map(p => new mongoose.Types.ObjectId(p)) },
      }).lean();
      const already = new Set(existing.map(v => String(v.candidateId)));
      const toInsert = picks.filter(p => !already.has(p));
      if (!toInsert.length) return { ok: false, error: 'Already voted for selected candidate(s)' };

      const baseDocs = toInsert.map(cid => ({
        candidateId: new mongoose.Types.ObjectId(cid),
      }));
      const docs = await buildChainDocs(eid, nid, voter.seat, baseDocs);
      await Vote.insertMany(docs);
      return { ok: true, count: docs.length };
    }

    // ====== Proposal ======
    async function voteProposal(ballotItemId, optionKey) {
      const b = ballot.find(x => String(x._id) === String(ballotItemId) && x.proposal);
      if (!b) return { ok: false, error: 'Invalid proposal item' };
      const allowed = new Set((b.proposal.options || []).map(o => o.key));
      if (!allowed.has(optionKey)) return { ok: false, error: 'Invalid option' };

      const exists = await Vote.exists({
        electionId: eid, voterNid: nid, ballotItemId: new mongoose.Types.ObjectId(ballotItemId),
      });
      if (exists) return { ok: false, error: 'Already voted on this proposal' };

      const baseDocs = [{
        ballotItemId: new mongoose.Types.ObjectId(ballotItemId),
        optionKey,
      }];
      const docs = await buildChainDocs(eid, nid, voter.seat, baseDocs);
      await Vote.insertMany(docs);
      return { ok: true, count: 1 };
    }

    // 5) dispatch by ballot type
    let result;
    if (ballotType === 'manifesto') {
      const ids = body.manifestoIds || (body.manifestoId ? [body.manifestoId] : []);
      result = await voteManifests(ids);
    } else if (ballotType === 'candidate') {
      const ids = body.candidateIds || (body.candidateId ? [body.candidateId] : []);
      result = await voteCandidates(ids);
    } else if (ballotType === 'proposal') {
      result = await voteProposal(body.ballotItemId, body.optionKey);
    } else {
      return NextResponse.json({ ok: false, error: 'Unsupported ballot type' }, { status: 400 });
    }

    if (!result?.ok) {
      return NextResponse.json({ ok: false, error: result?.error || 'Vote failed' }, { status: 400 });
    }

    return NextResponse.json({ ok: true, ...('count' in result ? { count: result.count } : {}) });
  } catch (e) {
    console.error('POST /api/elections/:id/vote', e);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
