// app/api/election/create/route.js
import { dbConnect } from '@/lib/db';
import Election from '@/models/Election';
import { NextResponse } from 'next/server';

export async function POST(req) {
    await dbConnect();
    try {
        const { type, status, startDate, endDate, location, electionType } = await req.json();

        if (!type || !status || !startDate || !endDate || !electionType) {
            return NextResponse.json({ ok: false, error: 'Missing fields' }, { status: 400 });
        }

        const election = new Election({
            type,
            status,
            startDate,
            endDate,
            location,
            electionType,
        });

        await election.save();
        return NextResponse.json({ ok: true, election });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
    }
}
