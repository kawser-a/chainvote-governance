import Link from "next/link";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { CalendarClock, MapPin, Users, Vote, UserRound, ChevronRight } from "lucide-react";
import { dbConnect } from "@/lib/db";
import Voter from "@/models/Voter";
import Candidate from "@/models/Candidate";
import Manifesto from "@/models/Manifesto";
import Election from "@/models/Election";
import { matchesElectionForVoter } from "@/lib/eligibility";
import {
    Alert, Badge, ButtonLink, Card, CardBody, CardHeader, EmptyState, PageHeader, Stat, StatusBadge,
} from "../components/ui/primitives";
import { electionPhase, formatDateTime, phaseLabel, titleCase } from "../components/ui/format";

export const metadata = { title: "Overview" };

async function getSessionNid() {
    const token = (await cookies()).get("session")?.value;
    if (!token) return null;
    try {
        return jwt.verify(token, process.env.JWT_SECRET)?.sub || null;
    } catch {
        return null;
    }
}

function seatRegex(seat) {
    const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`^${esc((seat || "").trim())}$`, "i");
}

function deadlineLabel(m) {
    if (typeof m?.targetWindowMonths === "number") {
        return `Within ${m.targetWindowMonths} month${m.targetWindowMonths === 1 ? "" : "s"} of taking office`;
    }
    return null;
}

function ElectionRow({ election }) {
    const phase = electionPhase(election);
    const href = phase === "ended" ? `/elections/${election._id}/results` : `/elections/${election._id}`;
    const action = phase === "active" ? "Vote" : phase === "ended" ? "Results" : "Preview";
    return (
        <li>
            <Link href={href} className="group flex items-center gap-4 px-4 py-4 hover:bg-subtle/60 sm:px-6">
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-ink group-hover:underline">{election.name}</p>
                        <StatusBadge status={phase} />
                    </div>
                    <p className="mt-1 text-sm text-ink-2">
                        {phaseLabel(election)} · {titleCase(election.ballotType)} ballot
                    </p>
                    <p className="mt-0.5 text-sm text-ink-3">
                        {phase === "upcoming" ? `Opens ${formatDateTime(election.startAt)}` : `Closes ${formatDateTime(election.endAt)}`}
                    </p>
                </div>
                <span className="hidden shrink-0 text-sm font-semibold text-brand sm:inline">{action}</span>
                <ChevronRight className="h-5 w-5 shrink-0 text-ink-3" aria-hidden="true" />
            </Link>
        </li>
    );
}

function CandidateCard({ candidate, manifestos }) {
    const party = candidate.independent || !candidate.partyName ? "Independent" : candidate.partyName;
    const facts = [candidate.gender, candidate.age && `${candidate.age} years`, candidate.currentOccupation].filter(Boolean);
    return (
        <article className="flex flex-col rounded-[var(--radius-card)] border border-line bg-surface">
            <div className="flex items-start justify-between gap-3 px-4 pt-4 sm:px-5 sm:pt-5">
                <div className="min-w-0">
                    <h3 className="font-semibold text-ink">{candidate.name}</h3>
                    {facts.length > 0 && <p className="mt-0.5 text-sm text-ink-3">{facts.join(" · ")}</p>}
                </div>
                <Badge tone={party === "Independent" ? "neutral" : "info"}>{party}</Badge>
            </div>

            {candidate.speech50 && (
                <blockquote className="mx-4 mt-3 border-l-2 border-line-strong pl-3 text-[15px] text-ink-2 sm:mx-5">
                    “{candidate.speech50}”
                </blockquote>
            )}

            <div className="mt-4 flex-1 border-t border-line px-4 py-4 sm:px-5">
                <h4 className="text-sm font-semibold text-ink">Commitments ({manifestos.length})</h4>
                {manifestos.length === 0 ? (
                    <p className="mt-1 text-sm text-ink-3">No approved manifestos yet.</p>
                ) : (
                    <ul className="mt-2 space-y-3">
                        {manifestos.map((m) => (
                            <li key={m._id}>
                                <p className="text-[15px] font-medium text-ink">{m.title}</p>
                                {m.summary && <p className="mt-0.5 text-sm text-ink-2">{m.summary}</p>}
                                {deadlineLabel(m) && (
                                    <p className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-ink-3">
                                        <CalendarClock className="h-3.5 w-3.5" aria-hidden="true" />
                                        {deadlineLabel(m)}
                                    </p>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {(candidate.education?.length > 0 || candidate.leadership?.length > 0 || candidate.bio) && (
                <details className="group border-t border-line">
                    <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between px-4 text-sm font-semibold text-brand hover:bg-subtle/60 sm:px-5 [&::-webkit-details-marker]:hidden">
                        Background
                        <ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90" aria-hidden="true" />
                    </summary>
                    <div className="space-y-3 px-4 pb-4 text-sm sm:px-5">
                        {candidate.bio && <p className="text-ink-2">{candidate.bio}</p>}
                        {candidate.education?.length > 0 && (
                            <div>
                                <p className="font-semibold text-ink">Education</p>
                                <ul className="mt-1 space-y-0.5 text-ink-2">
                                    {candidate.education.map((e, i) => (
                                        <li key={i}>{[e.degree, e.institution].filter(Boolean).join(", ")}{e.year ? ` (${e.year})` : ""}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {candidate.leadership?.length > 0 && (
                            <div>
                                <p className="font-semibold text-ink">Experience</p>
                                <ul className="mt-1 space-y-0.5 text-ink-2">
                                    {candidate.leadership.map((l, i) => (
                                        <li key={i}>{[l.role, l.org].filter(Boolean).join(", ")}{l.period ? ` (${l.period})` : ""}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </details>
            )}
        </article>
    );
}

export default async function Dashboard() {
    const nid = await getSessionNid();
    if (!nid) {
        return (
            <Alert tone="warning" title="Your session has ended" action={<ButtonLink href="/login?next=/dashboard">Sign in again</ButtonLink>}>
                For your security, you’re signed out after a period of inactivity.
            </Alert>
        );
    }

    await dbConnect();
    const voter = await Voter.findOne({ nid }).lean();
    const seat = voter?.seat || null;
    const seatFilter = seat ? { seat: seatRegex(seat) } : null;

    const candidatesRaw = seatFilter
        ? await Candidate.find({ ...seatFilter, approved: true, removed: { $ne: true } })
            .select({ name: 1, partyName: 1, independent: 1, gender: 1, age: 1, seat: 1, currentOccupation: 1, speech50: 1, bio: 1, education: 1, leadership: 1 })
            .lean()
        : [];
    const candidates = candidatesRaw.map((c) => ({
        ...c,
        _id: String(c._id),
        education: (c.education || []).map((e) => (typeof e === "string" ? { degree: e } : { degree: e?.degree || "", institution: e?.institution || "", year: e?.year || "" })),
        leadership: (c.leadership || []).map((l) => (typeof l === "string" ? { role: l } : { role: l?.role || "", org: l?.org || "", period: l?.period || "" })),
    }));

    const manifestosRaw = candidates.length
        ? await Manifesto.find({ candidateId: { $in: candidates.map((c) => c._id) }, status: "approved" })
            .select({ candidateId: 1, title: 1, summary: 1, targetWindowMonths: 1 })
            .lean()
        : [];
    const byCandidate = new Map();
    for (const m of manifestosRaw) {
        const k = String(m.candidateId);
        if (!byCandidate.has(k)) byCandidate.set(k, []);
        byCandidate.get(k).push({ ...m, _id: String(m._id), candidateId: k });
    }

    const enrolledInSeat = seatFilter
        ? await Voter.countDocuments({ ...seatFilter, enrollmentDone: true, canVote: true, isBanned: false })
        : 0;

    const now = Date.now();
    const rawElections = await Election.find({
        status: { $in: ["scheduled", "active", "paused"] },
        endAt: { $gte: new Date(now - 5 * 60 * 1000) },
    })
        .sort({ startAt: 1 })
        .lean();
    const elections = (voter ? rawElections.filter((e) => matchesElectionForVoter(e, voter)) : []).map((e) => ({
        ...e,
        _id: String(e._id),
    }));
    const open = elections.filter((e) => electionPhase(e, now) === "active");

    return (
        <>
            <PageHeader
                eyebrow={voter?.name ? `Hello, ${voter.name}` : undefined}
                title="Overview"
                description={seat ? `Elections and candidates for your constituency, ${seat}.` : "Elections and candidates for your constituency."}
            />

            {voter && !voter.enrollmentDone && (
                <Alert tone="warning" title="Finish enrolling to vote" className="mb-6" action={<ButtonLink href="/enroll" size="sm">Finish enrollment</ButtonLink>}>
                    You can browse elections, but you need to complete enrollment before you can vote.
                </Alert>
            )}
            {voter && (voter.isBanned || voter.canVote === false) && (
                <Alert tone="danger" title="Voting is disabled for your account" className="mb-6">
                    Contact your election office if you think this is a mistake.
                </Alert>
            )}

            {open.length > 0 && (
                <div className="mb-6 flex flex-col gap-4 rounded-[var(--radius-card)] border border-brand/30 bg-brand-soft p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                    <div className="flex gap-3">
                        <Vote className="mt-0.5 h-6 w-6 shrink-0 text-brand" aria-hidden="true" />
                        <div>
                            <p className="font-semibold text-ink">
                                {open.length === 1 ? "Voting is open in 1 election" : `Voting is open in ${open.length} elections`}
                            </p>
                            <p className="text-sm text-ink-2">
                                {open[0].name} · {phaseLabel(open[0], now).toLowerCase()}
                            </p>
                        </div>
                    </div>
                    <ButtonLink href={open.length === 1 ? `/elections/${open[0]._id}` : "/elections"} className="shrink-0">
                        {open.length === 1 ? "Go to ballot" : "See open elections"}
                    </ButtonLink>
                </div>
            )}

            <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
                <div className="col-span-2 sm:col-span-1"><Stat label="Your constituency" value={seat || "Not set"} icon={MapPin} /></div>
                <Stat label="Enrolled voters here" value={enrolledInSeat.toLocaleString()} icon={Users} />
                <Stat label="Open and upcoming" value={elections.length} icon={Vote} />
            </div>

            <Card className="mb-8">
                <CardHeader
                    title="Your elections"
                    description="Elections you’re eligible to vote in."
                    action={<Link href="/elections" className="text-sm font-semibold text-brand underline hover:text-brand-hover">All elections, including past</Link>}
                />
                {elections.length === 0 ? (
                    <EmptyState icon={Vote} title="No elections right now">
                        When an election is scheduled for {seat || "your constituency"}, it will appear here.
                    </EmptyState>
                ) : (
                    <ul className="divide-y divide-line">
                        {elections.map((e) => <ElectionRow key={e._id} election={e} />)}
                    </ul>
                )}
            </Card>

            <section aria-labelledby="candidates-heading">
                <div className="mb-4">
                    <h2 id="candidates-heading" className="text-lg font-semibold text-ink">Candidates in {seat || "your constituency"}</h2>
                    <p className="text-sm text-ink-2">What each candidate has committed to, if elected.</p>
                </div>
                {candidates.length === 0 ? (
                    <Card>
                        <EmptyState icon={UserRound} title="No candidates yet">
                            Approved candidates for your constituency will appear here.
                        </EmptyState>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {candidates.map((c) => (
                            <CandidateCard key={c._id} candidate={c} manifestos={byCandidate.get(c._id) || []} />
                        ))}
                    </div>
                )}
            </section>
        </>
    );
}
