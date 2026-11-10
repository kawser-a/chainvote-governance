"use client";
import { usePathname } from "next/navigation";
import Header from "./header";
import AdminSidebar from "./AdminSidebar";
import CandidateSidebar from "./CandidateSidebar";
import VoterSidebar from "./VoterSidebar";

export default function LayoutWrapper({ children }) {
    const pathname = usePathname();

    const isAdmin = pathname.startsWith("/admin");
    const isAdminLogin = pathname === "/admin/login";

    const isCandidate = pathname.startsWith("/candidate");
    const isCandidateLogin = pathname === "/candidate/login";   // ✅ add this

    // const isVoter = pathname.startsWith("/dashboard");
    const isVoter = pathname.startsWith("/dashboard") || pathname.startsWith("/elections") || pathname.startsWith("/petitions");



    // Admin login → no header, no sidebar
    if (isAdminLogin) {
        return <main className="min-h-screen bg-[#121212]">{children}</main>;
    }

    // Candidate login → no header, no sidebar
    if (isCandidateLogin) {
        return <main className="min-h-screen bg-[#121212]">{children}</main>;
    }

    // Admin app → fixed sidebar + content shifted with ml-64
    if (isAdmin) {
        return (
            <div className="min-h-screen bg-[#121212]">
                <AdminSidebar />
                <main className="ml-64 p-6">{children}</main>
            </div>
        );
    }

    // Candidate app → fixed sidebar + content
    if (isCandidate) {
        return (
            <div className="min-h-screen bg-[#121212]">
                <CandidateSidebar />
                <main className="ml-64 p-6">{children}</main>
            </div>
        );
    }

    // Voter app (/dashboard & related) → fixed sidebar + content
    if (isVoter) {
        return (
            <div className="min-h-screen bg-[#121212]">
                <VoterSidebar />
                <main className="ml-64 p-6">{children}</main>
            </div>
        );
    }

    // Public pages → header
    return (
        <>
            <Header />
            <main className="min-h-screen">{children}</main>
            <footer />
        </>
    );
}
