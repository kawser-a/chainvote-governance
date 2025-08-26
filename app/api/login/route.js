

import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Voter from '@/models/Voter';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export async function POST(req) {
    await dbConnect();
    try {
        const { nid, pin } = await req.json();
        if (!nid || !pin) {
            return NextResponse.json({ ok: false, error: 'Missing nid or pin' }, { status: 400 });
        }

        const voter = await Voter.findOne({ nid });
        if (!voter || !voter.enrollmentDone) {
            return NextResponse.json({ ok: false, error: 'Not enrolled' }, { status: 401 });
        }

        const ok = await bcrypt.compare(pin, voter.pinHash || '');
        if (!ok) {
            return NextResponse.json({ ok: false, error: 'Invalid credentials' }, { status: 401 });
        }

        // Issue short-lived session (15 minutes)
        const token = jwt.sign(
            { sub: voter.nid, cc: voter.credentialCommitment },
            process.env.JWT_SECRET,
            { expiresIn: '15m' }
        );

        const res = NextResponse.json({
            ok: true,
            nid: voter.nid,
            name: voter.name,
        });
        res.cookies.set('session', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 15 * 60,
        });
        return res;
    } catch (err) {
        console.error(err);
        return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
    }
}
