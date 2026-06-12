// app/api/vote/route.js
import { dbConnect } from '@/lib/db';
import Vote from '@/models/Vote';
import { NextResponse } from 'next/server';

export async function POST(req) {
    await dbConnect();
    try {
        const { manifestoId, voterId, electionId } = await req.json();

        if (!manifestoId || !voterId || !electionId) {
            return NextResponse.json({ ok: false, error: 'Missing fields' }, { status: 400 });
        }

        // Create a vote
        const vote = new Vote({ manifesto: manifestoId, voter: voterId, election: electionId });
        await vote.save();

        return NextResponse.json({ ok: true, vote });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
    }
}
