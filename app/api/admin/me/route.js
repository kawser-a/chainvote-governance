import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function GET(req) {
  try {
    const token = req.cookies.get('admin_session')?.value;
    if (!token) return NextResponse.json({ ok: false }, { status: 401 });
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.role !== 'admin') throw new Error('Not admin');
    return NextResponse.json({ ok: true, username: payload.sub });
  } catch {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
}
