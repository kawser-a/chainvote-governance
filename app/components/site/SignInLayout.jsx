"use client";
import Link from "next/link";
import { cx } from "../ui/primitives";

const ROLES = [
    { key: "voter", href: "/login", label: "Voter" },
    { key: "candidate", href: "/candidate/login", label: "Candidate" },
    { key: "admin", href: "/admin/login", label: "Election official" },
];

// Shared frame for the three sign-in pages: same layout, same place to switch account type.
export default function SignInLayout({ role, title, description, children, aside }) {
    return (
        <div className="flex flex-1 items-start justify-center px-4 py-8 sm:px-6 sm:py-14">
            <div className="grid w-full max-w-5xl gap-8 lg:grid-cols-[minmax(0,28rem)_1fr] lg:gap-16">
                <div className="w-full">
                    <nav aria-label="Account type" className="mb-6">
                        <p className="mb-2 text-sm font-medium text-ink-2">Signing in as</p>
                        <ul className="grid grid-cols-3 gap-1 rounded-lg border border-line bg-subtle p-1">
                            {ROLES.map((r) => {
                                const active = r.key === role;
                                return (
                                    <li key={r.key}>
                                        <Link
                                            href={r.href}
                                            aria-current={active ? "page" : undefined}
                                            className={cx(
                                                "flex min-h-11 items-center justify-center rounded-md px-2 text-center text-sm font-semibold leading-tight",
                                                active ? "bg-surface text-ink shadow-sm ring-1 ring-line" : "text-ink-2 hover:text-ink"
                                            )}
                                        >
                                            {r.label}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>

                    <div className="rounded-[var(--radius-card)] border border-line bg-surface p-5 shadow-sm sm:p-8">
                        <h1 className="text-2xl font-bold tracking-tight text-ink">{title}</h1>
                        {description && <p className="mt-1.5 text-[15px] text-ink-2">{description}</p>}
                        <div className="mt-6">{children}</div>
                    </div>
                </div>

                {aside && <aside className="hidden lg:block lg:pt-16">{aside}</aside>}
            </div>
        </div>
    );
}

export function safeNext(next, fallback) {
    // Only allow same-site relative paths, never "//host" or full URLs.
    return typeof next === "string" && next.startsWith("/") && !next.startsWith("//") ? next : fallback;
}
