// // import { NextResponse } from 'next/server';
// // import { cookies } from 'next/headers';
// // import jwt from 'jsonwebtoken';
// // import { dbConnect } from '@/lib/db';
// // import Manifesto from '@/models/Manifesto';
// // import Candidate from '@/models/Candidate';

// // async function auth() {
// //     const c = await cookies();
// //     const t = c.get('candidate_session')?.value;
// //     if (!t) throw new Error('no token');
// //     const p = jwt.verify(t, process.env.JWT_SECRET);
// //     if (p.role !== 'candidate') throw new Error('not candidate');
// //     return p.sub;
// // }

// // export async function GET() {
// //     try {
// //         const cid = await auth();
// //         await dbConnect();
// //         const items = await Manifesto.find({ candidateId: cid }).sort({ createdAt: -1 }).lean();
// //         return NextResponse.json({ ok: true, data: items });
// //     } catch {
// //         return NextResponse.json({ ok: false }, { status: 401 });
// //     }
// // }
// // export async function POST(req) {
// //     try {
// //         const cid = await auth();
// //         await dbConnect();

// //         const { title, summary, milestones = [] } = await req.json();

// //         if (!title?.trim()) return NextResponse.json({ ok: false, error: 'Title is required' }, { status: 400 });
// //         if (!summary?.trim()) return NextResponse.json({ ok: false, error: 'Description is required' }, { status: 400 });

// //         // require at least one milestone with targetDate
// //         if (!Array.isArray(milestones) || milestones.length === 0) {
// //             return NextResponse.json({ ok: false, error: 'At least one timeline is required' }, { status: 400 });
// //         }
// //         const cleaned = milestones.map(x => ({
// //             title: (x.title || '').trim(),
// //             targetDate: x.targetDate ? new Date(x.targetDate) : null
// //         }));
// //         if (cleaned.some(x => !x.title || !x.targetDate || isNaN(x.targetDate))) {
// //             return NextResponse.json({ ok: false, error: 'Each timeline needs a title and a valid date' }, { status: 400 });
// //         }

// //         const c = await Candidate.findById(cid).lean();
// //         const m = await Manifesto.create({
// //             candidateId: cid,
// //             seat: c.seat,
// //             title: title.trim(),
// //             summary: summary.trim(),
// //             milestones: cleaned,
// //             status: 'pending',
// //         });

// //         return NextResponse.json({ ok: true, manifesto: m });
// //     } catch (e) {
// //         console.error(e);
// //         return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
// //     }
// // }

// import { NextResponse } from 'next/server';
// import { cookies } from 'next/headers';
// import jwt from 'jsonwebtoken';
// import { dbConnect } from '@/lib/db';
// import Manifesto from '@/models/Manifesto';
// import Candidate from '@/models/Candidate';

// async function auth() {
//     const c = await cookies();
//     const t = c.get('candidate_session')?.value;
//     if (!t) throw new Error('no token');
//     const p = jwt.verify(t, process.env.JWT_SECRET);
//     if (p.role !== 'candidate') throw new Error('not candidate');
//     return p.sub;
// }

// export async function GET() {
//     try {
//         const cid = await auth();
//         await dbConnect();
//         const items = await Manifesto.find({ candidateId: cid }).sort({ createdAt: -1 }).lean();
//         return NextResponse.json({ ok: true, data: items });
//     } catch {
//         return NextResponse.json({ ok: false }, { status: 401 });
//     }
// }

// export async function POST(req) {
//     try {
//         const cid = await auth();
//         await dbConnect();

//         const { title, summary, targetWindowMonths } = await req.json();

//         if (!title?.trim())
//             return NextResponse.json({ ok: false, error: 'Title is required' }, { status: 400 });
//         if (!summary?.trim())
//             return NextResponse.json({ ok: false, error: 'Description is required' }, { status: 400 });

//         const months = Number(targetWindowMonths);
//         if (!Number.isInteger(months) || months < 1 || months > 60) {
//             return NextResponse.json(
//                 { ok: false, error: 'Target window must be between 1 and 60 months' },
//                 { status: 400 }
//             );
//         }

//         const cand = await Candidate.findById(cid).lean();
//         if (!cand) return NextResponse.json({ ok: false, error: 'Candidate not found' }, { status: 404 });

//         const m = await Manifesto.create({
//             candidateId: cid,
//             seat: cand.seat,
//             title: title.trim(),
//             summary: summary.trim(),
//             targetWindowMonths: months,  // ✅ store fixed duration
//             status: 'pending',           // ✅ requires admin approval
//         });

//         return NextResponse.json({ ok: true, manifesto: m });
//     } catch (e) {
//         console.error(e);
//         return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
//     }
// }

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { dbConnect } from '@/lib/db';
import Manifesto from '@/models/Manifesto';
import Candidate from '@/models/Candidate';

async function auth() {
  const c = await cookies();
  const t = c.get('candidate_session')?.value;
  if (!t) throw new Error('no token');
  const p = jwt.verify(t, process.env.JWT_SECRET);
  if (p.role !== 'candidate') throw new Error('not candidate');
  return p.sub; // candidate id
}

/**
 * GET: return the candidate's own manifestos
 */
export async function GET() {
  try {
    const cid = await auth();
    await dbConnect();

    const items = await Manifesto.find(
      { candidateId: cid },
      // explicit projection ensures fields exist in JSON
      {
        _id: 1,
        candidateId: 1,
        seat: 1,
        title: 1,
        summary: 1,
        targetWindowMonths: 1,
        targetWindowMinutes: 1,
        status: 1,
        createdAt: 1,
        updatedAt: 1,
      }
    )
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ ok: true, data: items });
  } catch (e) {
    console.error('GET /api/candidate/manifestos failed', e);
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }
}

/**
 * POST: create a manifesto with months/minutes-based duration
 * body = {
 *  title, summary,
 *  durationUnit: 'months' | 'minutes',
 *  targetWindowMonths?: number,
 *  targetWindowMinutes?: number
 * }
 */
export async function POST(req) {
  try {
    const cid = await auth();
    await dbConnect();

    const body = await req.json();
    const title = (body.title || '').trim();
    const summary = (body.summary || '').trim();
    const durationUnit = (body.durationUnit || 'months').toLowerCase();

    if (!title || title.length < 5) {
      return NextResponse.json({ ok: false, error: 'Title must be at least 5 characters' }, { status: 400 });
    }
    if (!summary || summary.length < 10) {
      return NextResponse.json({ ok: false, error: 'Description must be at least 10 characters' }, { status: 400 });
    }
    if (!['months', 'minutes'].includes(durationUnit)) {
      return NextResponse.json({ ok: false, error: 'Invalid duration unit' }, { status: 400 });
    }

    const cand = await Candidate.findById(cid).lean();
    if (!cand) return NextResponse.json({ ok: false, error: 'Candidate not found' }, { status: 404 });

    const doc = {
      candidateId: cid,
      seat: cand.seat,
      title,
      summary,
      status: 'pending',
    };

    if (durationUnit === 'minutes') {
      const mins = Number(body.targetWindowMinutes);
      if (!mins || mins < 1) {
        return NextResponse.json({ ok: false, error: 'Minutes must be >= 1' }, { status: 400 });
      }
      doc.targetWindowMinutes = mins;
      doc.targetWindowMonths = undefined;
    } else {
      const months = Number(body.targetWindowMonths);
      if (!months || months < 1) {
        return NextResponse.json({ ok: false, error: 'Months must be >= 1' }, { status: 400 });
      }
      doc.targetWindowMonths = months;
      doc.targetWindowMinutes = undefined;
    }

    const m = await Manifesto.create(doc);
    return NextResponse.json({ ok: true, manifesto: m });
  } catch (e) {
    console.error('POST /api/candidate/manifestos failed', e);
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }
}
