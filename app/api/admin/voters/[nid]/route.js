import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Voter from '@/models/Voter';

export async function PATCH(req, { params }) {
  await dbConnect();
  const { nid } = params;
  const body = await req.json();
  const { action } = body || {};

  if (!action) {
    return NextResponse.json({ ok: false, error: 'Missing action' }, { status: 400 });
  }

  const update = {};
  if (action === 'ban') update.status = 'banned';
  if (action === 'unban') update.status = 'active';
  if (action === 'disableVoting') update.disabledVoting = true;
  if (action === 'enableVoting') update.disabledVoting = false;
  if (action === 'flagSuspicious') update.$inc = { suspiciousCount: 1 };

  if (!Object.keys(update).length) {
    return NextResponse.json({ ok: false, error: 'Invalid action' }, { status: 400 });
  }

  const voter = await Voter.findOneAndUpdate({ nid }, update, { new: true }).select('nid name seat status disabledVoting suspiciousCount');
  if (!voter) return NextResponse.json({ ok: false, error: 'Voter not found' }, { status: 404 });

  return NextResponse.json({ ok: true, voter });
}
