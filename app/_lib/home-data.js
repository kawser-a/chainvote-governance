// Everything the public home page shows, read straight from the database.
// Nothing here is invented: if the database can't be reached the page falls
// back to explaining how ChainVote works, without numbers.
import { dbConnect } from '@/lib/db';
import Voter from '@/models/Voter';
import Election from '@/models/Election';
import Vote from '@/models/Vote';
import Candidate from '@/models/Candidate';
import Manifesto from '@/models/Manifesto';
import Petition from '@/models/Petition';

const eligibleQuery = (seats) => ({
    ...(seats?.length ? { seat: { $in: seats } } : {}),
    enrollmentDone: true,
    canVote: true,
    isBanned: false,
});

async function turnout(e) {
    const seats = e.eligibility?.scope === 'seat' ? e.eligibility.seats?.length ? e.eligibility.seats : e.seats : e.seats;
    const [eligible, voted] = await Promise.all([
        Voter.countDocuments(eligibleQuery(seats)),
        Vote.distinct('voterNid', { electionId: e._id }).then((x) => x.length),
    ]);
    // The roll changes over time, so an old election can have more voters than
    // today's eligible count. Never show more than 100%.
    const base = Math.max(eligible, voted);
    return { eligible: base, voted, pct: base ? Math.round((voted / base) * 1000) / 10 : 0 };
}

function itemTitle(item, names) {
    if (item.proposal?.title) return item.proposal.title;
    return item.title || names.get(String(item.candidateId)) || 'Ballot item';
}

function deadlineOf(m) {
    const d = new Date(m.createdAt);
    if (m.targetWindowMinutes) return new Date(d.getTime() + m.targetWindowMinutes * 60000);
    if (m.targetWindowMonths) {
        d.setMonth(d.getMonth() + m.targetWindowMonths);
        return d;
    }
    return null;
}

export async function getHomeData() {
    try {
        await dbConnect();
        const now = new Date();

        const [
            voters, enrolled, seats, candidates, promises, petitions, petitionsDecided,
            heldCount, ballotsAgg, lastVotes, open, upcoming, ended, recentPromises,
        ] = await Promise.all([
            Voter.countDocuments({}),
            Voter.countDocuments({ enrollmentDone: true }),
            Voter.distinct('seat').then((x) => x.filter(Boolean).length),
            Candidate.countDocuments({ removed: { $ne: true }, active: { $ne: false } }),
            Manifesto.countDocuments({ status: 'approved' }),
            Petition.countDocuments({}),
            Petition.countDocuments({ status: { $in: ['accepted', 'rejected', 'dismissed'] } }),
            Election.countDocuments({ $or: [{ status: 'completed' }, { status: { $in: ['active', 'scheduled'] }, endAt: { $lt: now } }] }),
            Vote.aggregate([{ $group: { _id: { e: '$electionId', v: '$voterNid' } } }, { $count: 'n' }]),
            Vote.find({}).sort({ createdAt: -1 }).limit(3).select('hash prevHash createdAt').lean(),
            Election.find({ status: 'active', startAt: { $lte: now }, endAt: { $gt: now } }).sort({ endAt: 1 }).limit(4).lean(),
            Election.find({ status: { $in: ['scheduled', 'active'] }, startAt: { $gt: now } }).sort({ startAt: 1 }).limit(3).lean(),
            Election.find({ $or: [{ status: 'completed' }, { status: 'active', endAt: { $lt: now } }] }).sort({ endAt: -1 }).limit(3).lean(),
            Manifesto.find({ status: 'approved' }).sort({ createdAt: -1 }).limit(4).lean(),
        ]);

        const voteCount = await Vote.estimatedDocumentCount();

        // Names for candidate ballots and promise cards.
        const candIds = new Set();
        for (const e of [...open, ...upcoming, ...ended]) for (const b of e.ballot || []) b.candidateId && candIds.add(String(b.candidateId));
        for (const m of recentPromises) candIds.add(String(m.candidateId));
        const names = new Map(
            (await Candidate.find({ _id: { $in: [...candIds] } }).select('name partyName independent').lean()).map((c) => [String(c._id), c])
        );
        const nameOf = new Map([...names].map(([k, c]) => [k, c.name]));

        const openOut = await Promise.all(
            open.map(async (e) => ({
                id: String(e._id),
                name: e.name,
                seats: e.seats || [],
                ballotType: e.ballotType,
                endAt: e.endAt.toISOString(),
                items: (e.ballot || []).slice(0, 4).map((b) => ({
                    title: itemTitle(b, nameOf),
                    by: b.candidateId && b.manifestoId ? nameOf.get(String(b.candidateId)) : null,
                })),
                itemCount: (e.ballot || []).length,
                turnout: await turnout(e),
            }))
        );

        const endedOut = await Promise.all(
            ended.map(async (e) => {
                const t = await turnout(e);
                let leader = null;
                if (e.ballotType === 'proposal') {
                    // Proposals are decided by the most chosen option, e.g. "Agree".
                    const [top] = await Vote.aggregate([
                        { $match: { electionId: e._id } },
                        { $group: { _id: '$optionKey', n: { $sum: 1 } } },
                        { $sort: { n: -1 } },
                        { $limit: 1 },
                    ]);
                    const opts = e.ballot?.[0]?.proposal?.options || [];
                    if (top) leader = opts.find((o) => o.key === top._id)?.label || top._id;
                } else {
                    const [top] = await Vote.aggregate([
                        { $match: { electionId: e._id } },
                        { $group: { _id: { $ifNull: ['$ballotItemId', { $ifNull: ['$manifestoId', '$candidateId'] }] }, n: { $sum: 1 } } },
                        { $sort: { n: -1 } },
                        { $limit: 1 },
                    ]);
                    if (top) {
                        const id = String(top._id);
                        const item = (e.ballot || []).find((b) => [b._id, b.manifestoId, b.candidateId].some((x) => x && String(x) === id));
                        leader = item ? itemTitle(item, nameOf) : null;
                    }
                }
                return { id: String(e._id), name: e.name, seats: e.seats || [], endAt: e.endAt.toISOString(), turnout: t, leader };
            })
        );

        return {
            ok: true,
            stats: {
                voters, enrolled, seats, candidates, promises, petitions, petitionsDecided,
                held: heldCount,
                ballots: ballotsAgg[0]?.n || 0,
                voteRecords: voteCount,
                enrolledPct: voters ? Math.round((enrolled / voters) * 100) : 0,
            },
            // The three newest vote records, newest last, numbered by position in the chain.
            chain: lastVotes
                .map((v, i) => ({ hash: v.hash, prevHash: v.prevHash, at: v.createdAt.toISOString(), height: voteCount - i }))
                .reverse(),
            open: openOut,
            upcoming: upcoming.map((e) => ({ id: String(e._id), name: e.name, seats: e.seats || [], startAt: e.startAt.toISOString(), endAt: e.endAt.toISOString(), itemCount: (e.ballot || []).length })),
            ended: endedOut,
            promises: recentPromises.map((m) => {
                const c = names.get(String(m.candidateId));
                const due = deadlineOf(m);
                const start = new Date(m.createdAt).getTime();
                const elapsed = due ? Math.min(100, Math.max(0, ((now - start) / (due.getTime() - start)) * 100)) : 0;
                return {
                    id: String(m._id),
                    title: m.title,
                    seat: m.seat,
                    candidate: c?.name || 'Candidate',
                    party: c ? (c.independent || !c.partyName ? 'Independent' : c.partyName) : null,
                    due: due ? due.toISOString() : null,
                    elapsed: Math.round(elapsed),
                    overdue: due ? due < now : false,
                };
            }),
        };
    } catch (err) {
        console.error('Home page data failed', err?.message);
        return { ok: false };
    }
}
