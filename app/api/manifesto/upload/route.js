// app/api/manifesto/upload/route.js
import { dbConnect } from '@/lib/db';
import Manifesto from '@/models/Manifesto';
import Candidate from '@/models/Candidate';
import { NextResponse } from 'next/server';

export async function POST(req) {
    await dbConnect();
    try {
        const { electionId, candidateId, details, timeline } = await req.json();

        if (!electionId || !candidateId || !details || !timeline) {
            return NextResponse.json({ ok: false, error: 'Missing fields' }, { status: 400 });
        }

        // Check if candidate exists and is approved
        const candidate = await Candidate.findOne({ _id: candidateId, election: electionId, status: 'approved' });
        if (!candidate) {
            return NextResponse.json({ ok: false, error: 'Candidate not approved or not part of this election' }, { status: 400 });
        }

        // Create Manifesto
        const manifesto = new Manifesto({ election: electionId, candidate: candidateId, details, timeline });
        await manifesto.save();

        // Link manifesto to the candidate
        candidate.manifesto = manifesto._id;
        await candidate.save();

        return NextResponse.json({ ok: true, manifesto });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
    }
}
