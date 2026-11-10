import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { dbConnect } from '@/lib/db';
import Voter from '@/models/Voter';
import Manifesto from '@/models/Manifesto';
import Election from '@/models/Election';
import Vote from '@/models/Vote';
import crypto from 'crypto';

async function voterAuth() {
    const store = await cookies();
    const t = store.get('session')?.value;
    if (!t) throw new Error('no token');
    const p = jwt.verify(t, process.env.JWT_SECRET);
    return p.sub; // voter nid
}

export async function POST(req) {
    try {
        await dbConnect();
        const voterNid = await voterAuth();
        const { manifestoId, electionId } = await req.json();

        // voter info & eligibility
        const voter = await Voter.findOne({ nid: voterNid }).lean();
        if (!voter || !voter.pinHash || !voter.canVote || voter.isBanned) {
            return NextResponse.json({ ok: false, error: 'Not eligible' }, { status: 403 });
        }

        const m = await Manifesto.findById(manifestoId).lean();
        if (!m || m.status !== 'approved') return NextResponse.json({ ok: false, error: 'Invalid manifesto' }, { status: 400 });

        const e = await Election.findById(electionId).lean();
        if (!e || e.seat !== m.seat) return NextResponse.json({ ok: false, error: 'Invalid election/seat' }, { status: 400 });

        const now = new Date();
        if (now < e.startAt || now > e.endAt) return NextResponse.json({ ok: false, error: 'Election not open' }, { status: 400 });

        // simple hash-chain for audit
        const last = await Vote.findOne({ electionId }).sort({ createdAt: -1 }).lean();
        const prevHash = last?.hash || null;
        const content = `${voterNid}:${manifestoId}:${electionId}:${now.toISOString()}:${prevHash || ''}`;
        const hash = crypto.createHash('sha256').update(content).digest('hex');

        const v = await Vote.create({
            electionId: e._id,
            manifestoId: m._id,
            voterNid,
            seat: m.seat,
            prevHash,
            hash,
        });

        return NextResponse.json({ ok: true, voteId: v._id });
    } catch (e) {
        if (String(e).includes('E11000')) {
            return NextResponse.json({ ok: false, error: 'Already voted for this manifesto' }, { status: 409 });
        }
        console.error(e);
        return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }
}
