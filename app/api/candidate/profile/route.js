import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { dbConnect } from '@/lib/db';
import Candidate from '@/models/Candidate';
import mongoose from 'mongoose';

async function auth() {
    const c = await cookies();
    const t = c.get('candidate_session')?.value;
    if (!t) throw new Error('no token');
    const p = jwt.verify(t, process.env.JWT_SECRET);
    if (p.role !== 'candidate') throw new Error('not candidate');
    return p.sub;
}

export async function PATCH(req) {
    try {
        const id = await auth();
        await dbConnect();
        const body = await req.json();

        const updates = {};

        // basics: name, partyPosition, age, gender, bio
        if (body.basic) {
            const { name, partyPosition, age, gender, bio } = body.basic;
            if (name !== undefined) updates.name = name;
            if (partyPosition !== undefined) updates.partyPosition = partyPosition;
            if (age !== undefined) updates.age = Number(age);
            if (gender !== undefined) updates.gender = gender;
            if (bio !== undefined) updates.bio = bio;
        }

        // add/remove education
        if (body.addEducation) {
            updates.$push = updates.$push || {};
            updates.$push.education = {
                _id: new mongoose.Types.ObjectId(),
                degree: body.addEducation.degree || '',
                institution: body.addEducation.institution || '',
                year: body.addEducation.year || '',
            };
        }
        if (body.removeEducationId) {
            updates.$pull = updates.$pull || {};
            updates.$pull.education = { _id: new mongoose.Types.ObjectId(body.removeEducationId) };
        }

        // add/remove leadership
        if (body.addLeadership) {
            updates.$push = updates.$push || {};
            updates.$push.leadership = {
                _id: new mongoose.Types.ObjectId(),
                role: body.addLeadership.role || '',
                org: body.addLeadership.org || '',
                period: body.addLeadership.period || '',
            };
        }
        if (body.removeLeadershipId) {
            updates.$pull = updates.$pull || {};
            updates.$pull.leadership = { _id: new mongoose.Types.ObjectId(body.removeLeadershipId) };
        }

        // other single fields
        if (body.other) {
            const { futureGoals, currentOccupation, speech50 } = body.other;
            if (futureGoals !== undefined) updates.futureGoals = futureGoals;
            if (currentOccupation !== undefined) updates.currentOccupation = currentOccupation;
            if (speech50 !== undefined) updates.speech50 = speech50;
        }

        if (Object.keys(updates).length === 0) {
            return NextResponse.json({ ok: false, error: 'No changes' }, { status: 400 });
        }

        const upd = await Candidate.findByIdAndUpdate(id, updates, { new: true, projection: { passwordHash: 0 } });
        return NextResponse.json({ ok: true, candidate: upd });
    } catch (e) {
        console.error('PATCH /api/candidate/profile', e);
        return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }
}
