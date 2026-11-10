// // // /app/api/petitions/route.js
// // import { NextResponse } from 'next/server';
// // import { cookies } from 'next/headers';
// // import jwt from 'jsonwebtoken';
// // import { dbConnect } from '@/lib/db';
// // import Petition from '@/models/Petition';
// // import mongoose from 'mongoose';

// // // optional voter auth for GET (so we can return only current user's petitions for badge)
// // // POST requires auth
// // async function tryVoter() {
// //   try {
// //     const c = await cookies();
// //     const t = c.get('session')?.value;
// //     if (!t) return null;
// //     const p = jwt.verify(t, process.env.JWT_SECRET);
// //     return p.sub || null; // voter nid
// //   } catch {
// //     return null;
// //   }
// // }
// // async function requireVoter() {
// //   const c = await cookies();
// //   const t = c.get('session')?.value;
// //   if (!t) throw new Error('no token');
// //   const p = jwt.verify(t, process.env.JWT_SECRET);
// //   return p.sub; // voter nid
// // }

// // // GET /api/petitions?electionId=... → return only *this user's* petitions for that election
// // export async function GET(req) {
// //   try {
// //     await dbConnect();
// //     const sp = req.nextUrl.searchParams;
// //     const electionId = sp.get('electionId');

// //     // optional - if you want to list petitions globally for admin, you can extend with role check later
// //     const voterNid = await tryVoter(); // null if unauthenticated

// //     if (!electionId) {
// //       return NextResponse.json({ ok: false, error: 'Missing electionId' }, { status: 400 });
// //     }
// //     // If not logged → return empty list (so client can still render results page)
// //     if (!voterNid) {
// //       return NextResponse.json({ ok: true, data: [] });
// //     }

// //     const q = {
// //       electionId: new mongoose.Types.ObjectId(electionId),
// //       voterNid, // only my petitions
// //     };
// //     const items = await Petition.find(q)
// //       .select({ _id: 1, manifestoId: 1, candidateId: 1, status: 1, createdAt: 1 })
// //       .sort({ createdAt: -1 })
// //       .lean();

// //     return NextResponse.json({ ok: true, data: items || [] });
// //   } catch (e) {
// //     console.error('GET /api/petitions error:', e);
// //     return NextResponse.json({ ok: false, data: [] }); // do not block results page
// //   }
// // }

// // // POST /api/petitions → requires voter session
// // export async function POST(req) {
// //   try {
// //     await dbConnect();
// //     const voterNid = await requireVoter(); // throws if no token

// //     const { electionId, candidateId, manifestoId, reason } = await req.json();
// //     if (!electionId || !candidateId || !manifestoId) {
// //       return NextResponse.json({ ok: false, error: 'Missing fields' }, { status: 400 });
// //     }

// //     const doc = await Petition.create({
// //       electionId: new mongoose.Types.ObjectId(electionId),
// //       candidateId: new mongoose.Types.ObjectId(candidateId),
// //       manifestoId: new mongoose.Types.ObjectId(manifestoId),
// //       voterNid,
// //       reason: (reason || '').trim(),
// //       status: 'filed',
// //     });
// //     return NextResponse.json({ ok: true, id: doc._id });
// //   } catch (e) {
// //     console.error('POST /api/petitions', e);
// //     if (String(e).includes('no token')) {
// //       return NextResponse.json({ ok: false, error: 'Login required' }, { status: 401 });
// //     }
// //     return NextResponse.json({ ok: false, error: 'Failed' }, { status: 400 });
// //   }
// // }

// // /app/api/petitions/route.js
// import { NextResponse } from 'next/server';
// import { cookies } from 'next/headers';
// import jwt from 'jsonwebtoken';
// import { dbConnect } from '@/lib/db';
// import Petition from '@/models/Petition';
// import Election from '@/models/Election';
// import Candidate from '@/models/Candidate';
// import Manifesto from '@/models/Manifesto';

// async function requireVoter() {
//   const c = await cookies();
//   const t = c.get('session')?.value;
//   if (!t) throw new Error('no token');
//   const p = jwt.verify(t, process.env.JWT_SECRET);
//   if (!p?.sub) throw new Error('invalid');
//   return p.sub; // voter nid
// }

// /**
//  * GET /api/petitions?electionId=...  → returns current voter's petitions
//  */
// export async function GET(req) {
//   try {
//     await dbConnect();
//     const voterNid = await requireVoter();
//     const sp = req.nextUrl.searchParams;
//     const electionId = sp.get('electionId') || null;

//     const q = { voterNid };
//     if (electionId) q.electionId = electionId;

//     // minimal join
//     const items = await Petition.find(q)
//       .sort({ createdAt: -1 })
//       .lean();

//     return NextResponse.json({ ok: true, data: items });
//   } catch (e) {
//     return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
//   }
// }

// /**
//  * POST /api/petitions  → file a new petition
//  * body: { electionId, candidateId, manifestoId, reason }
//  */
// export async function POST(req) {
//   try {
//     await dbConnect();
//     const voterNid = await requireVoter();

//     const { electionId, candidateId, manifestoId, reason = '' } = await req.json();
//     if (!electionId || !candidateId || !manifestoId) {
//       return NextResponse.json({ ok: false, error: 'Missing fields' }, { status: 400 });
//     }

//     // Optional: ensure election/candidate/manifesto exist
//     const [e, c, m] = await Promise.all([
//       Election.findById(electionId).lean(),
//       Candidate.findById(candidateId).lean(),
//       Manifesto.findById(manifestoId).lean(),
//     ]);
//     if (!e || !c || !m) {
//       return NextResponse.json({ ok: false, error: 'Invalid references' }, { status: 400 });
//     }

//     // Optional: prevent duplicate petition from same voter on same manifesto
//     const exists = await Petition.findOne({ voterNid, electionId, candidateId, manifestoId }).lean();
//     if (exists) {
//       return NextResponse.json({ ok: true, already: true, petitionId: exists._id, message: 'Petition already filed' });
//     }

//     const pet = await Petition.create({
//       electionId, candidateId, manifestoId,
//       voterNid,
//       reason: (reason || '').slice(0, 500),
//       status: 'filed',
//     });

//     return NextResponse.json({ ok: true, petitionId: pet._id });
//   } catch (e) {
//     if (String(e.message).includes('no token')) {
//       return NextResponse.json({ ok: false, error: 'Login required' }, { status: 401 });
//     }
//     console.error('POST /api/petitions failed:', e);
//     return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
//   }
// }


import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { dbConnect } from '@/lib/db';
import Petition from '@/models/Petition';
import Election from '@/models/Election';
import Candidate from '@/models/Candidate';
import Manifesto from '@/models/Manifesto';

async function requireVoter() {
  const c = await cookies();
  const t = c.get('session')?.value;
  if (!t) throw new Error('no token');
  const p = jwt.verify(t, process.env.JWT_SECRET);
  if (!p?.sub) throw new Error('invalid');
  return p.sub; // voter nid
}

/**
 * GET /api/petitions?electionId=...  → returns current voter's petitions
 */
export async function GET(req) {
  try {
    await dbConnect();
    const voterNid = await requireVoter(); // must be logged in as voter

    const sp = req.nextUrl.searchParams;
    const electionId = sp.get('electionId') || null;

    const q = { voterNid };
    if (electionId) q.electionId = electionId;

    const items = await Petition.find(q).sort({ createdAt: -1 }).lean();

    // Attach readable names so the voter sees "what" they petitioned, not database IDs.
    const ids = (k) => [...new Set(items.map(p => String(p[k])).filter(Boolean))];
    const [elections, candidates, manifestos] = await Promise.all([
      Election.find({ _id: { $in: ids('electionId') } }).select('name').lean(),
      Candidate.find({ _id: { $in: ids('candidateId') } }).select('name partyName independent').lean(),
      Manifesto.find({ _id: { $in: ids('manifestoId') } }).select('title').lean(),
    ]);
    const byId = (list) => Object.fromEntries(list.map(x => [String(x._id), x]));
    const E = byId(elections), C = byId(candidates), M = byId(manifestos);
    const data = items.map(p => ({
      ...p,
      electionName: E[String(p.electionId)]?.name || null,
      candidateName: C[String(p.candidateId)]?.name || null,
      manifestoTitle: M[String(p.manifestoId)]?.title || null,
    }));
    return NextResponse.json({ ok: true, data });
  } catch (e) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }
}

/**
 * POST /api/petitions  → file a new petition
 * body: { electionId, candidateId, manifestoId, reason }
 */
export async function POST(req) {
  try {
    await dbConnect();
    const voterNid = await requireVoter();

    const { electionId, candidateId, manifestoId, reason = '' } = await req.json();
    if (!electionId || !candidateId || !manifestoId) {
      return NextResponse.json({ ok: false, error: 'Missing fields' }, { status: 400 });
    }

    // Ensure references exist
    const [e, c, m] = await Promise.all([
      Election.findById(electionId).lean(),
      Candidate.findById(candidateId).lean(),
      Manifesto.findById(manifestoId).lean(),
    ]);
    if (!e || !c || !m) {
      return NextResponse.json({ ok: false, error: 'Invalid references' }, { status: 400 });
    }

    // Prevent duplicate petition by same voter for same manifesto
    const exists = await Petition.findOne({ voterNid, electionId, candidateId, manifestoId }).lean();
    if (exists) {
      return NextResponse.json({
        ok: true,
        already: true,
        petitionId: exists._id,
        message: 'Petition already filed'
      });
    }

    const pet = await Petition.create({
      electionId, candidateId, manifestoId,
      voterNid,
      reason: (reason || '').slice(0, 500),
      status: 'open', // ✅ valid enum value
    });

    return NextResponse.json({ ok: true, petitionId: pet._id });
  } catch (e) {
    if (String(e.message).includes('no token')) {
      return NextResponse.json({ ok: false, error: 'Login required' }, { status: 401 });
    }
    if (String(e).includes('E11000')) {
      return NextResponse.json({ ok: true, already: true, message: 'You already filed this petition' });
    }
    console.error('POST /api/petitions:', e);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
