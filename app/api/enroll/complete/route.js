import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Voter from '@/models/Voter';
import Otp from '@/models/Otp';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

function sha256_hex(str) {
    return crypto.createHash('sha256').update(str).digest('hex');
}

export async function POST(req) {
    await dbConnect();
    try {
        const { nid, msisdn, otp, pin } = await req.json();
        if (!nid || !msisdn || !otp || !pin) {
            return NextResponse.json({ ok: false, error: 'Missing fields' }, { status: 400 });
        }
        const voter = await Voter.findOne({ nid });
        if (!voter) return NextResponse.json({ ok: false, error: 'Voter not found' }, { status: 404 });
        if (!voter.sims.includes(msisdn)) return NextResponse.json({ ok: false, error: 'SIM not linked' }, { status: 400 });

        const record = await Otp.findOne({ nid, msisdn, code: otp, purpose: 'enroll', used: false }).sort({ createdAt: -1 });
        if (!record) return NextResponse.json({ ok: false, error: 'OTP invalid' }, { status: 400 });
        if (record.expiresAt < new Date()) return NextResponse.json({ ok: false, error: 'OTP expired' }, { status: 400 });

        // mark OTP used
        record.used = true;
        await record.save();

        // Hash PIN and create credential
        const pinHash = await bcrypt.hash(pin, 10);
        const credentialSecret = crypto.randomBytes(32).toString('hex');
        const credentialCommitment = sha256_hex(`${nid}:${credentialSecret}`);
        const revocationHandle = sha256_hex(`${nid}:rev:${Date.now()}`);

        voter.primarySim = msisdn;
        voter.pinHash = pinHash;
        voter.credentialSecret = credentialSecret;
        voter.credentialCommitment = credentialCommitment;
        voter.revocationHandle = revocationHandle;
        voter.enrollmentDone = true;
        await voter.save();

        return NextResponse.json({ ok: true, credentialCommitment });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
    }
}
