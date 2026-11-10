// /app/api/elections/[id]/live/route.js
import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Election from '@/models/Election';
import Vote from '@/models/Vote';
import mongoose from 'mongoose';

export const revalidate = 0;          // no cache
export const dynamic = 'force-dynamic';

export async function GET(_req, ctx) {
    try {
        await dbConnect();

        // ⬅️ Next 15: params must be awaited
        const params = await ctx.params;
        const { id } = params || {};
        if (!id) return NextResponse.json({ ok: false, error: 'Missing id' }, { status: 400 });

        const e = await Election.findById(id).lean();
        if (!e) return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });

        const eid = new mongoose.Types.ObjectId(id);
        let items = [];

        if (e.ballotType === 'manifesto') {
            const agg = await Vote.aggregate([
                { $match: { electionId: eid, manifestoId: { $ne: null } } },
                { $group: { _id: '$manifestoId', count: { $sum: 1 } } },
            ]);
            const map = new Map(agg.map(a => [String(a._id), a.count]));
            items = (e.ballot || []).map(b => ({
                key: String(b.manifestoId),
                title: b.title,
                seat: b.seat || null,
                count: map.get(String(b.manifestoId)) || 0,
            }));
        } else if (e.ballotType === 'candidate') {
            const agg = await Vote.aggregate([
                { $match: { electionId: eid, candidateId: { $ne: null } } },
                { $group: { _id: '$candidateId', count: { $sum: 1 } } },
            ]);
            const map = new Map(agg.map(a => [String(a._id), a.count]));
            items = (e.ballot || []).map(b => ({
                key: String(b.candidateId),
                title: b.title,
                seat: b.seat || null,
                count: map.get(String(b.candidateId)) || 0,
            }));
        } else if (e.ballotType === 'proposal') {
            const agg = await Vote.aggregate([
                { $match: { electionId: eid, ballotItemId: { $ne: null } } },
                { $group: { _id: { item: '$ballotItemId', opt: '$optionKey' }, count: { $sum: 1 } } },
            ]);
            const map = new Map(); // `${itemId}:${opt}` -> count
            for (const a of agg) map.set(`${String(a._id.item)}:${a._id.opt}`, a.count);

            items = (e.ballot || []).map(b => ({
                key: String(b._id),
                title: b.proposal?.title || '',
                seat: b.seat || null,
                options: (b.proposal?.options || []).map(o => ({
                    key: o.key,
                    label: o.label,
                    count: map.get(`${String(b._id)}:${o.key}`) || 0,
                })),
            }));
        }

        const totalVotes = await Vote.countDocuments({ electionId: eid });

        return NextResponse.json({
            ok: true,
            election: {
                _id: e._id,
                name: e.name,
                ballotType: e.ballotType,
                status: e.status,        // active/paused/etc.
                startAt: e.startAt,
                endAt: e.endAt,
                pausedAt: e.pausedAt || null,
                pauseReason: e.pauseReason || '',
            },
            totalVotes,
            items,
        });
    } catch (err) {
        console.error('GET /api/elections/:id/live', err);
        return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
    }
}
