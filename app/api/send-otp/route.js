import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Voter from '@/models/Voter';
import Otp from '@/models/Otp';

function randomOtp() {
    return (Math.floor(100000 + Math.random() * 900000)).toString();
}

export async function POST(req) {
    await dbConnect();
    try {
        const body = await req.json();
        const { nid, msisdn } = body;
        if (!nid || !msisdn) return NextResponse.json({ ok: false, error: 'Missing nid or msisdn' }, { status: 400 });

        const voter = await Voter.findOne({ nid });
        if (!voter) return NextResponse.json({ ok: false, error: 'Voter not found' }, { status: 404 });
        if (!voter.sims.includes(msisdn)) return NextResponse.json({ ok: false, error: 'SIM not linked to this NID' }, { status: 400 });

        const code = randomOtp();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
        await Otp.create({ nid, msisdn, code, expiresAt, purpose: 'enroll' });

        // DEV ONLY: return OTP in response so you can test without SMS gateway.
        // In production: integrate SMS provider and DO NOT return code.
        return NextResponse.json({ ok: true, devOtp: code, expiresAt });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
    }
}
