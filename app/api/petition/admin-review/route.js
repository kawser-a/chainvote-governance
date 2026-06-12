// /app/api/petition/admin-review/route.js
import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Petition from '@/models/Petition';
import Manifesto from '@/models/Manifesto';

export async function POST(req) {
    await dbConnect();
    try {
        const { petitionId, action } = await req.json();
        if (!petitionId || !action) {
            return NextResponse.json({ ok: false, error: 'Missing fields' }, { status: 400 });
        }

        const petition = await Petition.findById(petitionId).populate('manifesto');
        if (!petition) return NextResponse.json({ ok: false, error: 'Petition not found' }, { status: 404 });

        // Admin action on the petition
        if (action === 'remove') {
            // Remove the candidate associated with the manifesto from office
            // You could add more logic here to handle removal
            petition.status = 'removed';
            await petition.save();
        } else if (action === 'alert') {
            // Trigger an alert to the public or media
            petition.status = 'alerted';
            await petition.save();
        } else {
            return NextResponse.json({ ok: false, error: 'Invalid action' }, { status: 400 });
        }

        return NextResponse.json({ ok: true, petition });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
    }
}
