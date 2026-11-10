import Link from "next/link";
import Logo from "./Logo";

const GROUPS = [
    {
        title: "Voters",
        links: [
            { href: "/enroll", label: "Enroll to vote" },
            { href: "/login", label: "Voter sign in" },
            { href: "/#how-it-works", label: "How voting works" },
        ],
    },
    {
        title: "Candidates and officials",
        links: [
            { href: "/candidate/login", label: "Candidate sign in" },
            { href: "/admin/login", label: "Election official sign in" },
        ],
    },
    {
        title: "About",
        links: [
            { href: "/#questions", label: "Questions" },
            { href: "https://github.com/kawser-a/chainvote-governance", label: "Source code on GitHub" },
        ],
    },
];

export default function SiteFooter() {
    return (
        <footer className="border-t border-line bg-surface">
            <div className="mx-auto grid max-w-6xl grid-cols-2 gap-x-6 gap-y-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_repeat(3,1fr)]">
                <div className="col-span-2 max-w-xs md:col-span-1">
                    <Logo />
                    <p className="mt-3 text-sm text-ink-2">
                        A participatory governance platform where voters choose between candidates&apos; written commitments and can hold them to account afterwards.
                    </p>
                </div>
                {GROUPS.map((g) => (
                    <div key={g.title}>
                        <h2 className="text-sm font-semibold text-ink">{g.title}</h2>
                        <ul className="mt-3 space-y-1">
                            {g.links.map((l) => (
                                <li key={l.href}>
                                    <Link href={l.href} className="inline-flex min-h-9 pointer-coarse:min-h-11 items-center text-sm text-ink-2 hover:text-ink hover:underline">
                                        {l.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
            <div className="border-t border-line">
                <p className="mx-auto max-w-6xl px-4 py-5 text-sm text-ink-3 sm:px-6">
                    ChainVote is a working prototype built for the Blockchain Olympiad 2025. It is not an official election service.
                </p>
            </div>
        </footer>
    );
}
