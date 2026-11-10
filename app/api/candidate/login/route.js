import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Candidate from '@/models/Candidate';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export async function POST(req) {
    await dbConnect();
    try {
        const { email, password } = await req.json();
        const c = await Candidate.findOne({ email });
        if (!c || !c.active || !c.approved) {
            return NextResponse.json({ ok: false, error: 'Access denied' }, { status: 401 });
        }
        const ok = await bcrypt.compare(password, c.passwordHash);
        if (!ok) return NextResponse.json({ ok: false, error: 'Invalid credentials' }, { status: 401 });

        const token = jwt.sign(
            { sub: c._id.toString(), role: 'candidate', seat: c.seat, name: c.name, email: c.email },
            process.env.JWT_SECRET,
            { expiresIn: '60m' }
        );

        const res = NextResponse.json({ ok: true });
        res.cookies.set('candidate_session', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60,
        });
        return res;
    } catch (e) {
        console.error(e);
        return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
    }
}
