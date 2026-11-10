import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { dbConnect } from '@/lib/db';
import Manifesto from '@/models/Manifesto';

async function requireAdmin() {
    const store = await cookies();
    const t = store.get('admin_session')?.value;
    if (!t) throw new Error('no token');
    const p = jwt.verify(t, process.env.JWT_SECRET);
    if (p.role !== 'admin') throw new Error('not admin');
}

export async function PATCH(req, { params }) {
    try {
        await requireAdmin();
        await dbConnect();

        const { status } = await req.json(); // 'approved' | 'rejected'
        if (!['approved', 'rejected'].includes(status)) {
            return NextResponse.json({ ok: false, error: 'Invalid status' }, { status: 400 });
        }
        const m = await Manifesto.findByIdAndUpdate(params.id, { $set: { status } }, { new: true });
        if (!m) return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });
        return NextResponse.json({ ok: true, manifesto: m });
    } catch {
        return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }
}
