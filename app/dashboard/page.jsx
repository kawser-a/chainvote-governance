// import Link from "next/link";
// import { headers } from "next/headers";
// import { dbConnect } from "@/lib/db";
// import Voter from "@/models/Voter";
// import Candidate from "@/models/Candidate";
// import Manifesto from "@/models/Manifesto";
// import Election from "@/models/Election";
// import { matchesElectionForVoter } from "@/lib/eligibility";

// /* ───────────────────── helpers ───────────────────── */

// async function getBaseUrl() {
//     const h = await headers();
//     const host = h.get("host");
//     const proto = h.get("x-forwarded-proto") ?? "http";
//     return `${proto}://${host}`;
// }

// async function getMe() {
//     const base = await getBaseUrl();
//     const h = await headers();
//     const cookieHeader = h.get("cookie") ?? "";
//     const res = await fetch(`${base}/api/me`, {
//         cache: "no-store",
//         headers: { cookie: cookieHeader },
//     });
//     if (!res.ok) return null;
//     return res.json();
// }

// function seatRegex(seat) {
//     const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
//     return new RegExp(`^${esc((seat || "").trim())}$`, "i");
// }

// function renderEducationItem(e) {
//     if (!e) return null;
//     if (typeof e === "string") return e;
//     const parts = [e.degree, e.institution].filter(Boolean).join(" — ");
//     return parts ? `${parts}${e.year ? ` (${e.year})` : ""}` : e.year || "-";
// }

// function renderExperienceItem(ex) {
//     if (!ex) return null;
//     if (typeof ex === "string") return ex;
//     const parts = [ex.role, ex.org].filter(Boolean).join(" — ");
//     return parts ? `${parts}${ex.years ? ` (${ex.years})` : ""}` : ex.years || "-";
// }

// function timelineLabel(m) {
//     // Prefer numeric months set by candidate/admin (targetWindowMonths)
//     if (typeof m?.targetWindowMonths === "number") {
//         return `within ${m.targetWindowMonths} month of elected${m.targetWindowMonths === 1 ? "" : "s"}`;
//     }
//     // Fallback to any legacy string like "within 6 months"
//     if (m?.expectedTimeline && typeof m.expectedTimeline === "string") {
//         return m.expectedTimeline;
//     }
//     // Optional: infer from milestones
//     if (Array.isArray(m?.milestones) && m.milestones.length > 0) {
//         const dates = m.milestones
//             .map((x) => (x?.targetDate ? new Date(x.targetDate).getTime() : null))
//             .filter((t) => t && !Number.isNaN(t));
//         if (dates.length) {
//             const latest = Math.max(...dates);
//             const now = Date.now();
//             const ms = Math.max(0, latest - now);
//             const months = Math.ceil(ms / (30 * 24 * 3600 * 1000));
//             if (months > 0) return `target ~${months} month${months === 1 ? "" : "s"} from now`;
//         }
//     }
//     return null;
// }

// /* ───────────────────── page ───────────────────── */

// export default async function Dashboard() {
//     const me = await getMe();

//     if (!me?.ok) {
//         return (
//             <div className="mt-2">
//                 <div className="p-4 rounded-xl border border-[#2A2A2A] bg-[#171717]">
//                     <div className="text-white text-lg font-semibold">Session invalid</div>
//                     <div className="text-[#A1A1A1] text-sm">Please log in again.</div>
//                 </div>
//             </div>
//         );
//     }

//     await dbConnect();

//     // ── voter & seat ─────────────────────────────────────────
//     const voter = await Voter.findOne({ nid: me.sub }).lean();
//     const seat = voter?.seat || "-";
//     const seatFilter = seat !== "-" ? { seat: seatRegex(seat) } : {};

//     // ── candidates in this seat (approved) ───────────────────
//     // IMPORTANT: Do not mix inclusion and exclusion in projection.
//     const candidatesRaw =
//         seat !== "-"
//             ? await Candidate.find({ ...seatFilter, approved: true })
//                 .select({
//                     _id: 1,
//                     name: 1,
//                     partyName: 1,
//                     independent: 1,
//                     gender: 1,
//                     age: 1,
//                     seat: 1,
//                     occupation: 1,
//                     shortSpeech: 1,
//                     education: 1,  // include entire array; we'll normalize in JS
//                     experiences: 1 // include entire array; we'll normalize in JS
//                 })
//                 .lean()
//             : [];

//     // normalize candidates to plain JSON-safe values for rendering
//     const candidates = candidatesRaw.map((c) => ({
//         ...c,
//         _id: String(c._id),
//         education: (c.education || []).map((e) => {
//             if (typeof e === "string") return { degree: e };
//             return {
//                 degree: e?.degree || e?.title || "",
//                 institution: e?.institution || e?.org || e?.school || "",
//                 year: e?.year || e?.since || e?.from || "",
//             };
//         }),
//         experiences: (c.experiences || []).map((ex) => {
//             if (typeof ex === "string") return { role: ex };
//             return {
//                 role: ex?.role || ex?.position || ex?.title || "",
//                 org: ex?.org || ex?.organization || "",
//                 years: ex?.years || ex?.duration || "",
//             };
//         }),
//     }));

//     // ── approved manifestos for those candidates ─────────────
//     const candIds = candidates.map((c) => c._id);
//     const manifestosRaw =
//         candIds.length > 0
//             ? await Manifesto.find({
//                 candidateId: { $in: candIds },
//                 status: "approved",
//             })
//                 .select({
//                     _id: 1,
//                     candidateId: 1,
//                     title: 1,
//                     summary: 1,
//                     targetWindowMonths: 1, // numeric months (preferred)
//                     expectedTimeline: 1,   // legacy string (fallback)
//                     milestones: 1,         // optional for inference
//                 })
//                 .lean()
//             : [];

//     const manifestos = manifestosRaw.map((m) => ({
//         ...m,
//         _id: String(m._id),
//         candidateId: String(m.candidateId),
//     }));

//     // group manifestos by candidate
//     const manByCand = new Map();
//     for (const m of manifestos) {
//         const k = String(m.candidateId);
//         if (!manByCand.has(k)) manByCand.set(k, []);
//         manByCand.get(k).push(m);
//     }

//     // ── enrolled voters count in seat ─────────────────────────
//     const totalEnrolledInSeat =
//         seat !== "-"
//             ? await Voter.countDocuments({
//                 ...seatFilter,
//                 enrollmentDone: true,
//                 canVote: true,
//                 isBanned: false,
//             })
//             : 0;

//     // ── elections relevant to this voter ──────────────────────
//     const now = new Date();
//     const rawElections = await Election.find({
//         status: { $in: ["scheduled", "active"] },
//         endAt: { $gte: new Date(now.getTime() - 5 * 60 * 1000) },
//     })
//         .sort({ startAt: 1 })
//         .lean();

//     const elections = voter
//         ? rawElections.filter((e) => matchesElectionForVoter(e, voter))
//         : [];

//     return (
//         <div className="space-y-6">
//             {/* Summary */}
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                 <Card title="Your NID" value={me.sub} />
//                 <Card title="Your Seat" value={seat} />
//                 <Card title="Enrolled voters in your seat" value={String(totalEnrolledInSeat)} />
//             </div>

//             {/* Elections */}
//             <section className="rounded-2xl border border-[#2A2A2A] bg-[#171717] p-4">
//                 <h2 className="text-white font-semibold mb-3">Elections (relevant to you)</h2>
//                 {elections.length === 0 ? (
//                     <div className="text-[#A1A1A1] text-sm">No scheduled/active elections yet.</div>
//                 ) : (
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//                         {elections.map((e) => (
//                             <div key={String(e._id)} className="rounded-xl border border-[#2A2A2A] p-3 bg-[#1b1b1b]">
//                                 <div className="text-white font-medium">{e.name}</div>
//                                 <div className="text-[#A1A1A1] text-sm capitalize">
//                                     {e.type} • {e.ballotType} • {e.eligibility?.scope || "seat"}
//                                 </div>
//                                 <div className="text-[#A1A1A1] text-xs mt-1">
//                                     Start: {new Date(e.startAt).toLocaleString()}
//                                 </div>
//                                 <div className="text-[#A1A1A1] text-xs">
//                                     End: {new Date(e.endAt).toLocaleString()}
//                                 </div>
//                                 <div className="text-[#C9F300] text-xs mt-2">
//                                     Ballot items: {e.ballot?.length || 0}
//                                 </div>
//                                 <Link
//                                     href={`/elections/${String(e._id)}`}
//                                     className="inline-block mt-2 text-[#9EFF00] text-sm hover:underline"
//                                 >
//                                     Go vote →
//                                 </Link>
//                             </div>
//                         ))}
//                     </div>
//                 )}
//             </section>

//             {/* Candidates & Manifestos */}
//             <section className="rounded-2xl border border-[#2A2A2A] bg-[#171717] p-4">
//                 <h2 className="text-white font-semibold mb-3">Candidates in {seat}</h2>
//                 {candidates.length === 0 ? (
//                     <div className="text-[#A1A1A1] text-sm">No approved candidates yet.</div>
//                 ) : (
//                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
//                         {candidates.map((c) => {
//                             const mans = manByCand.get(String(c._id)) || [];
//                             const party = c.independent ? "Independent" : (c.partyName || "Independent");

//                             return (
//                                 <div key={c._id} className="rounded-xl border border-[#2A2A2A] p-3 bg-[#1b1b1b]">
//                                     {/* header */}
//                                     <div className="flex items-center justify-between mb-1">
//                                         <div className="text-white font-medium">{c.name}</div>
//                                         <div className="text-xs text-[#A1A1A1]">{party}</div>
//                                     </div>
//                                     <div className="text-xs text-[#A1A1A1] mb-2">
//                                         {c.gender || "-"} • {c.age ? `${c.age} yrs` : "-"} • Seat: {c.seat}
//                                     </div>

//                                     {/* profile summary */}
//                                     <div className="space-y-1 text-xs text-[#EDEDED]">
//                                         {c.occupation ? (
//                                             <div>
//                                                 <b>Occupation:</b> {c.occupation}
//                                             </div>
//                                         ) : null}
//                                         {c.shortSpeech ? (
//                                             <div>
//                                                 <b>Message:</b> <span className="text-[#A1A1A1]">{c.shortSpeech}</span>
//                                             </div>
//                                         ) : null}

//                                         {c.education?.length ? (
//                                             <div className="mt-2">
//                                                 <b>Education:</b>
//                                                 <ul className="list-disc ml-5 mt-1">
//                                                     {c.education.map((e, i) => (
//                                                         <li key={i}>{renderEducationItem(e)}</li>
//                                                     ))}
//                                                 </ul>
//                                             </div>
//                                         ) : null}

//                                         {c.experiences?.length ? (
//                                             <div className="mt-2">
//                                                 <b>Experiences:</b>
//                                                 <ul className="list-disc ml-5 mt-1">
//                                                     {c.experiences.map((ex, i) => (
//                                                         <li key={i}>{renderExperienceItem(ex)}</li>
//                                                     ))}
//                                                 </ul>
//                                             </div>
//                                         ) : null}
//                                     </div>

//                                     {/* manifestos */}
//                                     <div className="text-[#EDEDED] text-sm font-medium mt-3 mb-1">
//                                         Approved Manifestos
//                                     </div>
//                                     {mans.length === 0 ? (
//                                         <div className="text-[#A1A1A1] text-sm">No approved manifestos yet.</div>
//                                     ) : (
//                                         <ul className="space-y-2">
//                                             {mans.map((m) => {
//                                                 const tl = timelineLabel(m);
//                                                 return (
//                                                     <li
//                                                         key={m._id}
//                                                         className="rounded-lg border border-[#2A2A2A] px-3 py-2 bg-[#141414]"
//                                                     >
//                                                         <div className="text-white text-sm font-medium">{m.title}</div>
//                                                         {!!m.summary && (
//                                                             <div className="text-xs text-[#A1A1A1] mt-1 whitespace-pre-wrap">
//                                                                 {m.summary}
//                                                             </div>
//                                                         )}
//                                                         {tl && (
//                                                             <div className="text-xs text-[#A1A1A1] mt-1">
//                                                                 <b>Timeline:</b> {tl}
//                                                             </div>
//                                                         )}
//                                                     </li>
//                                                 );
//                                             })}
//                                         </ul>
//                                     )}
//                                 </div>
//                             );
//                         })}
//                     </div>
//                 )}
//             </section>
//         </div>
//     );
// }

// /* ───────────────────── small UI ───────────────────── */

// function Card({ title, value }) {
//     return (
//         <div className="rounded-2xl border border-[#2A2A2A] bg-[#171717] p-4">
//             <div className="text-[#A1A1A1] text-sm">{title}</div>
//             <div className="text-white text-xl font-semibold">{value}</div>
//         </div>
//     );
// }

import Link from "next/link";
import { headers } from "next/headers";
import { dbConnect } from "@/lib/db";
import Voter from "@/models/Voter";
import Candidate from "@/models/Candidate";
import Manifesto from "@/models/Manifesto";
import Election from "@/models/Election";
import { matchesElectionForVoter } from "@/lib/eligibility";

/* ───────────────────── helpers ───────────────────── */
async function getBaseUrl() {
  const h = await headers();
  const host = h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}

async function getMe() {
  const base = await getBaseUrl();
  const h = await headers();
  const cookieHeader = h.get("cookie") ?? "";
  const res = await fetch(`${base}/api/me`, {
    cache: "no-store",
    headers: { cookie: cookieHeader },
  });
  if (!res.ok) return null;
  return res.json();
}

function seatRegex(seat) {
  const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`^${esc((seat || "").trim())}$`, "i");
}

function renderEducationItem(e) {
  if (!e) return null;
  if (typeof e === "string") return e;
  const parts = [e.degree, e.institution].filter(Boolean).join(" — ");
  return parts ? `${parts}${e.year ? ` (${e.year})` : ""}` : e.year || "-";
}

function renderExperienceItem(ex) {
  if (!ex) return null;
  if (typeof ex === "string") return ex;
  const parts = [ex.role, ex.org].filter(Boolean).join(" — ");
  return parts ? `${parts}${ex.years ? ` (${ex.years})` : ""}` : ex.years || "-";
}

function timelineLabel(m) {
  if (typeof m?.targetWindowMonths === "number") {
    return `within ${m.targetWindowMonths} month${m.targetWindowMonths === 1 ? "" : "s"} of elected`;
  }
  if (m?.expectedTimeline && typeof m.expectedTimeline === "string") {
    return m.expectedTimeline;
  }
  if (Array.isArray(m?.milestones) && m.milestones.length > 0) {
    const dates = m.milestones
      .map((x) => (x?.targetDate ? new Date(x.targetDate).getTime() : null))
      .filter((t) => t && !Number.isNaN(t));
    if (dates.length) {
      const latest = Math.max(...dates);
      const now = Date.now();
      const ms = Math.max(0, latest - now);
      const months = Math.ceil(ms / (30 * 24 * 3600 * 1000));
      if (months > 0) return `target ~${months} month${months === 1 ? "" : "s"} from now`;
    }
  }
  return null;
}

/* ───────────────────── UI Components ───────────────────── */
function StatCard({ title, value, icon }) {
  return (
    <div className="bg-[#171717] border border-[#2A2A2A] rounded-2xl p-5 flex items-center">
      <div className="flex-shrink-0 bg-[#C9F300]/10 p-3 rounded-xl text-[#C9F300] mr-4">
        {icon}
      </div>
      <div>
        <div className="text-[#A1A1A1] text-sm">{title}</div>
        <div className="text-white text-xl font-semibold">{value}</div>
      </div>
    </div>
  );
}

function Section({ title, children, className = "" }) {
  return (
    <section className={`bg-[#171717] border border-[#2A2A2A] rounded-2xl p-5 ${className}`}>
      <h2 className="text-white font-semibold text-lg mb-4 flex items-center">
        <span className="bg-gradient-to-r from-[#C9F300] to-[#9EFF00] h-2 w-2 rounded-full mr-2"></span>
        {title}
      </h2>
      {children}
    </section>
  );
}

function EmptyState({ title, message, icon }) {
  return (
    <div className="text-center py-8 px-4">
      <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-[#1E1E1E] text-[#A1A1A1] mb-3">
        {icon}
      </div>
      <h3 className="text-white font-medium text-lg mb-1">{title}</h3>
      <p className="text-[#A1A1A1] text-sm">{message}</p>
    </div>
  );
}

function ElectionCard({ election }) {
  const isActive = election.status === "active";
  const startDate = new Date(election.startAt);
  const endDate = new Date(election.endAt);

  return (
    <div className="bg-[#1b1b1b] border border-[#2A2A2A] rounded-xl p-4 hover:border-[#C9F300]/30 transition-colors duration-200">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-white font-medium">{election.name}</h3>
        <span className={`text-xs px-2 py-1 rounded-full ${isActive ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>
          {isActive ? 'Live' : 'Upcoming'}
        </span>
      </div>

      <div className="text-[#A1A1A1] text-xs mb-3 capitalize">
        {election.type} • {election.ballotType} • {election.eligibility?.scope || "seat"}
      </div>

      <div className="flex items-center text-xs text-[#A1A1A1] mb-3">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
      </div>

      <div className="flex items-center text-xs text-[#C9F300] mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        {election.ballot?.length || 0} ballot items
      </div>

      <Link
        href={`/elections/${String(election._id)}`}
        className="inline-flex items-center text-sm font-medium text-[#C9F300] hover:text-[#9EFF00] transition-colors"
      >
        {isActive ? 'Vote now' : 'View details'}
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      </Link>
    </div>
  );
}

function CandidateCard({ candidate, manifestos }) {
  const party = candidate.independent ? "Independent" : (candidate.partyName || "Independent");

  return (
    <div className="bg-[#1b1b1b] border border-[#2A2A2A] rounded-xl p-4 hover:border-[#C9F300]/30 transition-colors duration-200">
      {/* Candidate Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-white font-medium">{candidate.name}</h3>
          <div className="text-xs text-[#A1A1A1] mt-1">
            {candidate.gender || "-"} • {candidate.age ? `${candidate.age} yrs` : "-"}
          </div>
        </div>
        <div className="text-xs px-2 py-1 rounded-full bg-[#2A2A2A] text-[#EDEDED]">
          {party}
        </div>
      </div>

      {/* Candidate Details */}
      <div className="space-y-3 text-sm">
        {candidate.occupation && (
          <div className="flex items-start">
            <span className="text-[#A1A1A1] min-w-[90px]">Occupation:</span>
            <span className="text-white">{candidate.occupation}</span>
          </div>
        )}

        {candidate.shortSpeech && (
          <div className="flex items-start">
            <span className="text-[#A1A1A1] min-w-[90px]">Message:</span>
            <span className="text-white">{candidate.shortSpeech}</span>
          </div>
        )}

        {candidate.education?.length > 0 && (
          <div>
            <div className="text-[#A1A1A1] mb-1">Education:</div>
            <ul className="text-white space-y-1">
              {candidate.education.map((e, i) => (
                <li key={i} className="flex items-start">
                  <span className="text-[#C9F300] mr-2">•</span>
                  <span>{renderEducationItem(e)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {candidate.experiences?.length > 0 && (
          <div>
            <div className="text-[#A1A1A1] mb-1">Experience:</div>
            <ul className="text-white space-y-1">
              {candidate.experiences.map((ex, i) => (
                <li key={i} className="flex items-start">
                  <span className="text-[#C9F300] mr-2">•</span>
                  <span>{renderExperienceItem(ex)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Manifestos Section */}
      <div className="mt-4 pt-4 border-t border-[#2A2A2A]">
        <h4 className="text-white text-sm font-medium mb-3 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-[#C9F300]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Approved Manifestos
        </h4>

        {manifestos.length === 0 ? (
          <div className="text-[#A1A1A1] text-xs italic">No approved manifestos yet.</div>
        ) : (
          <div className="space-y-3">
            {manifestos.map((m) => {
              const tl = timelineLabel(m);
              return (
                <div key={m._id} className="bg-[#141414] border border-[#2A2A2A] rounded-lg p-3">
                  <h5 className="text-white text-sm font-medium mb-1">{m.title}</h5>
                  {m.summary && (
                    <p className="text-[#A1A1A1] text-xs mb-2">{m.summary}</p>
                  )}
                  {tl && (
                    <div className="flex items-center text-xs text-[#C9F300]">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {tl}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ───────────────────── page ───────────────────── */
export default async function Dashboard() {
  const me = await getMe();
  if (!me?.ok) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center p-4">
        <div className="max-w-md w-full p-6 rounded-2xl border border-[#2A2A2A] bg-[#171717] text-center">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-red-500/20 text-red-400 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <div className="text-white text-lg font-semibold mb-2">Session Invalid</div>
          <div className="text-[#A1A1A1] text-sm mb-4">Please log in again to access your dashboard.</div>
          <Link
            href="/login"
            className="inline-flex items-center justify-center px-4 py-2 bg-[#C9F300] text-[#121212] font-medium rounded-lg hover:bg-[#ACE800] transition-colors"
          >
            Return to Login
          </Link>
        </div>
      </div>
    );
  }

  await dbConnect();

  const voter = await Voter.findOne({ nid: me.sub }).lean();
  const seat = voter?.seat || "-";
  const seatFilter = seat !== "-" ? { seat: seatRegex(seat) } : {};

  const candidatesRaw = seat !== "-"
    ? await Candidate.find({ ...seatFilter, approved: true })
        .select({
          _id: 1,
          name: 1,
          partyName: 1,
          independent: 1,
          gender: 1,
          age: 1,
          seat: 1,
          occupation: 1,
          shortSpeech: 1,
          education: 1,
          experiences: 1
        })
        .lean()
    : [];

  const candidates = candidatesRaw.map((c) => ({
    ...c,
    _id: String(c._id),
    education: (c.education || []).map((e) => {
      if (typeof e === "string") return { degree: e };
      return {
        degree: e?.degree || e?.title || "",
        institution: e?.institution || e?.org || e?.school || "",
        year: e?.year || e?.since || e?.from || "",
      };
    }),
    experiences: (c.experiences || []).map((ex) => {
      if (typeof ex === "string") return { role: ex };
      return {
        role: ex?.role || ex?.position || ex?.title || "",
        org: ex?.org || ex?.organization || "",
        years: ex?.years || ex?.duration || "",
      };
    }),
  }));

  const candIds = candidates.map((c) => c._id);
  const manifestosRaw = candIds.length > 0
    ? await Manifesto.find({
        candidateId: { $in: candIds },
        status: "approved",
      })
        .select({
          _id: 1,
          candidateId: 1,
          title: 1,
          summary: 1,
          targetWindowMonths: 1,
          expectedTimeline: 1,
          milestones: 1,
        })
        .lean()
    : [];

  const manifestos = manifestosRaw.map((m) => ({
    ...m,
    _id: String(m._id),
    candidateId: String(m.candidateId),
  }));

  const manByCand = new Map();
  for (const m of manifestos) {
    const k = String(m.candidateId);
    if (!manByCand.has(k)) manByCand.set(k, []);
    manByCand.get(k).push(m);
  }

  const totalEnrolledInSeat = seat !== "-"
    ? await Voter.countDocuments({
        ...seatFilter,
        enrollmentDone: true,
        canVote: true,
        isBanned: false,
      })
    : 0;

  const now = new Date();
  const rawElections = await Election.find({
    status: { $in: ["scheduled", "active"] },
    endAt: { $gte: new Date(now.getTime() - 5 * 60 * 1000) },
  })
    .sort({ startAt: 1 })
    .lean();

  const elections = voter
    ? rawElections.filter((e) => matchesElectionForVoter(e, voter))
    : [];

  return (
    <div className="min-h-screen bg-[#121212] p-4 md:p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white">Voter Dashboard</h1>
        <p className="text-[#A1A1A1] mt-2">Welcome back! Here's the latest information for your constituency.</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard
          title="Your NID"
          value={me.sub}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
            </svg>
          }
        />
        <StatCard
          title="Your Constituency"
          value={seat}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
        />
        <StatCard
          title="Voters in Your Constituency"
          value={totalEnrolledInSeat.toLocaleString()}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          }
        />
      </div>

      {/* Elections Section */}
      <Section title="Upcoming Elections" className="mb-8">
        {elections.length === 0 ? (
          <EmptyState
            title="No elections scheduled"
            message="There are no upcoming elections in your constituency at this time."
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {elections.map((e) => (
              <ElectionCard key={String(e._id)} election={e} />
            ))}
          </div>
        )}
      </Section>

      {/* Candidates Section */}
      <Section title={`Candidates in ${seat}`} className="mb-8">
        {candidates.length === 0 ? (
          <EmptyState
            title="No candidates yet"
            message="There are no approved candidates in your constituency yet."
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            }
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {candidates.map((c) => (
              <CandidateCard
                key={c._id}
                candidate={c}
                manifestos={manByCand.get(String(c._id)) || []}
              />
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}
