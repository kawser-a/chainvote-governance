import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Candidate from '@/models/Candidate';

export async function POST(req) {
    await dbConnect();
    try {
        const { candidateId, status } = await req.json();
        if (!candidateId || !status) {
            return NextResponse.json({ ok: false, error: 'Missing candidateId or status' }, { status: 400 });
        }

        // Validate the status
        if (!['approved', 'rejected'].includes(status)) {
            return NextResponse.json({ ok: false, error: 'Invalid status' }, { status: 400 });
        }

        // Update candidate status
        const candidate = await Candidate.findById(candidateId);
        if (!candidate) return NextResponse.json({ ok: false, error: 'Candidate not found' }, { status: 404 });

        candidate.status = status;
        await candidate.save();

        return NextResponse.json({ ok: true, candidate });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
    }
}
