// /app/api/petition/support/route.js
import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Petition from '@/models/Petition';
import Voter from '@/models/Voter';

export async function POST(req) {
    await dbConnect();
    try {
        const { petitionId, voterId } = await req.json();
        if (!petitionId || !voterId) {
            return NextResponse.json({ ok: false, error: 'Missing fields' }, { status: 400 });
        }

        const petition = await Petition.findById(petitionId);
        if (!petition) return NextResponse.json({ ok: false, error: 'Petition not found' }, { status: 404 });

        const voter = await Voter.findById(voterId);
        if (!voter) return NextResponse.json({ ok: false, error: 'Voter not found' }, { status: 404 });

        // Increment the support count
        petition.voteCount += 1;
        await petition.save();

        // Check if the petition has reached the support threshold
        if (petition.voteCount >= petition.supportThreshold) {
            petition.status = 'resolved';
            // Trigger admin alert or review action here
            await petition.save();
        }

        return NextResponse.json({ ok: true, petition });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
    }
}
