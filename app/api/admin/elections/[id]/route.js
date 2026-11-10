// import { NextResponse } from 'next/server';
// import { cookies } from 'next/headers';
// import jwt from 'jsonwebtoken';
// import { dbConnect } from '@/lib/db';
// import Election from '@/models/Election';
// import Candidate from '@/models/Candidate';
// import Manifesto from '@/models/Manifesto';
// import mongoose from 'mongoose';

// async function requireAdmin() {
//   const c = await cookies();
//   const t = c.get('admin_session')?.value;
//   if (!t) throw new Error('no token');
//   const p = jwt.verify(t, process.env.JWT_SECRET);
//   if (p.role !== 'admin') throw new Error('not admin');
//   return p.sub;
// }

// async function buildBallotFromApprovedManifestos(seats = []) {
//   if (!seats?.length) return [];
//   const cands = await Candidate.find({ seat: { $in: seats }, approved: true, active: true }).lean();
//   const mans  = await Manifesto.find({ candidateId: { $in: cands.map(c => c._id) }, status: 'approved' }).lean();
//   return mans.map(m => ({
//     manifestoId: m._id,
//     candidateId: m.candidateId,
//     seat: cands.find(c => String(c._id) === String(m.candidateId))?.seat || null,
//     title: m.title,
//   }));
// }

// export async function PATCH(req, ctx) {
//   try {
//     const adminUser = await requireAdmin();
//     await dbConnect();

//     // 🛠 await params (Next 15 change)
//     const { id } = await ctx.params;

//     const body = await req.json();

//     // collect operations
//     const setFields = {};
//     let pushOp = null;
//     let pullOp = null;

//     if (body.name !== undefined) setFields.name = body.name;
//     if (body.status !== undefined) setFields.status = body.status;
//     if (body.startAt !== undefined) setFields.startAt = new Date(body.startAt);
//     if (body.endAt !== undefined) setFields.endAt = new Date(body.endAt);
//     if (body.voteMode !== undefined) setFields.voteMode = body.voteMode;
//     if (body.eligibility !== undefined) setFields.eligibility = body.eligibility;
//     if (body.seats !== undefined) setFields.seats = body.seats;
//     if (body.ballotType !== undefined) setFields.ballotType = body.ballotType;
//     if (body.multiSelect !== undefined) setFields.multiSelect = !!body.multiSelect;

//     // add candidates to candidate-ballot elections
//     if (Array.isArray(body.addCandidates) && body.addCandidates.length) {
//       const cands = await Candidate.find({ _id: { $in: body.addCandidates } }).lean();
//       const addItems = cands.map(c => ({ candidateId: c._id, seat: c.seat, title: c.name }));
//       if (addItems.length) pushOp = { ballot: { $each: addItems } };
//     }

//     // remove ballot items by _id
//     if (Array.isArray(body.removeBallotItemIds) && body.removeBallotItemIds.length) {
//       pullOp = {
//         ballot: { _id: { $in: body.removeBallotItemIds.map((x) => new mongoose.Types.ObjectId(x)) } }
//       };
//     }

//     // rebuild manifesto ballot
//     if (body.rebuildBallot === true) {
//       const before = await Election.findById(id).lean();
//       const seats = (body.eligibility?.seats) || before?.eligibility?.seats || before?.seats || [];
//       setFields.ballot = await buildBallotFromApprovedManifestos(seats);
//     }

//     setFields.updatedBy = adminUser;

//     // build update doc conditionally
//     const updateDoc = {};
//     if (Object.keys(setFields).length) updateDoc.$set = setFields;
//     if (pushOp) updateDoc.$push = pushOp;
//     if (pullOp) updateDoc.$pull = pullOp;

//     if (!Object.keys(updateDoc).length) {
//       return NextResponse.json({ ok: false, error: 'No changes provided' }, { status: 400 });
//     }

//     const upd = await Election.findByIdAndUpdate(id, updateDoc, { new: true });
//     if (!upd) return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });

//     return NextResponse.json({ ok: true, election: upd });
//   } catch (e) {
//     console.error('PATCH /admin/elections/:id', e);
//     return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
//   }
// }

// /app/api/admin/elections/[id]/route.js
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { dbConnect } from '@/lib/db';
import Election from '@/models/Election';
import Candidate from '@/models/Candidate';
import Manifesto from '@/models/Manifesto';
import mongoose from 'mongoose';

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


export async function PATCH(req, ctx) {
    try {
        const adminUser = await requireAdmin();
        await dbConnect();

        // Next 15 dynamic params must be awaited
        const { id } = await ctx.params;
        const body = await req.json();

        const now = new Date();
        const election = await Election.findById(id);
        if (!election) return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });

        // Handle special actions: pause / resume (highest priority)
        if (body.action === 'pause') {
            if (election.status !== 'active') {
                return NextResponse.json({ ok: false, error: 'Only active elections can be paused' }, { status: 400 });
            }
            if (now < election.startAt || now > election.endAt) {
                return NextResponse.json({ ok: false, error: 'Election not within active time window' }, { status: 400 });
            }
            election.status = 'paused';
            election.pausedAt = now;
            election.pauseReason = (body.pauseReason || '').slice(0, 500);
            election.updatedBy = adminUser;
            await election.save();
            return NextResponse.json({ ok: true, election });
        }

        if (body.action === 'resume') {
            if (election.status !== 'paused') {
                return NextResponse.json({ ok: false, error: 'Only paused elections can be resumed' }, { status: 400 });
            }
            if (now < election.startAt) {
                return NextResponse.json({ ok: false, error: 'Cannot resume before start time' }, { status: 400 });
            }
            if (now > election.endAt) {
                return NextResponse.json({ ok: false, error: 'Cannot resume after end time; consider completing' }, { status: 400 });
            }
            election.status = 'active';
            election.pauseReason = '';
            election.updatedBy = adminUser;
            await election.save();
            return NextResponse.json({ ok: true, election });
        }

        // Standard field updates (name, times, status, etc.)
        const setFields = {};
        let pushOp = null;
        let pullOp = null;

        if (body.name !== undefined) setFields.name = body.name;
        if (body.status !== undefined) setFields.status = body.status;
        if (body.startAt !== undefined) setFields.startAt = new Date(body.startAt);
        if (body.endAt !== undefined) setFields.endAt = new Date(body.endAt);
        if (body.voteMode !== undefined) setFields.voteMode = body.voteMode;
        if (body.eligibility !== undefined) setFields.eligibility = body.eligibility;
        if (body.seats !== undefined) setFields.seats = body.seats;
        if (body.ballotType !== undefined) setFields.ballotType = body.ballotType;
        if (body.multiSelect !== undefined) setFields.multiSelect = !!body.multiSelect;

        // add candidates to candidate-ballot elections
        if (Array.isArray(body.addCandidates) && body.addCandidates.length) {
            const cands = await Candidate.find({ _id: { $in: body.addCandidates } }).lean();
            const addItems = cands.map(c => ({ candidateId: c._id, seat: c.seat, title: c.name }));
            if (addItems.length) pushOp = { ballot: { $each: addItems } };
        }

        // remove ballot items by _id
        if (Array.isArray(body.removeBallotItemIds) && body.removeBallotItemIds.length) {
            pullOp = {
                ballot: { _id: { $in: body.removeBallotItemIds.map((x) => new mongoose.Types.ObjectId(x)) } }
            };
        }

        // rebuild manifesto ballot
        if (body.rebuildBallot === true) {
            const seats = (body.eligibility?.seats) || election?.eligibility?.seats || election?.seats || [];
            setFields.ballot = await buildBallotFromApprovedManifestos(seats);
        }

        setFields.updatedBy = adminUser;

        // build update doc conditionally
        const updateDoc = {};
        if (Object.keys(setFields).length) updateDoc.$set = setFields;
        if (pushOp) updateDoc.$push = pushOp;
        if (pullOp) updateDoc.$pull = pullOp;

        if (!Object.keys(updateDoc).length) {
            return NextResponse.json({ ok: false, error: 'No changes provided' }, { status: 400 });
        }

        const upd = await Election.findByIdAndUpdate(id, updateDoc, { new: true });
        if (!upd) return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });

        return NextResponse.json({ ok: true, election: upd });
    } catch (e) {
        console.error('PATCH /admin/elections/:id', e);
        return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }
}
