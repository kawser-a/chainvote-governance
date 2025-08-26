// app/api/test/route.js
import { NextResponse } from 'next/server';

export async function GET() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set('hello', 'world', {
    httpOnly: true,
    secure: false,   // must be false on localhost
    sameSite: 'lax',
    path: '/',
    maxAge: 60,
  });
  return res;
}
