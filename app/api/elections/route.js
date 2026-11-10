// import { NextResponse } from 'next/server';
// import { cookies } from 'next/headers';
// import jwt from 'jsonwebtoken';
// import { dbConnect } from '@/lib/db';
// import Voter from '@/models/Voter';
// import Election from '@/models/Election';
// import { matchesElectionForVoter } from '@/lib/eligibility';

// export async function GET() {
//     try {
//         const c = await cookies();
//         const t = c.get('session')?.value; // voter session
//         if (!t) return NextResponse.json({ ok: false }, { status: 401 });
//         const p = jwt.verify(t, process.env.JWT_SECRET);
//         if (!p?.sub) return NextResponse.json({ ok: false }, { status: 401 });

//         await dbConnect();
//         const voter = await Voter.findOne({ nid: p.sub }).lean();
//         if (!voter) return NextResponse.json({ ok: false }, { status: 401 });

//         const now = new Date();

//         const all = await Election.find({
//             status: { $in: ['scheduled', 'active'] },
//             endAt: { $gte: new Date(now.getTime() - 5 * 60 * 1000) },
//         }).sort({ startAt: 1 }).lean();

//         const data = all.filter(e => matchesElectionForVoter(e, voter));
//         return NextResponse.json({ ok: true, data });
//     } catch (e) {
//         console.error('GET /elections', e);
//         return NextResponse.json({ ok: false }, { status: 401 });
//     }
// }

// /app/api/elections/route.js
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { dbConnect } from '@/lib/db';
import Voter from '@/models/Voter';
import Election from '@/models/Election';
import { matchesElectionForVoter } from '@/lib/eligibility';

export async function GET(req) {
  try {
    const c = await cookies();
    const t = c.get('session')?.value; // voter session
    if (!t) return NextResponse.json({ ok: false }, { status: 401 });
    const p = jwt.verify(t, process.env.JWT_SECRET);
    if (!p?.sub) return NextResponse.json({ ok: false }, { status: 401 });

    await dbConnect();
    const voter = await Voter.findOne({ nid: p.sub }).lean();
    if (!voter) return NextResponse.json({ ok: false }, { status: 401 });

    const sp = req.nextUrl.searchParams;
    const includePast = sp.get('includePast') === '1';

    const now = new Date();
    const q = {
      status: includePast ? { $in: ['scheduled', 'active', 'completed'] } : { $in: ['scheduled', 'active'] },
    };

    // If you only want recent past (e.g., last year)
    if (includePast) {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      q.endAt = { $gte: oneYearAgo };
    } else {
      q.endAt = { $gte: new Date(now.getTime() - 5 * 60 * 1000) };
    }

    const all = await Election.find(q).sort({ startAt: 1 }).lean();
    const data = all.filter(e => matchesElectionForVoter(e, voter));

    return NextResponse.json({ ok: true, data });
  } catch (e) {
    console.error('GET /elections', e);
    return NextResponse.json({ ok: false }, { status: 401 });
  }
}
