import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { dbConnect } from '@/lib/db';
import Voter from '@/models/Voter';

async function requireAdmin() {
    const store = await cookies();
    const t = store.get('admin_session')?.value;
    if (!t) throw new Error('no token');
    const p = jwt.verify(t, process.env.JWT_SECRET);
    if (p.role !== 'admin') throw new Error('not admin');
}

export async function POST() {
    try {
        await requireAdmin();
        await dbConnect();
        const r = await Voter.updateMany({}, {
            $set: {
                enrollmentDone: false,
                primarySim: null,
                pinHash: null,
                credentialSecret: null,
                credentialCommitment: null,
                revocationHandle: null,
            }
        });
        return NextResponse.json({ ok: true, modified: r.modifiedCount });
    } catch (e) {
        return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }
}
