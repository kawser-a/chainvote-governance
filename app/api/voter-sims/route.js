import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Voter from '@/models/Voter';

export async function GET(req) {
    await dbConnect();
    try {
        const nid = req.nextUrl.searchParams.get('nid');
        if (!nid) return NextResponse.json({ ok: false, error: 'Missing nid' }, { status: 400 });
        const voter = await Voter.findOne({ nid });
        if (!voter) return NextResponse.json({ ok: false, error: 'Voter not found' }, { status: 404 });
        return NextResponse.json({ ok: true, nid: voter.nid, name: voter.name, sims: voter.sims });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
    }
}
