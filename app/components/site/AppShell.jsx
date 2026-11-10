"use client";
// One layout for every signed-in area (voter, candidate, election official).
// Same structure, same labels, same sign-out place, so moving between roles never means relearning the UI.
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
    LayoutDashboard, Vote, FileWarning, FileText, UserRound, BarChart3, Users, IdCard, Menu, X, LogOut, ShieldCheck,
} from "lucide-react";
import Logo from "./Logo";
import { cx } from "../ui/primitives";

const ROLES = {
    voter: {
        label: "Voter",
        home: "/dashboard",
        me: "/api/me",
        logout: "/api/logout",
        nav: [
            { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true, tab: true },
            { href: "/elections", label: "Elections", icon: Vote, tab: true },
            { href: "/petitions", label: "My petitions", short: "Petitions", icon: FileWarning, tab: true },
        ],
        identity: (d) => ({ name: d.name || "Voter", detail: d.seat ? `${d.seat} · NID ${d.sub}` : `NID ${d.sub}` }),
    },
    candidate: {
        label: "Candidate",
        home: "/candidate/dashboard",
        me: "/api/candidate/me",
        logout: "/api/candidate/logout",
        nav: [
            { href: "/candidate/dashboard", label: "Overview", icon: LayoutDashboard, tab: true },
            { href: "/candidate/manifestos", label: "Manifestos", icon: FileText, tab: true },
            { href: "/candidate/elections", label: "Elections", icon: Vote, tab: true },
            { href: "/candidate/results", label: "Results", icon: BarChart3 },
            { href: "/candidate/petitions", label: "Petitions", icon: FileWarning },
            { href: "/candidate/profile", label: "Profile", icon: UserRound },
        ],
        identity: (d) => ({ name: d.name || "Candidate", detail: [d.seat, d.independent ? "Independent" : d.partyName].filter(Boolean).join(" · ") }),
    },
    admin: {
        label: "Election official",
        home: "/admin/dashboard",
        me: "/api/admin/me",
        logout: "/api/admin/logout",
        nav: [
            { href: "/admin/dashboard", label: "Overview", icon: LayoutDashboard, tab: true },
            { href: "/admin/elections", label: "Elections", icon: Vote, tab: true },
            { href: "/admin/candidates", label: "Candidates", icon: Users },
            { href: "/admin/manifestos", label: "Manifestos", icon: FileText, tab: true },
            { href: "/admin/voters", label: "Voters", icon: IdCard },
            { href: "/admin/petitions", label: "Petitions", icon: FileWarning },
            { href: "/admin/results", label: "Results", icon: BarChart3 },
        ],
        identity: (d) => ({ name: d.username || "Admin", detail: "Administrator" }),
    },
};

function isActive(pathname, item) {
    if (item.exact) return pathname === item.href;
    return pathname === item.href || pathname.startsWith(item.href + "/");
}

function NavList({ role, pathname, onNavigate }) {
    return (
        <ul className="space-y-1">
            {role.nav.map((item) => {
                const active = isActive(pathname, item);
                const Icon = item.icon;
                return (
                    <li key={item.href}>
                        <Link
                            href={item.href}
                            onClick={onNavigate}
                            aria-current={active ? "page" : undefined}
                            className={cx(
                                "relative flex min-h-11 items-center gap-3 rounded-lg px-3 text-[15px] font-medium transition-colors duration-150",
                                active
                                    ? "bg-brand-soft text-brand-ink before:absolute before:inset-y-2 before:-left-3 before:w-1 before:rounded-r-full before:bg-brand"
                                    : "text-ink-2 hover:bg-subtle hover:text-ink active:bg-line"
                            )}
                        >
                            <Icon className={cx("h-5 w-5 shrink-0", active ? "text-brand" : "text-ink-3")} aria-hidden="true" />
                            {item.label}
                        </Link>
                    </li>
                );
            })}
        </ul>
    );
}

function RoleChip({ role, className }) {
    return (
        <span
            className={cx(
                "inline-flex w-fit items-center gap-1.5 rounded-full border border-accent/30 bg-accent-soft px-2.5 py-1 text-xs font-semibold text-accent-ink",
                className
            )}
        >
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
            {role.label} portal
        </span>
    );
}

function Identity({ role, me, onSignOut, signingOut }) {
    const id = me ? role.identity(me) : null;
    return (
        <div className="border-t border-line p-3">
            <div className="px-3 py-2">
                <p className="text-xs font-medium text-ink-3">Signed in</p>
                {id ? (
                    <>
                        <p className="mt-1 truncate font-semibold text-ink">{id.name}</p>
                        {id.detail && <p className="truncate text-sm text-ink-3">{id.detail}</p>}
                    </>
                ) : (
                    <div className="skeleton mt-2 h-9 rounded" aria-hidden="true" />
                )}
            </div>
            <button
                type="button"
                onClick={onSignOut}
                disabled={signingOut}
                className="mt-1 flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-[15px] font-medium text-ink-2 transition-colors hover:bg-danger-soft hover:text-danger active:bg-danger-soft disabled:opacity-60 [&:hover>svg]:text-danger"
            >
                <LogOut className="h-5 w-5 text-ink-3" aria-hidden="true" />
                {signingOut ? "Signing out…" : "Sign out"}
            </button>
        </div>
    );
}

export default function AppShell({ roleKey, children }) {
    const role = ROLES[roleKey];
    const pathname = usePathname();
    const [me, setMe] = useState(null);
    const [drawer, setDrawer] = useState(false);
    const [signingOut, setSigningOut] = useState(false);
    const drawerRef = useRef(null);
    const toggleRef = useRef(null);

    useEffect(() => {
        let alive = true;
        fetch(role.me, { credentials: "include", cache: "no-store" })
            .then((r) => r.json())
            .then((d) => alive && d?.ok && setMe(d))
            .catch(() => {});
        return () => { alive = false; };
    }, [role.me]);

    useEffect(() => setDrawer(false), [pathname]);

    // Drawer: Escape closes, focus moves in on open and back to the toggle on close.
    useEffect(() => {
        if (!drawer) return;
        const prev = document.activeElement;
        drawerRef.current?.querySelector("a,button")?.focus();
        const onKey = (e) => e.key === "Escape" && setDrawer(false);
        document.addEventListener("keydown", onKey);
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = "";
            (prev instanceof HTMLElement ? prev : toggleRef.current)?.focus?.();
        };
    }, [drawer]);

    async function signOut() {
        setSigningOut(true);
        try {
            await fetch(role.logout, { method: "POST", credentials: "include" });
        } finally {
            window.location.href = "/?signed-out=1";
        }
    }

    const current = role.nav.find((i) => isActive(pathname, i));
    const tabs = role.nav.filter((i) => i.tab);
    // Voting is a focused task: no tab bar under the ballot.
    const focusMode = /^\/elections\/[^/]+$/.test(pathname);

    return (
        <div className="min-h-dvh bg-canvas">
            <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[70] focus:rounded-md focus:bg-surface focus:px-4 focus:py-3 focus:font-semibold focus:shadow">
                Skip to main content
            </a>

            {/* Desktop sidebar */}
            <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-line bg-surface lg:flex print:!hidden">
                <div className="flex h-16 items-center justify-between gap-2 border-b border-line px-5">
                    <Logo href={role.home} label={`ChainVote ${role.label.toLowerCase()} home`} />
                </div>
                <RoleChip role={role} className="mx-6 mt-4" />
                <nav aria-label={`${role.label} navigation`} className="flex-1 overflow-y-auto p-3">
                    <NavList role={role} pathname={pathname} />
                </nav>
                <Identity role={role} me={me} onSignOut={signOut} signingOut={signingOut} />
            </aside>

            {/* Mobile and tablet top bar */}
            <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-line bg-surface/90 px-4 backdrop-blur-md lg:hidden print:hidden">
                <div className="flex min-w-0 items-center gap-2.5">
                    <Logo href={role.home} label={`ChainVote ${role.label.toLowerCase()} home`} className="shrink-0 [&>span]:hidden md:[&>span]:inline" />
                    {current && <span className="truncate text-[15px] font-semibold text-ink md:hidden">{current.label}</span>}
                </div>
                <div className="flex items-center gap-2">
                    <RoleChip role={role} className="hidden sm:inline-flex" />
                    {focusMode && (
                        <button
                            ref={toggleRef}
                            type="button"
                            onClick={() => setDrawer(true)}
                            aria-expanded={drawer}
                            aria-controls="app-drawer"
                            className="inline-flex h-11 items-center gap-2 rounded-lg border border-line-strong px-3 text-[15px] font-semibold text-ink transition-colors hover:bg-subtle active:bg-line"
                        >
                            <Menu className="h-5 w-5" aria-hidden="true" />
                            Menu
                        </button>
                    )}
                </div>
            </header>

            {/* Phone and tablet tab bar: the most used pages one tap away, everything else under More. */}
            {!focusMode && (
                <nav
                    aria-label={`${role.label} quick navigation`}
                    className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden print:hidden"
                >
                    <ul className="mx-auto grid max-w-xl" style={{ gridTemplateColumns: `repeat(${tabs.length + 1}, minmax(0, 1fr))` }}>
                        {tabs.map((item) => {
                            const active = isActive(pathname, item);
                            const Icon = item.icon;
                            return (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        aria-current={active ? "page" : undefined}
                                        className={cx(
                                            "relative flex h-16 flex-col items-center justify-center gap-1 text-xs font-medium transition-colors active:bg-subtle",
                                            active ? "text-brand" : "text-ink-3 hover:text-ink"
                                        )}
                                    >
                                        {active && <span className="absolute inset-x-5 top-0 h-0.5 rounded-b-full bg-brand" aria-hidden="true" />}
                                        <Icon className={cx("h-5 w-5 transition-transform", active && "-translate-y-px")} aria-hidden="true" />
                                        <span className="truncate px-1">{item.short || item.label}</span>
                                    </Link>
                                </li>
                            );
                        })}
                        <li>
                            <button
                                ref={toggleRef}
                                type="button"
                                onClick={() => setDrawer(true)}
                                aria-expanded={drawer}
                                aria-controls="app-drawer"
                                className={cx(
                                    "flex h-16 w-full flex-col items-center justify-center gap-1 text-xs font-medium transition-colors active:bg-subtle",
                                    current && !current.tab ? "text-brand" : "text-ink-3 hover:text-ink"
                                )}
                            >
                                <Menu className="h-5 w-5" aria-hidden="true" />
                                More
                            </button>
                        </li>
                    </ul>
                </nav>
            )}

            {/* Mobile drawer */}
            <div className={cx("fixed inset-0 z-50 transition-[visibility] duration-200 lg:hidden", drawer ? "visible" : "invisible pointer-events-none")} aria-hidden={!drawer}>
                <div
                    className={cx("absolute inset-0 bg-black/60 backdrop-blur-[2px] transition-opacity duration-300", drawer ? "opacity-100" : "opacity-0")}
                    onClick={() => setDrawer(false)}
                />
                <div
                    id="app-drawer"
                    ref={drawerRef}
                    role="dialog"
                    aria-modal="true"
                    aria-label={`${role.label} menu`}
                    inert={!drawer}
                    className={cx(
                        "absolute inset-y-0 right-0 flex w-[min(20rem,88vw)] flex-col border-l border-line bg-surface shadow-[0_0_60px_rgb(0_0_0/0.6)] transition-transform duration-300 ease-[var(--ease-out-soft)]",
                        drawer ? "translate-x-0" : "translate-x-full"
                    )}
                >
                    <div className="flex h-14 items-center justify-between border-b border-line px-4">
                        <RoleChip role={role} />
                        <button
                            type="button"
                            onClick={() => setDrawer(false)}
                            className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-ink-2 transition-colors hover:bg-subtle hover:text-ink active:bg-line"
                            aria-label="Close menu"
                        >
                            <X className="h-5 w-5" aria-hidden="true" />
                        </button>
                    </div>
                    <nav aria-label={`${role.label} navigation`} className="flex-1 overflow-y-auto p-3">
                        <NavList role={role} pathname={pathname} onNavigate={() => setDrawer(false)} />
                    </nav>
                    <Identity role={role} me={me} onSignOut={signOut} signingOut={signingOut} />
                </div>
            </div>

            <main id="main" tabIndex={-1} className={cx("lg:pl-64 print:pl-0 focus:outline-none", !focusMode && "pb-[calc(4rem+env(safe-area-inset-bottom))] lg:pb-0")}>
                <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10 2xl:max-w-7xl">{children}</div>
            </main>
        </div>
    );
}
