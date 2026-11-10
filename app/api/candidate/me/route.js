// // /app/api/candidate/me/route.js
// import { NextResponse } from 'next/server';
// import { cookies } from 'next/headers';
// import jwt from 'jsonwebtoken';
// import { dbConnect } from '@/lib/db';
// import Candidate from '@/models/Candidate';

// export async function GET() {
//     try {
//         const store = await cookies();
//         const token = store.get('candidate_session')?.value;
//         if (!token) return NextResponse.json({ ok: false }, { status: 401 });

//         const payload = jwt.verify(token, process.env.JWT_SECRET);
//         if (payload.role !== 'candidate') {
//             return NextResponse.json({ ok: false }, { status: 401 });
//         }

//         await dbConnect();
//         const c = await Candidate.findById(payload.sub).lean();
//         if (!c) return NextResponse.json({ ok: false }, { status: 401 });

//         return NextResponse.json({
//             ok: true,
//             id: c._id.toString(),
//             name: c.name,
//             email: c.email,
//             seat: c.seat,
//             gender: c.gender,
//             age: c.age,
//             partyPosition: c.partyPosition || '',
//             bio: c.bio || '',
//             education: c.education || [],
//             leadership: c.leadership || [],
//             futureGoals: c.futureGoals || '',
//             currentOccupation: c.currentOccupation || '',
//             speech50: c.speech50 || '',
//         });
//     } catch (e) {
//         console.error('GET /api/candidate/me', e);
//         return NextResponse.json({ ok: false }, { status: 401 });
//     }
// }

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { dbConnect } from '@/lib/db';
import Candidate from '@/models/Candidate';

export async function GET() {
  try {
    const c = await cookies();
    const t = c.get('candidate_session')?.value;
    if (!t) return NextResponse.json({ ok: false }, { status: 401 });

    const p = jwt.verify(t, process.env.JWT_SECRET);
    if (!p?.sub || p.role !== 'candidate') return NextResponse.json({ ok: false }, { status: 401 });

    await dbConnect();

    const cand = await Candidate.findById(p.sub)
      .select('_id name seat partyName independent')
      .lean();

    if (!cand) return NextResponse.json({ ok: false }, { status: 404 });

    return NextResponse.json({
      ok: true,
      _id: cand._id,
      name: cand.name,
      seat: cand.seat,
      partyName: cand.partyName || null,
      independent: !!cand.independent,
    });
  } catch (e) {
    console.error('GET /api/candidate/me', e);
    return NextResponse.json({ ok: false }, { status: 401 });
  }
}
