// VoterSidebar.jsx
"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

function NavItem({ href, children }) {
    const pathname = usePathname();
    const isActive = pathname === href || pathname?.startsWith(href + "/");
    return (
        <Link
            href={href}
            className={`block px-3 py-2 rounded-lg transition-colors duration-150 ${isActive ? "bg-[#232323] text-lime-400" : "text-white hover:bg-[#232323] hover:text-lime-400"
                }`}
        >
            {children}
        </Link>
    );
}

export default function VoterSidebar() {
    const { logout } = useAuth();
    const router = useRouter();

    async function logoutHandler() {
        await logout();
        router.push("/");
    }

    return (
        <aside className="fixed top-0 left-0 h-screen w-64 bg-[#1a1a1a] border-r border-[#2a2a2a] p-6 flex flex-col justify-between">
            <div>
                <div
                    onClick={() => router.push("/")}
                    role="button"
                    tabIndex={0}
                    onKeyDown={e => e.key === "Enter" && router.push("/")}
                    className="flex items-center space-x-2 mb-8 cursor-pointer select-none"
                    aria-label="Home"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        className="h-6 w-6 text-lime-400"
                        fill="currentColor"
                        aria-hidden="true"
                    >
                        <path d="M12 2C8 8 2 12 2 12s6 4 10 10c4-6 10-10 10-10S16 8 12 2" />
                    </svg>
                    <span className="text-lg font-bold bg-gradient-to-r from-white to-[#C9F300] bg-clip-text text-transparent">
                        ChainVote
                    </span>
                </div>
                <h2 className="text-xl font-bold text-lime-400 mb-8">Voter Panel</h2>
                <nav className="space-y-4">
                    <NavItem href="/dashboard">Dashboard</NavItem>
                    <NavItem href="/elections">Elections</NavItem>
                    <NavItem href="/petitions">Petitions</NavItem>
                </nav>
            </div>
            <button
                onClick={logoutHandler}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
            >
                Logout
            </button>
        </aside>
    );
}
