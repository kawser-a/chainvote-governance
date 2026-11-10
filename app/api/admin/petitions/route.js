// // import { NextResponse } from 'next/server';
// // import { cookies } from 'next/headers';
// // import jwt from 'jsonwebtoken';
// // import { dbConnect } from '@/lib/db';
// // import Petition from '@/models/Petition';

// // async function requireAdmin() {
// //   const c = await cookies();
// //   const t = c.get('admin_session')?.value;
// //   if (!t) throw new Error('no token');
// //   const p = jwt.verify(t, process.env.JWT_SECRET);
// //   if (p.role !== 'admin') throw new Error('not admin');
// //   return p.sub;
// // }

// // export async function GET(req) {
// //   try {
// //     await requireAdmin();
// //     await dbConnect();

// //     const sp = req.nextUrl.searchParams;
// //     const status = sp.get('status') || 'all';
// //     const q = {};
// //     if (status !== 'all') q.status = status;

// //     const items = await Petition.find(q).sort({ createdAt: -1 }).lean();
// //     return NextResponse.json({ ok: true, data: items });
// //   } catch {
// //     return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
// //   }
// // }

// // export async function PATCH(req) {
// //   try {
// //     await requireAdmin();
// //     await dbConnect();

// //     const { id, status } = await req.json();
// //     if (!id || !['open', 'under_review', 'accepted', 'rejected', 'dismissed'].includes(status)) {
// //       return NextResponse.json({ ok: false, error: 'Invalid' }, { status: 400 });
// //     }

// //     const upd = await Petition.findByIdAndUpdate(id, { $set: { status } }, { new: true });
// //     if (!upd) return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });
// //     return NextResponse.json({ ok: true, petition: upd });
// //   } catch {
// //     return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
// //   }
// // }

// import { NextResponse } from 'next/server';
// import { cookies } from 'next/headers';
// import jwt from 'jsonwebtoken';
// import { dbConnect } from '@/lib/db';
// import Petition from '@/models/Petition';

// async function requireAdmin() {
//   const c = await cookies();
//   const t = c.get('admin_session')?.value;
//   if (!t) throw new Error('no token');
//   const p = jwt.verify(t, process.env.JWT_SECRET);
//   if (p.role !== 'admin') throw new Error('not admin');
// }

// export async function GET(req) {
//   try {
//     await requireAdmin();
//     await dbConnect();

//     const sp = req.nextUrl.searchParams;
//     const page = Math.max(1, parseInt(sp.get('page') || '1', 10));
//     const limit = Math.min(100, Math.max(10, parseInt(sp.get('limit') || '20', 10)));
//     const status = sp.get('status') || 'all';
//     const seat = sp.get('seat') || '';
//     const electionId = sp.get('electionId') || '';
//     const candidateId = sp.get('candidateId') || '';
//     const manifestId = sp.get('manifestoId') || '';
//     const search = sp.get('search') || ''; // reason search

//     const match = {};
//     if (status && status !== 'all') match.status = status;
//     if (seat) match.seat = seat;
//     if (electionId) match.electionId = { $eq: electionId };
//     if (candidateId) match.candidateId = { $eq: candidateId };
//     if (manifestId) match.manifestoId = { $eq: manifestId };
//     if (search) {
//       match.reason = { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
//     }

//     const pipeline = [
//       { $match: match },
//       { $sort: { createdAt: -1 } },
//       {
//         $lookup: {
//           from: 'elections',
//           localField: 'electionId',
//           foreignField: '_id',
//           as: 'e',
//         },
//       },
//       { $unwind: { path: '$e', preserveNullAndEmptyArrays: true } },
//       {
//         $lookup: {
//           from: 'candidates',
//           localField: 'candidateId',
//           foreignField: '_id',
//           as: 'c',
//         },
//       },
//       { $unwind: { path: '$c', preserveNullAndEmptyArrays: true } },
//       {
//         $lookup: {
//           from: 'manifestos',
//           localField: 'manifestoId',
//           foreignField: '_id',
//           as: 'm',
//         },
//       },
//       { $unwind: { path: '$m', preserveNullAndEmptyArrays: true } },
//       {
//         $project: {
//           electionId: 1,
//           candidateId: 1,
//           manifestoId: 1,
//           voterNid: 1,
//           seat: 1,
//           reason: 1,
//           requestRemoval: 1,
//           status: 1,
//           createdAt: 1,
//           updatedAt: 1,
//           election: { _id: '$e._id', name: '$e.name', type: '$e.type', ballotType: '$e.ballotType' },
//           candidate: {
//             _id: '$c._id',
//             name: '$c.name',
//             partyName: '$c.partyName',
//             independent: '$c.independent',
//             seat: '$c.seat',
//           },
//           manifesto: {
//             _id: '$m._id',
//             title: '$m.title',
//             targetWindowMonths: '$m.targetWindowMonths',
//             targetWindowMinutes: '$m.targetWindowMinutes',
//           },
//         },
//       },
//       {
//         $facet: {
//           items: [{ $skip: (page - 1) * limit }, { $limit: limit }],
//           meta: [{ $count: 'total' }],
//         },
//       },
//     ];

//     const [res] = await Petition.aggregate(pipeline);
//     const items = res?.items || [];
//     const total = res?.meta?.[0]?.total || 0;

//     return NextResponse.json({
//       ok: true,
//       page, limit,
//       total,
//       totalPages: Math.ceil(total / limit),
//       data: items,
//     });
//   } catch (e) {
//     console.error('GET /api/admin/petitions', e);
//     return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
//   }
// }

// /app/api/admin/petitions/route.js
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { dbConnect } from '@/lib/db';
import Petition from '@/models/Petition';
import '@/models/Election';
import '@/models/Candidate';
import '@/models/Manifesto';

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
    const electionId = sp.get('electionId') || null;
    const candidateId = sp.get('candidateId') || null;
    const status = sp.get('status') || 'all';

    const q = {};
    if (electionId) q.electionId = electionId;
    if (candidateId) q.candidateId = candidateId;
    if (status && status !== 'all') q.status = status;

    const items = await Petition.find(q)
      .sort({ createdAt: -1 })
      .populate('electionId', 'name')
      .populate('candidateId', 'name seat partyName independent')
      .populate('manifestoId', 'title')
      .lean();

    // Flatten so the page can show names instead of raw ids.
    const data = items.map((p) => ({
      _id: p._id,
      status: p.status,
      reason: p.reason,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      voterNid: p.voterNid,
      electionId: p.electionId?._id || p.electionId,
      electionName: p.electionId?.name || null,
      candidateId: p.candidateId?._id || p.candidateId,
      candidateName: p.candidateId?.name || null,
      seat: p.candidateId?.seat || null,
      partyName: p.candidateId?.independent ? null : p.candidateId?.partyName || null,
      manifestoId: p.manifestoId?._id || p.manifestoId,
      manifestoTitle: p.manifestoId?.title || null,
    }));

    return NextResponse.json({ ok: true, data });
  } catch (e) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }
}
