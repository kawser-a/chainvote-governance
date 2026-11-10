import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { dbConnect } from '@/lib/db';
import Candidate from '@/models/Candidate';
import Election from '@/models/Election';

export async function GET() {
    try {
        const c = await cookies();
        const t = c.get('candidate_session')?.value;
        if (!t) return NextResponse.json({ ok: false }, { status: 401 });
        const p = jwt.verify(t, process.env.JWT_SECRET);
        if (p.role !== 'candidate') return NextResponse.json({ ok: false }, { status: 401 });

        await dbConnect();
        const me = await Candidate.findById(p.sub).lean();
        if (!me) return NextResponse.json({ ok: false }, { status: 401 });

        const now = new Date();

        // Prefilter by time; include future+ongoing
        const all = await Election.find({
            status: { $in: ['scheduled', 'active'] },
            endAt: { $gte: new Date(now.getTime() - 5 * 60 * 1000) },
        }).sort({ startAt: 1 }).lean();

        // Seat match or global eligibility
        const seatNorm = (me.seat || '').trim().toLowerCase();
        const data = all.filter(e => {
            const scope = e.eligibility?.scope || 'seat';
            if (scope === 'all' || scope === 'country') return true;
            if (scope === 'seat') {
                const seats = (e.eligibility?.seats && e.eligibility.seats.length ? e.eligibility.seats : e.seats) || [];
                return seats.some(s => (s || '').trim().toLowerCase() === seatNorm);
            }
            // local/presidential/role/etc — candidate visibility:
            if (scope === 'role') return true;        // candidates can still see generally
            if (scope === 'location') return true;    // can view; voting decided on voter side
            return false;
        });

        return NextResponse.json({ ok: true, data });
    } catch (e) {
        console.error('GET /candidate/elections', e);
        return NextResponse.json({ ok: false }, { status: 401 });
    }
}
