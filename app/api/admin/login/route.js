import { NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';
import jwt from 'jsonwebtoken';

// Admin credentials come from the environment so they never live in the repo.
const ADMIN_USER = process.env.ADMIN_USERNAME;
const ADMIN_PASS = process.env.ADMIN_PASSWORD;

function safeEqual(a, b) {
  const x = Buffer.from(String(a ?? ''));
  const y = Buffer.from(String(b ?? ''));
  return x.length === y.length && timingSafeEqual(x, y);
}

export async function POST(req) {
  if (!ADMIN_USER || !ADMIN_PASS) {
    console.error('Admin login is not configured: set ADMIN_USERNAME and ADMIN_PASSWORD');
    return NextResponse.json({ ok: false, error: 'Admin login is not configured' }, { status: 500 });
  }

  try {
    const { username, password } = await req.json();
    if (!safeEqual(username, ADMIN_USER) || !safeEqual(password, ADMIN_PASS)) {
      return NextResponse.json({ ok: false, error: 'Invalid credentials' }, { status: 401 });
    }

    const token = jwt.sign({ role: 'admin', sub: username }, process.env.JWT_SECRET, { expiresIn: '1h' });

    const res = NextResponse.json({ ok: true });
    res.cookies.set('admin_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60,
    });
    return res;
  } catch {
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
