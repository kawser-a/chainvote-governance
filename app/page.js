import Link from "next/link";
import { IdCard, Smartphone, KeyRound, Link2, UserCheck, MapPin, FileSearch } from "lucide-react";
import { ButtonLink } from "./components/ui/primitives";
import SignedOutNotice from "./components/site/SignedOutNotice";

const STEPS = [
    {
        title: "Enroll once",
        body: "Confirm your National ID with a one-time code sent to the mobile number registered to it, then choose a 6-digit PIN.",
    },
    {
        title: "Read what’s on offer",
        body: "Each candidate in your constituency publishes manifestos: specific promises with a deadline. Read them side by side.",
    },
    {
        title: "Review, then vote",
        body: "Pick the commitments you support. You’ll see a summary to check before anything is submitted. Once you confirm, your vote is final.",
    },
    {
        title: "Follow up",
        body: "See results when voting closes. If an elected candidate misses a deadline, file a petition and the election office reviews it.",
    },
];

const ROLES = [
    {
        id: "voters",
        title: "Voters",
        points: ["See elections in your constituency", "Compare candidates’ manifestos", "Vote and see results", "Petition when promises aren’t kept"],
        cta: { href: "/enroll", label: "Enroll to vote" },
        secondary: { href: "/login", label: "Voter sign in" },
    },
    {
        id: "candidates",
        title: "Candidates",
        points: ["Publish manifestos with clear deadlines", "Keep your profile up to date", "Follow results for your seat", "See and respond to petitions"],
        cta: { href: "/candidate/login", label: "Candidate sign in" },
        note: "Accounts are created by the election office.",
    },
    {
        id: "officials",
        title: "Election officials",
        points: ["Set up and schedule elections", "Approve candidates and manifestos", "Manage the voter roll", "Review petitions and publish results"],
        cta: { href: "/admin/login", label: "Official sign in" },
    },
];

const SAFEGUARDS = [
    { icon: Link2, title: "Each vote is linked to the last", body: "Every vote record stores a fingerprint (SHA-256 hash) of the one before it, so changing or removing a past vote breaks the chain and shows up." },
    { icon: UserCheck, title: "One vote per person", body: "The system refuses a second vote for the same item from the same National ID, and only enrolled voters can vote." },
    { icon: MapPin, title: "Only your constituency", body: "You only see, and can only vote in, elections for the seat you’re registered in." },
    { icon: FileSearch, title: "Open results", body: "Results are broken down by candidate and by manifesto, so everyone can see exactly which promises won support." },
];

const FAQ = [
    {
        q: "Is this an official government election?",
        a: "No. ChainVote is a working prototype of how participatory voting could work. Don’t use it for real elections.",
    },
    {
        q: "Why do I need my mobile number?",
        a: "To prove the National ID is yours, we send a one-time code to a SIM card registered to that ID. You choose which of your registered numbers to use.",
    },
    {
        q: "Can I change my vote after submitting it?",
        a: "No. That’s why you get a review step before your vote is submitted. You can change your selection as many times as you like until you confirm.",
    },
    {
        q: "What is a manifesto ballot?",
        a: "Instead of voting only for a person, you vote for the specific commitments you want delivered. In some elections you can support more than one.",
    },
    {
        q: "What happens after I file a petition?",
        a: "Election officials review it and mark it accepted, rejected or dismissed. If enough voters petition against a candidate, officials can remove them.",
    },
];

export default function Home() {
    return (
        <>
            <SignedOutNotice />

            {/* Intro */}
            <section className="border-b border-line bg-surface">
                <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1.25fr_1fr] lg:items-center lg:gap-16 lg:py-24">
                    <div>
                        <h1 className="text-[34px] font-bold leading-[1.1] tracking-tight text-ink sm:text-5xl">
                            Vote on what candidates promise. Then hold them to it.
                        </h1>
                        <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-2">
                            Compare the written commitments of candidates in your constituency, vote for the ones you support, and file a petition if a promise isn’t kept.
                        </p>
                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                            <ButtonLink href="/enroll" size="lg">Enroll to vote</ButtonLink>
                            <ButtonLink href="/login" size="lg" variant="secondary">I’ve enrolled, sign in</ButtonLink>
                        </div>
                    </div>

                    <div className="rounded-[var(--radius-card)] border border-line bg-canvas p-5 sm:p-6">
                        <h2 className="text-base font-semibold text-ink">Before you start, have these ready</h2>
                        <ul className="mt-4 space-y-4">
                            {[
                                [IdCard, "Your National ID number", "10, 13 or 17 digits"],
                                [Smartphone, "A phone with your registered SIM", "We text a 6-digit code to it"],
                                [KeyRound, "A 6-digit PIN you’ll remember", "You’ll use it every time you sign in"],
                            ].map(([Icon, t, d]) => (
                                <li key={t} className="flex gap-3">
                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-surface text-brand ring-1 ring-line">
                                        <Icon className="h-5 w-5" aria-hidden="true" />
                                    </span>
                                    <span>
                                        <span className="block font-medium text-ink">{t}</span>
                                        <span className="block text-sm text-ink-3">{d}</span>
                                    </span>
                                </li>
                            ))}
                        </ul>
                        <p className="mt-5 border-t border-line pt-4 text-sm text-ink-2">Enrolling takes about two minutes.</p>
                    </div>
                </div>
            </section>

            {/* How it works */}
            <section id="how-it-works" className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
                <h2 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">How it works</h2>
                <p className="mt-2 max-w-2xl text-ink-2">Four steps, from enrolling to following up after the election.</p>
                <ol className="mt-10 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
                    {STEPS.map((s, i) => (
                        <li key={s.title} className="border-t-2 border-brand pt-4">
                            <p className="text-sm font-semibold text-brand">Step {i + 1}</p>
                            <h3 className="mt-1 text-lg font-semibold text-ink">{s.title}</h3>
                            <p className="mt-2 text-[15px] leading-relaxed text-ink-2">{s.body}</p>
                        </li>
                    ))}
                </ol>
            </section>

            {/* Who it's for */}
            <section id="who-its-for" className="border-y border-line bg-surface">
                <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
                    <h2 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">Who it’s for</h2>
                    <p className="mt-2 max-w-2xl text-ink-2">Each group has its own sign-in and only sees what it needs.</p>
                    <div className="mt-10 grid gap-5 md:grid-cols-3">
                        {ROLES.map((r) => (
                            <div key={r.id} id={r.id} className="flex flex-col rounded-[var(--radius-card)] border border-line bg-canvas p-5 sm:p-6">
                                <h3 className="text-lg font-semibold text-ink">{r.title}</h3>
                                <ul className="mt-3 flex-1 space-y-2 text-[15px] text-ink-2">
                                    {r.points.map((p) => (
                                        <li key={p} className="flex gap-2">
                                            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" aria-hidden="true" />
                                            {p}
                                        </li>
                                    ))}
                                </ul>
                                {r.note && <p className="mt-4 text-sm text-ink-3">{r.note}</p>}
                                <div className="mt-5 flex flex-col gap-2">
                                    <ButtonLink href={r.cta.href} variant={r.id === "voters" ? "primary" : "secondary"} block>
                                        {r.cta.label}
                                    </ButtonLink>
                                    {r.secondary && (
                                        <ButtonLink href={r.secondary.href} variant="ghost" block>
                                            {r.secondary.label}
                                        </ButtonLink>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Safeguards */}
            <section className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
                <h2 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">How the count is protected</h2>
                <p className="mt-2 max-w-2xl text-ink-2">What the system does to keep each vote counted once, by the right person.</p>
                <div className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2">
                    {SAFEGUARDS.map(({ icon: Icon, title, body }) => (
                        <div key={title} className="flex gap-4">
                            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-brand-soft text-brand">
                                <Icon className="h-5 w-5" aria-hidden="true" />
                            </span>
                            <div>
                                <h3 className="font-semibold text-ink">{title}</h3>
                                <p className="mt-1 text-[15px] leading-relaxed text-ink-2">{body}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Questions */}
            <section id="questions" className="border-t border-line bg-surface">
                <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1fr_2fr] lg:gap-16">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">Questions</h2>
                        <p className="mt-2 text-ink-2">
                            Ready to start?{" "}
                            <Link href="/enroll" className="font-semibold text-brand underline hover:text-brand-hover">Enroll to vote</Link>
                        </p>
                    </div>
                    <div className="divide-y divide-line border-y border-line">
                        {FAQ.map((f) => (
                            <details key={f.q} className="group">
                                <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 font-semibold text-ink [&::-webkit-details-marker]:hidden">
                                    {f.q}
                                    <span className="text-xl leading-none text-ink-3 transition-transform group-open:rotate-45" aria-hidden="true">+</span>
                                </summary>
                                <p className="-mt-1 pb-5 text-[15px] leading-relaxed text-ink-2">{f.a}</p>
                            </details>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
}
