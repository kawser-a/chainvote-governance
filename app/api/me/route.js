
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('session')?.value;

        if (!token) {
            return NextResponse.json({ ok: false }, { status: 401 });
        }

        const payload = jwt.verify(token, process.env.JWT_SECRET);
        return NextResponse.json({ ok: true, sub: payload.sub, cc: payload.cc });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ ok: false }, { status: 401 });
    }
}
