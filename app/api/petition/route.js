// /app/api/petition/route.js
import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Petition from '@/models/Petition';
import Voter from '@/models/Voter';
import Manifesto from '@/models/Manifesto';
import Election from '@/models/Election';

export async function POST(req) {
    await dbConnect();
    try {
        const { manifestoId, reason, voterId, electionId } = await req.json();
        if (!manifestoId || !reason || !voterId || !electionId) {
            return NextResponse.json({ ok: false, error: 'Missing fields' }, { status: 400 });
        }

        const manifesto = await Manifesto.findById(manifestoId);
        if (!manifesto) return NextResponse.json({ ok: false, error: 'Manifesto not found' }, { status: 404 });

        const election = await Election.findById(electionId);
        if (!election) return NextResponse.json({ ok: false, error: 'Election not found' }, { status: 404 });

        const voter = await Voter.findById(voterId);
        if (!voter) return NextResponse.json({ ok: false, error: 'Voter not found' }, { status: 404 });

        // Create the petition
        const petition = new Petition({
            manifesto: manifestoId,
            election: electionId,
            creator: voterId,
            reason,
            supportThreshold: Math.floor(election.votersCount * 0.1),  // 10% of total voters in election
        });
        await petition.save();

        return NextResponse.json({ ok: true, petition });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
    }
}
