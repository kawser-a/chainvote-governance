import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { dbConnect } from '@/lib/db';
import Voter from '@/models/Voter';

// Returns the signed-in voter. Signed-out visitors get { ok: false } with a 200,
// since "not signed in" is a normal state on public pages, not an error.
export async function GET() {
    const cookieStore = await cookies();
    const token = cookieStore.get('session')?.value;
    if (!token) return NextResponse.json({ ok: false });

    let payload;
    try {
        payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
        return NextResponse.json({ ok: false, expired: true });
    }

    let name = null;
    let seat = null;
    try {
        await dbConnect();
        const voter = await Voter.findOne({ nid: payload.sub }).select('name seat').lean();
        name = voter?.name || null;
        seat = voter?.seat || null;
    } catch (err) {
        console.error('GET /api/me voter lookup', err);
    }

    return NextResponse.json({ ok: true, sub: payload.sub, cc: payload.cc, name, seat });
}
