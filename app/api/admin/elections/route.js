import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { dbConnect } from '@/lib/db';
import Election from '@/models/Election';
import Candidate from '@/models/Candidate';
import Manifesto from '@/models/Manifesto';

async function requireAdmin() {
    const c = await cookies();
    const t = c.get('admin_session')?.value;
    if (!t) throw new Error('no token');
    const p = jwt.verify(t, process.env.JWT_SECRET);
    if (p.role !== 'admin') throw new Error('not admin');
    return p.sub;
}

// async function buildBallotFromApprovedManifestos(seats = []) {
//     if (!seats?.length) return [];
//     const cands = await Candidate.find({ seat: { $in: seats }, approved: true, active: true }).lean();
//     if (!cands.length) return [];
//     const mans = await Manifesto.find({ candidateId: { $in: cands.map(c => c._id) }, status: 'approved' }).lean();
//     return mans.map(m => ({
//         manifestoId: m._id,
//         candidateId: m.candidateId,
//         seat: cands.find(c => String(c._id) === String(m.candidateId))?.seat || null,
//         title: m.title,
//     }));
// }
async function buildBallotFromApprovedManifestos(seats = []) {
    if (!seats?.length) return [];
    const cands = await Candidate.find({ seat: { $in: seats }, approved: true, active: true }).lean();
    const mans = await Manifesto.find({ candidateId: { $in: cands.map(c => c._id) }, status: 'approved' }).lean();

    const seatByCand = Object.fromEntries(cands.map(c => [String(c._id), c.seat]));
    return mans.map(m => ({
        manifestoId: m._id,
        candidateId: m.candidateId,
        seat: seatByCand[String(m.candidateId)] || null,
        title: m.title,
        targetMonths: m.targetWindowMonths ?? null,   // ⬅️ snapshot here
    }));
}


export async function GET(req) {
    try {
        await requireAdmin();
        await dbConnect();

        const sp = req.nextUrl.searchParams;
        const page = Math.max(1, parseInt(sp.get('page') || '1', 10));
        const limit = Math.min(100, Math.max(5, parseInt(sp.get('limit') || '20', 10)));
        const status = sp.get('status') || 'all';

        const q = {};
        if (status !== 'all') q.status = status;

        const total = await Election.countDocuments(q);
        const data = await Election.find(q).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean();

        return NextResponse.json({ ok: true, page, limit, total, totalPages: Math.ceil(total / limit), data });
    } catch (e) {
        console.error('GET /admin/elections', e);
        return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }
}

export async function POST(req) {
    try {
        const adminUser = await requireAdmin();
        await dbConnect();

        const body = await req.json();
        const {
            name, type,
            voteMode = (type === 'presidential' ? 'indirect' : 'direct'),
            level = null,
            seats = [],
            location = {},
            eligibility = {},
            ballotType = (type === 'presidential' ? 'candidate' : (type === 'national' ? 'manifesto' : 'proposal')),
            multiSelect = (ballotType === 'manifesto'),
            startAt, endAt,
            status = 'scheduled',
            proposals = [],           // for ballotType=proposal
            autoBuildBallot = (ballotType === 'manifesto'),
        } = body;

        if (!name || !type || !startAt || !endAt) {
            return NextResponse.json({ ok: false, error: 'Missing name/type/startAt/endAt' }, { status: 400 });
        }

        const doc = {
            name, type, voteMode, level, seats, location,
            eligibility: {
                scope: eligibility.scope ||
                    (type === 'national' ? 'seat' :
                        type === 'presidential' ? (voteMode === 'indirect' ? 'role' : 'country') :
                            (type === 'local' ? 'location' : 'all')),
                seats: eligibility.seats || seats,
                roles: eligibility.roles || (type === 'presidential' && voteMode === 'indirect' ? ['MP'] : []),
                requireEnrolled: eligibility.requireEnrolled ?? true,
                canVoteOnly: eligibility.canVoteOnly ?? true,
                minAge: eligibility.minAge ?? 18,
            },
            ballotType,
            multiSelect,
            ballot: [],
            startAt: new Date(startAt),
            endAt: new Date(endAt),
            status,
            createdBy: adminUser,
            updatedBy: adminUser,
        };

        if (ballotType === 'manifesto' && autoBuildBallot) {
            doc.ballot = await buildBallotFromApprovedManifestos(doc.eligibility.seats?.length ? doc.eligibility.seats : seats);
        }

        if (ballotType === 'proposal' && proposals.length) {
            // proposals array of { title, reason, impact, costOrTime, options? }
            doc.ballot = proposals.map(p => ({
                proposal: {
                    title: p.title?.trim(),
                    reason: p.reason || '',
                    impact: p.impact || '',
                    costOrTime: p.costOrTime || '',
                    options: (p.options?.length ? p.options : [
                        { key: 'agree', label: 'Agree' },
                        { key: 'agree_conditional', label: 'Agree with conditions' },
                        { key: 'disagree', label: 'Disagree' },
                    ]),
                },
            }));
        }

        const created = await Election.create(doc);
        return NextResponse.json({ ok: true, election: created });
    } catch (e) {
        console.error('POST /admin/elections', e);
        return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }
}
