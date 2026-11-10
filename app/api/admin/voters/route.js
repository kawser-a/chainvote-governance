import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { dbConnect } from '@/lib/db';
import Voter from '@/models/Voter';

function parseBool(v) {
    if (v === undefined || v === null) return undefined;
    if (v === 'true') return true;
    if (v === 'false') return false;
    return undefined;
}

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
        const page = Math.max(1, parseInt(sp.get('page') || '1', 10));
        const limit = Math.min(100, Math.max(5, parseInt(sp.get('limit') || '20', 10)));
        const sortBy = sp.get('sortBy') || 'seat'; // allow "registered" too
        const sortOrder = (sp.get('sortOrder') || 'asc') === 'desc' ? -1 : 1;
        const search = sp.get('search') || '';
        const seat = sp.get('seat') || '';
        const registered = parseBool(sp.get('registered'));
        const banned = parseBool(sp.get('banned'));
        const canVote = parseBool(sp.get('canVote'));

        const and = [];
        if (seat) and.push({ seat });
        if (banned !== undefined) and.push({ isBanned: banned });
        if (canVote !== undefined) and.push({ canVote });
        if (registered !== undefined) {
            and.push(
                registered
                    ? { pinHash: { $ne: null } }
                    : { $or: [{ pinHash: null }, { pinHash: { $exists: false } }] }
            );
        }
        if (search) {
            const rx = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
            and.push({ $or: [{ name: rx }, { nid: rx }, { seat: rx }] });
        }
        const filter = and.length ? { $and: and } : {};

        const total = await Voter.countDocuments(filter);

        const sort = {};
        if (sortBy === 'registered') {
            sort['registered'] = sortOrder;
            sort['nid'] = 1;
        } else {
            sort[sortBy] = sortOrder;
            sort['nid'] = 1;
        }

        const data = await Voter.aggregate([
            { $match: filter },
            {
                $project: {
                    _id: 0,
                    nid: 1, name: 1, seat: 1, sims: 1, primarySim: 1,
                    canVote: 1, isBanned: 1, enrollmentDone: 1,
                    registered: { $ne: ['$pinHash', null] },
                    // ✅ effective ability to vote:
                    canVoteEffective: {
                        $and: [
                            { $eq: ['$isBanned', false] },
                            { $ne: ['$pinHash', null] },
                            { $eq: ['$canVote', true] }
                        ]
                    }
                }
            }
            ,
            { $sort: sort },
            { $skip: (page - 1) * limit },
            { $limit: limit },
        ]);

        return NextResponse.json({ ok: true, page, limit, total, totalPages: Math.ceil(total / limit), data });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }
}
