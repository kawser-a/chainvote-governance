import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { dbConnect } from '@/lib/db';
import Candidate from '@/models/Candidate';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { sendMailDev } from '@/lib/mail';

async function requireAdmin() {
    const store = await cookies();
    const t = store.get('admin_session')?.value;
    if (!t) throw new Error('no token');
    const p = jwt.verify(t, process.env.JWT_SECRET);
    if (p.role !== 'admin') throw new Error('not admin');
}

export async function GET(req) {
    try {
        await requireAdmin();
        await dbConnect();

        const sp = req.nextUrl.searchParams;
        const seat = sp.get('seat') || '';
        const search = sp.get('search') || '';
        const q = {};
        if (seat) q.seat = seat;
        if (search) {
            const rx = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
            q.$or = [{ name: rx }, { email: rx }, { nid: rx }, { partyName: rx }];
        }

        const list = await Candidate.find(q).sort({ seat: 1, name: 1 }).lean();
        return NextResponse.json({ ok: true, data: list });
    } catch (e) {
        return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }
}

export async function POST(req) {
    try {
        await requireAdmin();
        await dbConnect();

        const body = await req.json();
        const {
            name, gender, age, seat, nid, phone, email,
            partyName, independent
        } = body;

        if (!name || !seat || !nid || !phone || !email) {
            return NextResponse.json({ ok: false, error: 'Missing required fields' }, { status: 400 });
        }

        const password = crypto.randomBytes(8).toString('base64url'); // short random pwd
        const passwordHash = await bcrypt.hash(password, 10);

        const cand = await Candidate.create({
            name, gender, age, seat, nid, phone, email,
            partyName: independent ? null : (partyName || null),
            independent: !!independent,
            approved: true,
            active: true,
            passwordHash,
            bio: '',
        });

        // Send dev email
        await sendMailDev(
            email,
            'Your Candidate Account',
            `Hello ${name},

Your candidate account has been created.
Seat: ${seat}
Login Email: ${email}
Temporary Password: ${password}

Login URL: ${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/candidate/login

Please log in and change your password (coming soon) and add your biography & manifesto.
`
        );

        return NextResponse.json({ ok: true, candidate: { ...cand.toObject(), password: '(sent via email)' } });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ ok: false, error: 'Create failed' }, { status: 400 });
    }
}
