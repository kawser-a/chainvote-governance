"use client";
// One layout for every signed-in area (voter, candidate, election official).
// Same structure, same labels, same sign-out place, so moving between roles never means relearning the UI.
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
    LayoutDashboard, Vote, FileWarning, FileText, UserRound, BarChart3, Users, IdCard, Menu, X, LogOut,
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
            { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
            { href: "/elections", label: "Elections", icon: Vote },
            { href: "/petitions", label: "My petitions", icon: FileWarning },
        ],
        identity: (d) => ({ name: d.name || "Voter", detail: d.seat ? `${d.seat} · NID ${d.sub}` : `NID ${d.sub}` }),
    },
    candidate: {
        label: "Candidate",
        home: "/candidate/dashboard",
        me: "/api/candidate/me",
        logout: "/api/candidate/logout",
        nav: [
            { href: "/candidate/dashboard", label: "Overview", icon: LayoutDashboard },
            { href: "/candidate/manifestos", label: "Manifestos", icon: FileText },
            { href: "/candidate/elections", label: "Elections", icon: Vote },
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
            { href: "/admin/dashboard", label: "Overview", icon: LayoutDashboard },
            { href: "/admin/elections", label: "Elections", icon: Vote },
            { href: "/admin/candidates", label: "Candidates", icon: Users },
            { href: "/admin/manifestos", label: "Manifestos", icon: FileText },
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
                                "flex min-h-11 items-center gap-3 rounded-md px-3 text-[15px] font-medium transition-colors",
                                active ? "bg-brand-soft text-brand-ink" : "text-ink-2 hover:bg-subtle hover:text-ink"
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

function Identity({ role, me, onSignOut, signingOut }) {
    const id = me ? role.identity(me) : null;
    return (
        <div className="border-t border-line p-3">
            <div className="px-3 py-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-3">Signed in as {role.label.toLowerCase()}</p>
                {id ? (
                    <>
                        <p className="mt-1 truncate font-semibold text-ink">{id.name}</p>
                        {id.detail && <p className="truncate text-sm text-ink-3">{id.detail}</p>}
                    </>
                ) : (
                    <div className="mt-2 h-9 animate-pulse rounded bg-subtle" aria-hidden="true" />
                )}
            </div>
            <button
                type="button"
                onClick={onSignOut}
                disabled={signingOut}
                className="mt-1 flex min-h-11 w-full items-center gap-3 rounded-md px-3 text-[15px] font-medium text-ink-2 hover:bg-subtle hover:text-ink disabled:opacity-60"
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

    return (
        <div className="min-h-dvh bg-canvas">
            <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[70] focus:rounded-md focus:bg-surface focus:px-4 focus:py-3 focus:font-semibold focus:shadow">
                Skip to main content
            </a>

            {/* Desktop sidebar */}
            <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-line bg-surface lg:flex">
                <div className="flex h-16 items-center border-b border-line px-5">
                    <Logo href={role.home} label={`ChainVote ${role.label.toLowerCase()} home`} />
                </div>
                <nav aria-label={`${role.label} navigation`} className="flex-1 overflow-y-auto p-3">
                    <NavList role={role} pathname={pathname} />
                </nav>
                <Identity role={role} me={me} onSignOut={signOut} signingOut={signingOut} />
            </aside>

            {/* Mobile and tablet top bar */}
            <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-line bg-surface px-4 lg:hidden">
                <div className="flex min-w-0 items-center gap-2">
                    <Logo href={role.home} label={`ChainVote ${role.label.toLowerCase()} home`} className="shrink-0 [&>span]:hidden sm:[&>span]:inline" />
                    {current && <span className="truncate text-[15px] font-semibold text-ink sm:hidden">{current.label}</span>}
                </div>
                <button
                    ref={toggleRef}
                    type="button"
                    onClick={() => setDrawer(true)}
                    aria-expanded={drawer}
                    aria-controls="app-drawer"
                    className="inline-flex h-11 items-center gap-2 rounded-md border border-line-strong px-3 text-[15px] font-semibold text-ink hover:bg-subtle"
                >
                    <Menu className="h-5 w-5" aria-hidden="true" />
                    Menu
                </button>
            </header>

            {/* Mobile drawer */}
            <div className={cx("fixed inset-0 z-50 transition-[visibility] duration-200 lg:hidden", drawer ? "visible" : "invisible pointer-events-none")} aria-hidden={!drawer}>
                <div
                    className={cx("absolute inset-0 bg-ink/50 transition-opacity", drawer ? "opacity-100" : "opacity-0")}
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
                        "absolute inset-y-0 right-0 flex w-[min(20rem,88vw)] flex-col bg-surface shadow-xl transition-transform",
                        drawer ? "translate-x-0" : "translate-x-full"
                    )}
                >
                    <div className="flex h-14 items-center justify-between border-b border-line px-4">
                        <p className="font-semibold text-ink">{role.label} menu</p>
                        <button
                            type="button"
                            onClick={() => setDrawer(false)}
                            className="inline-flex h-11 w-11 items-center justify-center rounded-md text-ink-2 hover:bg-subtle"
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

            <main id="main" tabIndex={-1} className="lg:pl-64 focus:outline-none">
                <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">{children}</div>
            </main>
        </div>
    );
}
