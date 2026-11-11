import Link from "next/link";
import {
    ArrowRight, BadgeCheck, CalendarClock, CheckCircle2, FileSearch, FileText, Fingerprint, Gavel, IdCard, Landmark,
    Link2, ListChecks, MapPin, MessageSquareWarning, Users, Vote as VoteIcon,
} from "lucide-react";
import { ButtonLink, Meter, cx } from "./components/ui/primitives";
import { formatDate, formatDateTime, shortHash, timeAgo } from "./components/ui/format";
import CountUp from "./components/motion/CountUp";
import Countdown from "./components/motion/Countdown";
import Reveal from "./components/motion/Reveal";
import SignedOutNotice from "./components/site/SignedOutNotice";
import { getHomeData } from "./_lib/home-data";

export const dynamic = "force-dynamic";

const STEPS = [
    { icon: IdCard, title: "Enroll once", body: "Confirm your National ID with a code sent to your registered SIM, then set a 6-digit PIN. About two minutes." },
    { icon: FileText, title: "Read the promises", body: "Every candidate in your seat publishes manifestos: specific commitments with a deadline attached." },
    { icon: ListChecks, title: "Review, then vote", body: "Pick what you support and check a summary before anything is sent. You get a receipt when it’s recorded." },
    { icon: MessageSquareWarning, title: "Follow up", body: "When a deadline passes and nothing has happened, file a petition. The election office has to look into it." },
];

const SAFEGUARDS = [
    { icon: Link2, title: "Every vote is linked to the last", body: "Each record stores a SHA-256 fingerprint of the one before it. Change or delete an old vote and the chain no longer adds up." },
    { icon: Fingerprint, title: "One vote per person", body: "A National ID can mark each ballot item once. Only enrolled voters who haven’t been barred can vote." },
    { icon: MapPin, title: "Only your constituency", body: "You see, and can vote in, the elections for the seat you’re registered in. Nothing else." },
    { icon: FileSearch, title: "Results anyone can read", body: "Totals are broken down by candidate and by promise, so it’s clear exactly what won support." },
];

const ROLES = [
    {
        icon: VoteIcon,
        title: "Voters",
        points: ["See what’s on the ballot in your seat", "Compare manifestos side by side", "Vote, get a receipt, see results", "Petition when promises slip"],
        cta: { href: "/enroll", label: "Enroll to vote" },
        secondary: { href: "/login", label: "Already enrolled? Sign in" },
    },
    {
        icon: Landmark,
        title: "Candidates",
        points: ["Publish promises with clear deadlines", "Keep your public profile current", "Follow results for your seat", "See petitions raised about you"],
        cta: { href: "/candidate/login", label: "Candidate sign in" },
        note: "Accounts are created by the election office once a nomination is accepted.",
    },
    {
        icon: Gavel,
        title: "Election officials",
        points: ["Set up, open and close elections", "Review candidates and manifestos", "Manage the voter roll", "Decide petitions, publish results"],
        cta: { href: "/admin/login", label: "Official sign in" },
    },
];

const FAQ = [
    { q: "Is this an official government election?", a: "No. ChainVote is a working prototype of how participatory voting could work. Please don’t use it for real elections." },
    { q: "Why do I need my mobile number?", a: "To prove the National ID is yours, we text a one-time code to a SIM registered to that ID. You choose which of your registered numbers to use." },
    { q: "Can I change my vote after submitting it?", a: "No, which is why there’s a review step first. Change your selection as often as you like until you confirm." },
    { q: "What is a manifesto ballot?", a: "Instead of voting only for a person, you vote for the specific commitments you want delivered. Some elections let you support more than one." },
    { q: "What happens after I file a petition?", a: "An election official reviews it and accepts, rejects or dismisses it. If accepted petitions reach the threshold for that seat, the candidate can be removed." },
];

const n = (v) => Number(v || 0).toLocaleString("en-US");

function SectionHeading({ eyebrow, title, children, id }) {
    return (
        <div className="max-w-2xl">
            {eyebrow && <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">{eyebrow}</p>}
            <h2 id={id} className="mt-2 font-display text-[30px] font-semibold leading-[1.1] tracking-tight text-ink sm:text-[40px]">
                {title}
            </h2>
            {children && <p className="mt-3 text-[17px] leading-relaxed text-ink-2">{children}</p>}
        </div>
    );
}

function LivePill({ children }) {
    return (
        <span className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand-soft px-3 py-1 text-sm font-medium text-brand-ink">
            <span className="h-2 w-2 rounded-full bg-brand animate-pulse-ring" aria-hidden="true" />
            {children}
        </span>
    );
}

/* The card on the right of the hero: the election that's open right now, with real turnout. */
function HeroCard({ data }) {
    const e = data.ok ? data.open[0] : null;
    const next = data.ok ? data.upcoming[0] : null;
    const latest = data.ok ? data.chain?.[data.chain.length - 1] : null;

    if (!e) {
        return (
            <div className="relative rounded-2xl border border-line bg-surface p-5 shadow-[0_30px_80px_-30px_rgb(0_0_0/0.8)] sm:p-6">
                <p className="text-sm font-semibold text-ink-2">{next ? "Next election" : "No elections open right now"}</p>
                {next ? (
                    <>
                        <h2 className="mt-2 font-display text-2xl font-semibold leading-snug text-ink">{next.name}</h2>
                        <p className="mt-1 text-sm text-ink-3">{next.seats.join(", ")} · {next.itemCount} on the ballot</p>
                        <Countdown to={next.startAt} prefix="Opens in" endedText="Opening now" className="mt-5 block text-lg" />
                        <p className="mt-1 text-sm text-ink-3">{formatDateTime(next.startAt)}</p>
                        <ButtonLink href="/enroll" block className="mt-6">Enroll before it opens</ButtonLink>
                    </>
                ) : (
                    <p className="mt-2 text-[15px] text-ink-2">
                        When the election office opens voting for your seat, it shows up here with a live count of how many people have voted.
                    </p>
                )}
            </div>
        );
    }

    return (
        <div className="relative">
            <div className="absolute -inset-px rounded-2xl bg-[linear-gradient(140deg,rgb(63_207_142/0.45),transparent_40%,transparent_60%,rgb(242_181_68/0.35))]" aria-hidden="true" />
            <div className="relative rounded-2xl bg-surface p-5 shadow-[0_30px_80px_-30px_rgb(0_0_0/0.8)] sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <LivePill>Voting open</LivePill>
                    <Countdown to={e.endAt} className="text-sm" />
                </div>

                <h2 className="mt-4 font-display text-[22px] font-semibold leading-snug text-ink sm:text-2xl">{e.name}</h2>
                <p className="mt-1 text-sm text-ink-3">{e.seats.join(", ")} · {e.itemCount} on the ballot</p>

                <div className="mt-6">
                    <div className="flex items-end justify-between gap-3">
                        <p className="text-sm font-medium text-ink-2">Turnout so far</p>
                        <p className="font-display text-3xl font-semibold leading-none text-ink">
                            <CountUp value={e.turnout.pct} decimals={e.turnout.pct % 1 ? 1 : 0} suffix="%" />
                        </p>
                    </div>
                    <Meter value={e.turnout.voted} max={e.turnout.eligible || 1} label="Turnout" className="mt-3 h-2.5" delay={200} />
                    <p className="mt-2 text-sm text-ink-3">
                        {n(e.turnout.voted)} of {n(e.turnout.eligible)} eligible voters have voted
                    </p>
                </div>

                {e.items.length > 0 && (
                    <div className="mt-6 border-t border-line pt-5">
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-3">On the ballot</p>
                        <ul className="stagger mt-3 space-y-2">
                            {e.items.map((it, i) => (
                                <li key={i} style={{ "--i": i + 3 }} className="flex items-start gap-3 rounded-lg border border-line bg-raised px-3 py-2.5">
                                    <span className="mt-0.5 h-4 w-4 shrink-0 rounded border-2 border-line-strong" aria-hidden="true" />
                                    <span className="min-w-0">
                                        <span className="block truncate text-[15px] font-medium text-ink">{it.title}</span>
                                        {it.by && <span className="block truncate text-xs text-ink-3">{it.by}</span>}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <ButtonLink href={`/login?next=/elections/${e.id}`} block size="lg" className="mt-6">
                    Sign in to vote <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </ButtonLink>

                {latest && (
                    <p className="mt-4 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs text-ink-3">
                        <Link2 className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                        Latest vote recorded {timeAgo(latest.at)}
                        <span aria-hidden="true">·</span>
                        <span className="font-mono text-accent-ink">#{n(latest.height)} {shortHash(latest.hash)}</span>
                    </p>
                )}
            </div>
        </div>
    );
}

function StatsBand({ stats }) {
    const tiles = [
        { label: "Voters on the roll", value: stats.voters, icon: Users, extra: <Meter value={stats.enrolled} max={stats.voters || 1} label="Share enrolled" className="mt-3 h-1.5" delay={300} />, hint: `${stats.enrolledPct}% have enrolled` },
        { label: "Ballots cast", value: stats.ballots, icon: VoteIcon, hint: `${n(stats.voteRecords)} vote records on the chain` },
        { label: "Elections held", value: stats.held, icon: CalendarClock, hint: `Across ${n(stats.seats)} constituencies` },
        { label: "Candidates standing", value: stats.candidates, icon: Landmark, hint: "Approved by the election office" },
        { label: "Promises on record", value: stats.promises, icon: BadgeCheck, tone: "accent", hint: "Approved manifestos with deadlines" },
        { label: "Petitions filed", value: stats.petitions, icon: MessageSquareWarning, tone: "accent", hint: `${n(stats.petitionsDecided)} decided so far` },
    ];
    return (
        <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-6">
            {tiles.map((t, i) => (
                <Reveal as="li" key={t.label} delay={i * 60} className="flex flex-col rounded-[var(--radius-card)] border border-line bg-surface p-4 transition-colors hover:border-line-strong sm:p-5">
                    <span className={cx("flex h-9 w-9 items-center justify-center rounded-lg", t.tone === "accent" ? "bg-accent-soft text-accent" : "bg-brand-soft text-brand")}>
                        <t.icon className="h-[18px] w-[18px]" aria-hidden="true" />
                    </span>
                    <p className="mt-4 font-display text-[32px] font-semibold leading-none tracking-tight text-ink sm:text-4xl">
                        <CountUp value={t.value} />
                    </p>
                    <p className="mt-2 text-sm font-medium text-ink">{t.label}</p>
                    <p className="mt-0.5 text-xs leading-snug text-ink-3">{t.hint}</p>
                    {t.extra}
                </Reveal>
            ))}
        </ul>
    );
}

function ElectionsSection({ data }) {
    const { open, upcoming, ended } = data;
    return (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
            <div className="space-y-4">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-ink-2">
                    <span className="h-2 w-2 rounded-full bg-brand animate-pulse-ring" aria-hidden="true" /> Open now
                </h3>
                {open.length === 0 ? (
                    <div className="rounded-[var(--radius-card)] border border-dashed border-line-strong p-6 text-[15px] text-ink-2">
                        No elections are open at the moment. Enroll now so you’re ready when your seat’s election opens.
                    </div>
                ) : (
                    open.map((e, i) => (
                        <Reveal key={e.id} delay={i * 80}>
                            <Link
                                href={`/login?next=/elections/${e.id}`}
                                className="group block rounded-[var(--radius-card)] border border-line bg-surface p-5 transition-[border-color,background-color,transform] duration-200 hover:-translate-y-0.5 hover:border-brand/50 hover:bg-raised active:translate-y-0 sm:p-6"
                            >
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="font-display text-xl font-semibold text-ink">{e.name}</p>
                                        <p className="mt-1 text-sm text-ink-3">
                                            {e.seats.join(", ")} · {e.itemCount} {e.ballotType === "candidate" ? "candidates" : e.ballotType === "proposal" ? "proposal" : "manifestos"}
                                        </p>
                                    </div>
                                    <Countdown to={e.endAt} className="text-sm" />
                                </div>
                                <div className="mt-5 grid items-end gap-4 sm:grid-cols-[1fr_auto]">
                                    <div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-ink-2">Turnout</span>
                                            <span className="font-semibold tabular-nums text-ink">{e.turnout.pct}%</span>
                                        </div>
                                        <Meter value={e.turnout.voted} max={e.turnout.eligible || 1} label={`${e.name} turnout`} className="mt-2" />
                                        <p className="mt-1.5 text-xs text-ink-3">{n(e.turnout.voted)} of {n(e.turnout.eligible)} eligible voters</p>
                                    </div>
                                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand">
                                        Sign in to vote
                                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                                    </span>
                                </div>
                            </Link>
                        </Reveal>
                    ))
                )}
            </div>

            <div className="space-y-6">
                <div>
                    <h3 className="text-sm font-semibold text-ink-2">Coming up</h3>
                    {upcoming.length === 0 ? (
                        <p className="mt-3 text-sm text-ink-3">Nothing scheduled yet.</p>
                    ) : (
                        <ul className="mt-3 divide-y divide-line rounded-[var(--radius-card)] border border-line bg-surface">
                            {upcoming.map((e) => (
                                <li key={e.id} className="px-4 py-3.5">
                                    <p className="font-medium text-ink">{e.name}</p>
                                    <p className="mt-0.5 text-sm text-ink-3">{e.seats.join(", ")}</p>
                                    <Countdown to={e.startAt} prefix="Opens in" endedText="Opening now" className="mt-1.5 block text-sm" />
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-ink-2">Recently decided</h3>
                    {ended.length === 0 ? (
                        <p className="mt-3 text-sm text-ink-3">No results published yet.</p>
                    ) : (
                        <ul className="mt-3 divide-y divide-line rounded-[var(--radius-card)] border border-line bg-surface">
                            {ended.map((e) => (
                                <li key={e.id} className="px-4 py-3.5">
                                    <p className="font-medium text-ink">{e.name}</p>
                                    <p className="mt-0.5 text-sm text-ink-3">
                                        Ended {formatDate(e.endAt)} · {e.turnout.pct}% turnout
                                    </p>
                                    {e.leader && (
                                        <p className="mt-2 flex items-start gap-2 text-sm text-ink">
                                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                                            <span>
                                                <span className="text-ink-3">Most support: </span>
                                                {e.leader}
                                            </span>
                                        </p>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}

function PromiseTracker({ promises }) {
    if (!promises.length) return null;
    return (
        <ul className="grid gap-3 sm:grid-cols-2">
            {promises.map((p, i) => (
                <Reveal as="li" key={p.id} delay={i * 70} className="rounded-[var(--radius-card)] border border-line bg-surface p-4 sm:p-5">
                    <p className="font-semibold leading-snug text-ink">{p.title}</p>
                    <p className="mt-1 text-sm text-ink-3">
                        {p.candidate}{p.party ? ` · ${p.party}` : ""} · {p.seat}
                    </p>
                    {p.due && (
                        <>
                            <Meter value={p.elapsed} max={100} tone={p.overdue ? "danger" : "accent"} label="Time used before the deadline" className="mt-4 h-1.5" delay={150 + i * 70} />
                            <p className={cx("mt-2 text-xs", p.overdue ? "font-semibold text-danger" : "text-ink-3")}>
                                {p.overdue ? `Deadline passed ${formatDate(p.due)}` : `Due ${formatDate(p.due)} · ${p.elapsed}% of the time used`}
                            </p>
                        </>
                    )}
                </Reveal>
            ))}
        </ul>
    );
}

function ChainStrip({ chain }) {
    if (!chain?.length) return null;
    return (
        <div className="rounded-[var(--radius-card)] border border-line bg-surface p-4 sm:p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-3">The newest vote records</p>
            <ol className="mt-4 flex flex-col gap-2 md:flex-row md:items-stretch md:gap-0">
                {chain.map((b, i) => (
                    <li key={b.hash} className="flex flex-col md:flex-1 md:flex-row md:items-center">
                        {i > 0 && (
                            <span className="mx-auto my-0.5 h-5 w-px bg-accent/60 md:mx-0 md:my-0 md:h-px md:w-6 md:shrink-0" aria-hidden="true" />
                        )}
                        <div className="min-w-0 flex-1 rounded-lg border border-line bg-raised px-3 py-2.5 font-mono text-xs">
                            <p className="flex justify-between gap-2 text-ink-2">
                                <span className="font-sans font-semibold text-ink">#{n(b.height)}</span>
                                <span className="font-sans">{timeAgo(b.at)}</span>
                            </p>
                            <p className="mt-1.5 truncate text-accent-ink" title={b.hash}>hash {shortHash(b.hash)}</p>
                            <p className="truncate text-ink-3" title={b.prevHash || ""}>prev {b.prevHash ? shortHash(b.prevHash) : "genesis"}</p>
                        </div>
                    </li>
                ))}
            </ol>
            <p className="mt-3 text-xs text-ink-3">Each record’s “prev” is the hash of the one before it. Who voted is never shown.</p>
        </div>
    );
}

export default async function Home() {
    const data = await getHomeData();
    const openCount = data.ok ? data.open.length : 0;

    return (
        <>
            <SignedOutNotice />

            {/* Hero */}
            <section className="relative overflow-hidden border-b border-line">
                <div className="grid-bg pointer-events-none absolute inset-0" aria-hidden="true" />
                <div
                    className="pointer-events-none absolute -top-40 left-1/2 h-[480px] w-[900px] -translate-x-1/2 rounded-full bg-brand/10 blur-3xl"
                    aria-hidden="true"
                />
                <div className="relative mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)] gap-12 px-4 pb-14 pt-10 sm:px-6 sm:pb-20 sm:pt-16 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-center lg:gap-14 lg:pb-24 lg:pt-20 2xl:max-w-7xl">
                    <div className="min-w-0 animate-rise">
                        {data.ok && (
                            openCount > 0 ? (
                                <LivePill>{openCount === 1 ? "1 election is open now" : `${openCount} elections are open now`}</LivePill>
                            ) : (
                                <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-sm text-ink-2">
                                    <CalendarClock className="h-4 w-4 text-accent" aria-hidden="true" />
                                    No elections open right now
                                </span>
                            )
                        )}
                        <h1 className="mt-6 font-display text-[40px] font-semibold leading-[1.04] tracking-tight text-ink sm:text-6xl lg:text-[64px]">
                            Vote on <em className="relative not-italic text-accent">promises<svg className="absolute -bottom-2 left-0 h-3 w-full text-accent/70" viewBox="0 0 200 12" preserveAspectRatio="none" aria-hidden="true"><path d="M2 9 C 50 2, 120 2, 198 7" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" pathLength="1" strokeDasharray="1" className="animate-draw" /></svg></em>, not just people.
                        </h1>
                        <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-2 sm:text-xl">
                            Read what each candidate in your constituency commits to, vote for the promises you want kept, and petition when a deadline slips.
                        </p>
                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                            <ButtonLink href="/enroll" size="lg">
                                Enroll to vote <ArrowRight className="h-4 w-4" aria-hidden="true" />
                            </ButtonLink>
                            <ButtonLink href="/login" size="lg" variant="secondary">I’ve enrolled, sign in</ButtonLink>
                        </div>
                        <ul className="mt-8 grid gap-x-6 gap-y-2 text-sm text-ink-2 sm:flex sm:flex-wrap">
                            {["One vote per National ID", "Hash-linked vote records", "Results open to everyone"].map((t) => (
                                <li key={t} className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
                                    {t}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="min-w-0 animate-rise [animation-delay:120ms]">
                        <HeroCard data={data} />
                    </div>
                </div>
            </section>

            {data.ok && (
                <section aria-labelledby="numbers-title" className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 sm:py-20 2xl:max-w-7xl">
                    <div className="mb-8 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                        <SectionHeading id="numbers-title" eyebrow="In numbers" title="What’s happening on ChainVote" />
                        <p className="text-sm text-ink-3">Counted live each time this page loads.</p>
                    </div>
                    <StatsBand stats={data.stats} />
                </section>
            )}

            {data.ok && (
                <section id="elections" aria-labelledby="elections-title" className="border-y border-line bg-surface/40">
                    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20 2xl:max-w-7xl">
                        <div className="mb-8">
                            <SectionHeading id="elections-title" eyebrow="Elections" title="Open, upcoming and just decided">
                                You can only vote in your own constituency. Sign in and we’ll take you straight to the ballot.
                            </SectionHeading>
                        </div>
                        <ElectionsSection data={data} />
                    </div>
                </section>
            )}

            {/* How it works */}
            <section id="how-it-works" aria-labelledby="how-title" className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 sm:py-20 2xl:max-w-7xl">
                <SectionHeading id="how-title" eyebrow="How it works" title="From enrolling to following up">
                    Four steps. The first takes about two minutes and you only do it once.
                </SectionHeading>
                <ol className="relative mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
                    <span className="absolute left-6 right-6 top-6 hidden h-px bg-gradient-to-r from-brand/60 via-line-strong to-accent/60 lg:block" aria-hidden="true" />
                    {STEPS.map((s, i) => (
                        <Reveal as="li" key={s.title} delay={i * 90} className="relative">
                            <span className="relative z-10 flex h-12 w-12 items-center justify-center rounded-xl border border-line-strong bg-raised text-brand shadow-[0_0_0_6px_var(--color-canvas)]">
                                <s.icon className="h-5 w-5" aria-hidden="true" />
                            </span>
                            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-accent">Step {i + 1}</p>
                            <h3 className="mt-1 text-lg font-semibold text-ink">{s.title}</h3>
                            <p className="mt-2 text-[15px] leading-relaxed text-ink-2">{s.body}</p>
                        </Reveal>
                    ))}
                </ol>
            </section>

            {/* Accountability */}
            <section id="accountability" aria-labelledby="acc-title" className="border-y border-line bg-surface/40">
                <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:gap-14 2xl:max-w-7xl">
                    <div>
                        <SectionHeading id="acc-title" eyebrow="Accountability" title="Every promise comes with a deadline">
                            Manifestos aren’t slogans here. Each one names what will be done and by when, and voters can act if it isn’t.
                        </SectionHeading>
                        <ol className="mt-8 space-y-5">
                            {[
                                ["Promise approved", "The election office checks the manifesto and publishes it to voters in that seat."],
                                ["Deadline passes", "If the work hasn’t happened, any voter in the seat can file a petition with their reason."],
                                ["Office decides", "Officials accept, reject or dismiss each petition. Enough accepted petitions and the candidate can be removed."],
                            ].map(([t, d], i) => (
                                <li key={t} className="flex gap-4">
                                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-accent/40 bg-accent-soft text-sm font-semibold text-accent-ink">{i + 1}</span>
                                    <div>
                                        <p className="font-semibold text-ink">{t}</p>
                                        <p className="mt-0.5 text-[15px] leading-relaxed text-ink-2">{d}</p>
                                    </div>
                                </li>
                            ))}
                        </ol>
                    </div>
                    <div className="space-y-4">
                        {data.ok && data.promises.length > 0 && (
                            <>
                                <p className="text-sm font-semibold text-ink-2">Recently approved promises</p>
                                <PromiseTracker promises={data.promises} />
                            </>
                        )}
                        {data.ok && <ChainStrip chain={data.chain} />}
                    </div>
                </div>
            </section>

            {/* Safeguards */}
            <section aria-labelledby="safe-title" className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 sm:py-20 2xl:max-w-7xl">
                <SectionHeading id="safe-title" eyebrow="Safeguards" title="How every vote is protected" />
                <div className="mt-10 grid gap-4 sm:grid-cols-2">
                    {SAFEGUARDS.map(({ icon: Icon, title, body }, i) => (
                        <Reveal key={title} delay={i * 70} className="flex gap-4 rounded-[var(--radius-card)] border border-line bg-surface p-5 transition-colors hover:border-line-strong">
                            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
                                <Icon className="h-5 w-5" aria-hidden="true" />
                            </span>
                            <div>
                                <h3 className="font-semibold text-ink">{title}</h3>
                                <p className="mt-1 text-[15px] leading-relaxed text-ink-2">{body}</p>
                            </div>
                        </Reveal>
                    ))}
                </div>
            </section>

            {/* Who it's for */}
            <section id="who-its-for" aria-labelledby="who-title" className="border-y border-line bg-surface/40">
                <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20 2xl:max-w-7xl">
                    <SectionHeading id="who-title" eyebrow="Who it’s for" title="One platform, three ways in">
                        Each group has its own sign-in and only sees what it needs.
                    </SectionHeading>
                    <div className="mt-10 grid gap-4 md:grid-cols-3">
                        {ROLES.map((r, i) => (
                            <Reveal
                                key={r.title}
                                delay={i * 80}
                                className={cx(
                                    "flex flex-col rounded-[var(--radius-card)] border bg-surface p-5 sm:p-6",
                                    i === 0 ? "border-brand/40" : "border-line"
                                )}
                            >
                                <span className={cx("flex h-11 w-11 items-center justify-center rounded-xl", i === 0 ? "bg-brand text-on-brand" : "bg-raised text-ink-2")}>
                                    <r.icon className="h-5 w-5" aria-hidden="true" />
                                </span>
                                <h3 className="mt-4 font-display text-xl font-semibold text-ink">{r.title}</h3>
                                <ul className="mt-3 flex-1 space-y-2 text-[15px] text-ink-2">
                                    {r.points.map((p) => (
                                        <li key={p} className="flex gap-2.5">
                                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
                                            {p}
                                        </li>
                                    ))}
                                </ul>
                                {r.note && <p className="mt-4 text-sm text-ink-3">{r.note}</p>}
                                <div className="mt-6 flex flex-col gap-2">
                                    <ButtonLink href={r.cta.href} variant={i === 0 ? "primary" : "secondary"} block>
                                        {r.cta.label}
                                    </ButtonLink>
                                    {r.secondary && (
                                        <ButtonLink href={r.secondary.href} variant="ghost" block>
                                            {r.secondary.label}
                                        </ButtonLink>
                                    )}
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* Questions */}
            <section id="questions" aria-labelledby="faq-title" className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1fr_1.6fr] lg:gap-16 2xl:max-w-7xl">
                <SectionHeading id="faq-title" eyebrow="Questions" title="Good to know before you start" />
                <div className="divide-y divide-line rounded-[var(--radius-card)] border border-line bg-surface">
                    {FAQ.map((f) => (
                        <details key={f.q} className="group px-5">
                            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 font-semibold text-ink transition-colors hover:text-brand [&::-webkit-details-marker]:hidden">
                                {f.q}
                                <span
                                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-line-strong text-lg leading-none text-ink-2 transition-transform duration-200 group-open:rotate-45 group-open:border-brand group-open:text-brand"
                                    aria-hidden="true"
                                >
                                    +
                                </span>
                            </summary>
                            <p className="-mt-1 animate-fade pb-5 text-[15px] leading-relaxed text-ink-2">{f.a}</p>
                        </details>
                    ))}
                </div>
            </section>

            {/* Closing call to action */}
            <section className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6 sm:pb-24 2xl:max-w-7xl">
                <Reveal className="relative overflow-hidden rounded-2xl border border-brand/30 bg-brand-soft px-6 py-10 sm:px-10 sm:py-12">
                    <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-accent/10 blur-3xl" aria-hidden="true" />
                    <div className="relative flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
                        <div>
                            <h2 className="font-display text-[28px] font-semibold leading-tight text-ink sm:text-[34px]">Ready when your seat’s election opens?</h2>
                            <p className="mt-2 text-[17px] text-ink-2">Enroll now. It takes about two minutes and you only do it once.</p>
                        </div>
                        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                            <ButtonLink href="/enroll" size="lg">Enroll to vote</ButtonLink>
                            <ButtonLink href="/login" size="lg" variant="secondary">Sign in</ButtonLink>
                        </div>
                    </div>
                </Reveal>
            </section>
        </>
    );
}
