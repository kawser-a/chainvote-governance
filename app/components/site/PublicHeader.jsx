"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import Logo from "./Logo";
import { ButtonLink, cx } from "../ui/primitives";
import { useAuth } from "../../context/AuthContext";

const LINKS = [
    { href: "/#elections", label: "Elections" },
    { href: "/#how-it-works", label: "How it works" },
    { href: "/#accountability", label: "Accountability" },
    { href: "/#questions", label: "Questions" },
];

export default function PublicHeader() {
    const pathname = usePathname();
    const { user } = useAuth() || {};
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => setOpen(false), [pathname]);

    useEffect(() => {
        if (!open) return;
        const onKey = (e) => e.key === "Escape" && setOpen(false);
        const onDown = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
        document.addEventListener("keydown", onKey);
        document.addEventListener("pointerdown", onDown);
        return () => {
            document.removeEventListener("keydown", onKey);
            document.removeEventListener("pointerdown", onDown);
        };
    }, [open]);

    const onSignIn = pathname === "/login" || pathname === "/candidate/login" || pathname === "/admin/login";

    const actions = user ? (
        <ButtonLink href="/dashboard" size="md">Go to your dashboard</ButtonLink>
    ) : (
        <>
            {!onSignIn && (
                <ButtonLink href="/login" variant="secondary">Sign in</ButtonLink>
            )}
            {pathname !== "/enroll" && <ButtonLink href="/enroll">Enroll to vote</ButtonLink>}
        </>
    );

    return (
        <header ref={ref} className="sticky top-0 z-40 border-b border-line/70 bg-canvas/80 backdrop-blur-md">
            <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
                <Logo />

                <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
                    {LINKS.map((l) => (
                        <Link key={l.href} href={l.href} className="rounded-lg px-3 py-2 text-[15px] font-medium text-ink-2 transition-colors hover:bg-subtle hover:text-ink active:bg-line">
                            {l.label}
                        </Link>
                    ))}
                </nav>

                <div className="hidden items-center gap-2 lg:flex">{actions}</div>

                <button
                    type="button"
                    onClick={() => setOpen((v) => !v)}
                    aria-expanded={open}
                    aria-controls="site-menu"
                    className="inline-flex h-11 items-center gap-2 rounded-lg border border-line-strong px-3 text-[15px] font-semibold text-ink transition-colors hover:bg-subtle active:bg-line lg:hidden"
                >
                    {open ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
                    Menu
                </button>
            </div>

            <div id="site-menu" hidden={!open} className={cx("animate-fade border-t border-line bg-surface lg:hidden")}>
                <nav aria-label="Main" className="mx-auto flex max-w-6xl flex-col px-4 py-2 sm:px-6">
                    {LINKS.map((l) => (
                        <Link
                            key={l.href}
                            href={l.href}
                            onClick={() => setOpen(false)}
                            className="flex min-h-12 items-center border-b border-line text-base font-medium text-ink last:border-0"
                        >
                            {l.label}
                        </Link>
                    ))}
                </nav>
                <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 pb-4 pt-1 sm:flex-row sm:px-6 [&>a]:w-full sm:[&>a]:w-auto">
                    {actions}
                </div>
            </div>
        </header>
    );
}
