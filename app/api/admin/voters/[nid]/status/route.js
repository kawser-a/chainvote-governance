import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { dbConnect } from '@/lib/db';
import Voter from '@/models/Voter';

async function requireAdmin() {
  const cookieStore = await cookies();
  const t = cookieStore.get('admin_session')?.value;
  if (!t) throw new Error('no token');
  const p = jwt.verify(t, process.env.JWT_SECRET);
  if (p.role !== 'admin') throw new Error('not admin');
}

export async function PATCH(req, { params }) {
  try {
    await requireAdmin();
    await dbConnect();

    const nid = params.nid;
    const body = await req.json();

    const voter = await Voter.findOne({ nid });
    if (!voter) return NextResponse.json({ ok: false, error: 'Voter not found' }, { status: 404 });

    if (typeof body.isBanned === 'boolean') voter.isBanned = body.isBanned;
    if (typeof body.canVote === 'boolean') voter.canVote = body.canVote;

    // ✅ Business rule: banned users cannot vote
    if (voter.isBanned) voter.canVote = false;

    await voter.save();

    const { pinHash, credentialSecret, ...safe } = voter.toObject();
    return NextResponse.json({ ok: true, voter: safe });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }
}
