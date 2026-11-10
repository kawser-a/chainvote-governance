import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { dbConnect } from '@/lib/db';
import Voter from '@/models/Voter';

async function requireAdmin() {
    const cookieStore = await cookies();
    const t = cookieStore.get('admin_session')?.value;
    if (!t) throw new Error('no token');
    const p = jwt.verify(t, process.env.JWT_SECRET);
    if (p.role !== 'admin') throw new Error('not admin');
}

export async function GET() {
    try {
        await requireAdmin();
        await dbConnect();

        const total = await Voter.countDocuments({});
        const registered = await Voter.countDocuments({ pinHash: { $ne: null } });
        const remaining = total - registered;

        const seats = await Voter.aggregate([
            {
                $group: {
                    _id: '$seat',
                    total: { $sum: 1 },
                    registered: { $sum: { $cond: [{ $ne: ['$pinHash', null] }, 1, 0] } }
                }
            },
            { $project: { seat: '$_id', _id: 0, total: 1, registered: 1 } },
            { $sort: { seat: 1 } }
        ]);

        return NextResponse.json({ ok: true, total, registered, remaining, seats });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }
}
