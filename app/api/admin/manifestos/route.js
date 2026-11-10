// import { NextResponse } from 'next/server';
// import { cookies } from 'next/headers';
// import jwt from 'jsonwebtoken';
// import { dbConnect } from '@/lib/db';
// import Manifesto from '@/models/Manifesto';
// import mongoose from 'mongoose';

// async function requireAdmin() {
//     const c = await cookies();
//     const t = c.get('admin_session')?.value;
//     if (!t) throw new Error('no token');
//     const p = jwt.verify(t, process.env.JWT_SECRET);
//     if (p.role !== 'admin') throw new Error('not admin');
// }

// export async function GET(req) {
//     try {
//         await requireAdmin();
//         await dbConnect();

//         const sp = req.nextUrl.searchParams;
//         const page = Math.max(1, parseInt(sp.get('page') || '1', 10));
//         const limit = Math.min(100, Math.max(5, parseInt(sp.get('limit') || '20', 10)));
//         const status = sp.get('status') || 'pending'; // pending | approved | rejected | all
//         const seat = sp.get('seat') || '';
//         const search = sp.get('search') || '';
//         const sortBy = sp.get('sortBy') || 'createdAt'; // createdAt | title | seat | candidate
//         const sortOrder = (sp.get('sortOrder') || 'desc') === 'asc' ? 1 : -1;

//         const match = {};
//         if (seat) match.seat = seat;
//         if (status && status !== 'all') match.status = status;
//         if (search) match.title = { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };

//         const sort = {};
//         if (sortBy === 'candidate') sort['cand.name'] = sortOrder;
//         else sort[sortBy] = sortOrder;

//         // ...
//         const pipeline = [
//             { $match: match },
//             { $lookup: { from: 'candidates', localField: 'candidateId', foreignField: '_id', as: 'cand' } },
//             { $unwind: '$cand' },
//             {
//                 $project: {
//                     title: 1,
//                     summary: 1,
//                     // ⬇️ include the fixed duration
//                     targetWindowMonths: 1,
//                     status: 1,
//                     seat: 1,
//                     createdAt: 1,
//                     candidate: {
//                         _id: '$cand._id',
//                         name: '$cand.name',
//                         partyName: '$cand.partyName',
//                         independent: '$cand.independent',
//                     },
//                 },
//             },
//             { $sort: sort },
//             {
//                 $facet: {
//                     items: [{ $skip: (page - 1) * limit }, { $limit: limit }],
//                     meta: [{ $count: 'total' }],
//                 },
//             },
//         ];
//         // ...


//         // const pipeline = [
//         //     { $match: match },
//         //     { $lookup: { from: 'candidates', localField: 'candidateId', foreignField: '_id', as: 'cand' } },
//         //     { $unwind: '$cand' },
//         //     {
//         //         $project: {
//         //             title: 1, summary: 1, milestones: 1, status: 1, seat: 1, createdAt: 1,
//         //             candidate: { _id: '$cand._id', name: '$cand.name', partyName: '$cand.partyName', independent: '$cand.independent' }
//         //         }
//         //     },
//         //     { $sort: sort },
//         //     {
//         //         $facet: {
//         //             items: [
//         //                 { $skip: (page - 1) * limit },
//         //                 { $limit: limit }
//         //             ],
//         //             meta: [{ $count: 'total' }]
//         //         }
//         //     },
//         // ];

//         const [res] = await Manifesto.aggregate(pipeline);
//         const items = res?.items || [];
//         const total = res?.meta?.[0]?.total || 0;

//         return NextResponse.json({ ok: true, page, limit, total, totalPages: Math.ceil(total / limit), data: items });
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
    const page = Math.max(1, parseInt(sp.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(5, parseInt(sp.get('limit') || '20', 10)));
    const status = sp.get('status') || 'pending'; // pending | approved | rejected | all
    const seat = sp.get('seat') || '';
    const search = sp.get('search') || '';
    const sortBy = sp.get('sortBy') || 'createdAt'; // createdAt | title | seat | candidate
    const sortOrder = (sp.get('sortOrder') || 'desc') === 'asc' ? 1 : -1;

    const match = {};
    if (seat) match.seat = seat;
    if (status && status !== 'all') match.status = status;
    if (search) {
      match.title = { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
    }

    const sort = {};
    if (sortBy === 'candidate') sort['cand.name'] = sortOrder;
    else sort[sortBy] = sortOrder;

    const pipeline = [
      { $match: match },
      {
        $lookup: {
          from: 'candidates',
          localField: 'candidateId',
          foreignField: '_id',
          as: 'cand'
        }
      },
      { $unwind: '$cand' },
      {
        $project: {
          title: 1,
          summary: 1,
          seat: 1,
          status: 1,
          createdAt: 1,
          // ⬇️ include both fields for Admin UI
          targetWindowMonths: 1,
          targetWindowMinutes: 1,
          candidate: {
            _id: '$cand._id',
            name: '$cand.name',
            partyName: '$cand.partyName',
            independent: '$cand.independent'
          }
        }
      },
      { $sort: sort },
      {
        $facet: {
          items: [
            { $skip: (page - 1) * limit },
            { $limit: limit }
          ],
          meta: [{ $count: 'total' }]
        }
      }
    ];

    const [res] = await Manifesto.aggregate(pipeline);
    const items = res?.items || [];
    const total = res?.meta?.[0]?.total || 0;

    return NextResponse.json({
      ok: true,
      page, limit,
      total,
      totalPages: Math.ceil(total / limit),
      data: items
    });
  } catch (e) {
    console.error('GET /api/admin/manifestos failed', e);
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }
}
