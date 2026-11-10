"use client";
import { usePathname } from "next/navigation";
import PublicHeader from "./site/PublicHeader";
import SiteFooter from "./site/SiteFooter";
import AppShell from "./site/AppShell";

const PUBLIC_IN_PORTALS = new Set(["/admin/login", "/candidate/login"]);

function roleFor(pathname) {
    if (PUBLIC_IN_PORTALS.has(pathname)) return null;
    if (pathname.startsWith("/admin")) return "admin";
    if (pathname.startsWith("/candidate")) return "candidate";
    if (pathname.startsWith("/dashboard") || pathname.startsWith("/elections") || pathname.startsWith("/petitions")) return "voter";
    return null;
}

export default function LayoutWrapper({ children }) {
    const pathname = usePathname() || "/";
    const role = roleFor(pathname);

    if (role) return <AppShell roleKey={role}>{children}</AppShell>;

    return (
        <div className="flex min-h-dvh flex-col">
            <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[70] focus:rounded-md focus:bg-surface focus:px-4 focus:py-3 focus:font-semibold focus:shadow">
                Skip to main content
            </a>
            <PublicHeader />
            <main id="main" tabIndex={-1} className="flex flex-1 flex-col focus:outline-none">
                {children}
            </main>
            <SiteFooter />
        </div>
    );
}
