import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { dbConnect } from '@/lib/db';
import Candidate from '@/models/Candidate';

async function requireAdmin() {
  const c = await cookies();
  const t = c.get('admin_session')?.value;
  if (!t) throw new Error('no token');
  const p = jwt.verify(t, process.env.JWT_SECRET);
  if (p.role !== 'admin') throw new Error('not admin');
}

export async function POST(req, { params }) {
  try {
    await requireAdmin();
    await dbConnect();

    const { id } = params;
    const { reason = 'Removed due to verified petitions threshold.' } = await req.json();

    const cand = await Candidate.findByIdAndUpdate(
      id,
      {
        $set: {
          active: false,
          removed: true,
          removedAt: new Date(),
          removedReason: reason,
        },
      },
      { new: true }
    ).lean();

    if (!cand) {
      return NextResponse.json({ ok: false, error: 'Candidate not found' }, { status: 404 });
    }

    return NextResponse.json({ ok: true, candidate: cand });
  } catch (e) {
    console.error('POST /api/admin/candidates/:id/remove', e);
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }
}
