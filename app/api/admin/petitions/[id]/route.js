import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { dbConnect } from '@/lib/db';
import Petition from '@/models/Petition';

async function requireAdmin() {
  const c = await cookies();
  const t = c.get('admin_session')?.value;
  if (!t) throw new Error('no token');
  const p = jwt.verify(t, process.env.JWT_SECRET);
  if (p.role !== 'admin') throw new Error('not admin');
}

export async function PATCH(req, { params }) {
  try {
    await requireAdmin();
    await dbConnect();
    const { id } = params;

    const { status } = await req.json();
    const allowed = ['open', 'under_review', 'verified', 'rejected', 'resolved'];
    if (!allowed.includes(status)) {
      return NextResponse.json({ ok: false, error: 'Invalid status' }, { status: 400 });
    }

    const updated = await Petition.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true }
    ).lean();
    if (!updated) return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });

    return NextResponse.json({ ok: true, petition: updated });
  } catch (e) {
    console.error('PATCH /api/admin/petitions/:id', e);
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }
}
