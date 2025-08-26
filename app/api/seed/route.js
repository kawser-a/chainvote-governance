import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Voter from '@/models/Voter';

export async function POST() {
    await dbConnect();
    const data = [
        { nid: '1990123456789', name: 'Rahim Uddin', sims: ['01711111111', '01822222222'] },
        { nid: '1999987654321', name: 'Ayesha Khatun', sims: ['01933333333', '01644444444'] },
        { nid: '2001123409876', name: 'Shahid Hasan', sims: ['01555555555'] },
    ];
    for (const d of data) {
        await Voter.updateOne({ nid: d.nid }, { $setOnInsert: d }, { upsert: true });
    }
    return NextResponse.json({ ok: true, inserted: data.length });
}
