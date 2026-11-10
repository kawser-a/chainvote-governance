
// import { NextResponse } from 'next/server';
// import { dbConnect } from '@/lib/db';
// import Election from '@/models/Election';
// import Manifesto from '@/models/Manifesto';
// import Candidate from '@/models/Candidate';

// export async function GET(req, ctx) {
//     try {
//         await dbConnect();
//         const { id } = await ctx.params;

//         const e = await Election.findById(id).lean();
//         if (!e) return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });

//         let ballot = e.ballot || [];

//         if (e.ballotType === 'manifesto' && ballot.length) {
//             const manIds = ballot.filter(b => b.manifestoId).map(b => b.manifestoId);
//             const mans = manIds.length ? await Manifesto
//                 .find({ _id: { $in: manIds } }, { _id: 1, title: 1, summary: 1, candidateId: 1, targetWindowMonths: 1, createdAt: 1 })
//                 .sort({ createdAt: 1 }) // ascending by creation
//                 .lean() : [];

//             // We also pull candidate details
//             const candIds = mans.map(m => m.candidateId);
//             const cands = candIds.length ? await Candidate.find(
//                 { _id: { $in: candIds } },
//                 {
//                     _id: 1, name: 1, partyName: 1, independent: 1,
//                     age: 1, gender: 1, partyPosition: 1,
//                     education: 1, leadership: 1, futureGoals: 1,
//                     currentOccupation: 1, speech50: 1, bio: 1, seat: 1,
//                 }
//             ).lean() : [];

//             const manMap = Object.fromEntries(mans.map(m => [String(m._id), m]));
//             const candMap = Object.fromEntries(cands.map(c => [String(c._id), c]));

//             ballot = ballot.map(b => {
//                 const m = manMap[String(b.manifestoId)];
//                 const c = m ? candMap[String(m.candidateId)] : null;
//                 return {
//                     ...b,
//                     targetMonths: b.targetMonths ?? (m ? m.targetWindowMonths : null),
//                     manifesto: m ? {
//                         _id: m._id, title: m.title, summary: m.summary, targetWindowMonths: m.targetWindowMonths,
//                     } : null,
//                     candidate: c ? {
//                         _id: c._id,
//                         name: c.name, partyName: c.partyName || null, independent: !!c.independent,
//                         age: c.age || null, gender: c.gender || null, seat: c.seat || '',
//                         partyPosition: c.partyPosition || '',
//                         education: (c.education || []).map(e => ({ degree: e.degree || '', institution: e.institution || '', year: e.year || '' })),
//                         leadership: (c.leadership || []).map(l => ({ role: l.role || '', org: l.org || '', period: l.period || '' })),
//                         futureGoals: c.futureGoals || '', currentOccupation: c.currentOccupation || '', speech50: c.speech50 || '', bio: c.bio || '',
//                     } : null,
//                 };
//             });
//         }

//         // Candidate ballot: can load candidate details similarly (omitted here as unchanged)
//         if (e.ballotType === 'candidate' && ballot.length) {
//             const candIds = ballot.filter(b => b.candidateId).map(b => b.candidateId);
//             const cands = candIds.length
//                 ? await Candidate.find(
//                     { _id: { $in: candIds } },
//                     {
//                         _id: 1, name: 1, partyName: 1, independent: 1,
//                         age: 1, gender: 1, education: 1, experiences: 1,
//                         occupation: 1, shortSpeech: 1, seat: 1,
//                     }
//                 ).lean()
//                 : [];
//             const candMap = Object.fromEntries(cands.map(c => [String(c._id), c]));

//             ballot = ballot.map(b => {
//                 const c = b.candidateId ? candMap[String(b.candidateId)] : null;
//                 return {
//                     ...b,
//                     candidate: c ? {
//                         _id: c._id,
//                         name: c.name,
//                         partyName: c.partyName || null,
//                         independent: !!c.independent,
//                         age: c.age || null,
//                         gender: c.gender || null,
//                         education: c.education || [],
//                         experiences: c.experiences || [],
//                         occupation: c.occupation || '',
//                         shortSpeech: c.shortSpeech || '',
//                         seat: c.seat || '',
//                     } : null,
//                 };
//             });
//         }

//         return NextResponse.json({ ok: true, election: { ...e, ballot } });
//     } catch (err) {
//         console.error('GET /api/elections/:id', err);
//         return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
//     }
// }

import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Election from '@/models/Election';
import Manifesto from '@/models/Manifesto';
import Candidate from '@/models/Candidate';

// GET /api/elections/:id → enrich ballot with manifesto + candidate info
export async function GET(req, ctx) {
  try {
    await dbConnect();
    const { id } = await ctx.params;

    const e = await Election.findById(id).lean();
    if (!e) return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });

    let ballot = e.ballot || [];

    if (e.ballotType === 'manifesto' && ballot.length) {
      const manIds = ballot.filter(b => b.manifestoId).map(b => b.manifestoId);
      const candIds = ballot.filter(b => b.candidateId).map(b => b.candidateId);

      const [mans, cands] = await Promise.all([
        manIds.length
          ? Manifesto.find(
              { _id: { $in: manIds } },
              { _id: 1, title: 1, summary: 1, targetWindowMonths: 1, candidateId: 1 }
            ).lean()
          : [],
        candIds.length
          ? Candidate.find(
              { _id: { $in: candIds } },
              {
                _id: 1, name: 1, partyName: 1, independent: 1,
                age: 1, gender: 1,
                bio: 1, partyPosition: 1, education: 1, leadership: 1,
                futureGoals: 1, currentOccupation: 1, speech50: 1, seat: 1,
              }
            ).lean()
          : [],
      ]);

      const manMap = Object.fromEntries(mans.map(m => [String(m._id), m]));
      const candMap = Object.fromEntries(cands.map(c => [String(c._id), c]));

      ballot = ballot.map(b => {
        const m = b.manifestoId ? manMap[String(b.manifestoId)] : null;
        const c = b.candidateId ? candMap[String(b.candidateId)] : (m ? candMap[String(m.candidateId)] : null);
        return {
          ...b,
          targetMonths: b.targetMonths ?? (m ? m.targetWindowMonths : null),
          manifesto: m ? {
            _id: m._id,
            title: m.title,
            summary: m.summary,
            targetWindowMonths: m.targetWindowMonths ?? null,
          } : null,
          candidate: c ? {
            _id: c._id,
            name: c.name,
            partyName: c.partyName || null,
            independent: !!c.independent,
            age: c.age || null,
            gender: c.gender || null,
            bio: c.bio || '',
            partyPosition: c.partyPosition || '',
            education: c.education || [],
            leadership: c.leadership || [],
            futureGoals: c.futureGoals || '',
            currentOccupation: c.currentOccupation || '',
            speech50: c.speech50 || '',
            seat: c.seat || '',
          } : null,
        };
      });
    }

    if (e.ballotType === 'candidate' && ballot.length) {
      const candIds = ballot.filter(b => b.candidateId).map(b => b.candidateId);
      const cands = candIds.length
        ? await Candidate.find(
            { _id: { $in: candIds } },
            {
              _id: 1, name: 1, partyName: 1, independent: 1,
              age: 1, gender: 1,
              bio: 1, partyPosition: 1, education: 1, leadership: 1,
              futureGoals: 1, currentOccupation: 1, speech50: 1, seat: 1,
            }
          ).lean()
        : [];
      const candMap = Object.fromEntries(cands.map(c => [String(c._id), c]));

      ballot = ballot.map(b => {
        const c = b.candidateId ? candMap[String(b.candidateId)] : null;
        return {
          ...b,
          candidate: c ? {
            _id: c._id,
            name: c.name,
            partyName: c.partyName || null,
            independent: !!c.independent,
            age: c.age || null,
            gender: c.gender || null,
            bio: c.bio || '',
            partyPosition: c.partyPosition || '',
            education: c.education || [],
            leadership: c.leadership || [],
            futureGoals: c.futureGoals || '',
            currentOccupation: c.currentOccupation || '',
            speech50: c.speech50 || '',
            seat: c.seat || '',
          } : null,
        };
      });
    }

    return NextResponse.json({ ok: true, election: { ...e, ballot } });
  } catch (err) {
    console.error('GET /api/elections/:id', err);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
