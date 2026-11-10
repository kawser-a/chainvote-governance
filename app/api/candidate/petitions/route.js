// /app/api/candidate/petitions/route.js
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { dbConnect } from '@/lib/db';
import Petition from '@/models/Petition';
import Manifesto from '@/models/Manifesto';
import Election from '@/models/Election';
import mongoose from 'mongoose';

async function candidateAuth() {
  const c = await cookies();
  const t = c.get('candidate_session')?.value;
  if (!t) throw new Error('no token');
  const p = jwt.verify(t, process.env.JWT_SECRET);
  if (p.role !== 'candidate') throw new Error('not candidate');
  return p.sub;
}

export async function GET(req) {
  try {
    await dbConnect();
    const cid = await candidateAuth();

    const sp = req.nextUrl.searchParams;
    const electionId = sp.get('electionId') || null;
    const status = sp.get('status') || 'open';

    const mIds = await Manifesto.find({ candidateId: cid }, { _id: 1 }).lean();
    const manifestIds = mIds.map(m => m._id);

    const q = { manifestoId: { $in: manifestIds } };
    if (status !== 'all') q.status = status;
    if (electionId) q.electionId = new mongoose.Types.ObjectId(electionId);

    const items = await Petition.aggregate([
      { $match: q },
      { $lookup: { from: 'elections', localField: 'electionId', foreignField: '_id', as: 'e' } },
      { $unwind: '$e' },
      { $lookup: { from: 'manifestos', localField: 'manifestoId', foreignField: '_id', as: 'm' } },
      { $unwind: '$m' },
      {
        $project: {
          voterNid: 1, reason: 1, status: 1, createdAt: 1,
          election: { _id: '$e._id', name: '$e.name' },
          manifesto: { _id: '$m._id', title: '$m.title', targetWindowMonths: '$m.targetWindowMonths' },
        }
      },
      { $sort: { createdAt: -1 } },
    ]);

    return NextResponse.json({ ok: true, items });
  } catch (err) {
    console.error('GET /api/candidate/petitions', err);
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }
}
