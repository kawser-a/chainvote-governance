"use client";
import { useAuth } from "../context/AuthContext";
import { useAdminAuth } from "../context/AdminAuthContext";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";

export default function Header() {
    const { user, logout } = useAuth();
    const { admin, logout: adminLogout } = useAdminAuth();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const dropdownRef = useRef(null);
    const router = useRouter();

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        }
        if (isDropdownOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            return () => document.removeEventListener("mousedown", handleClickOutside);
        }
    }, [isDropdownOpen]);

    // logout handlers
    async function handleLogout() {
        await logout();
        router.push("/");
    }
    async function handleAdminLogout() {
        await adminLogout();
        router.push("/");
    }

    // Detect session type for clarity
    const sessionType = admin ? "admin" : user ? "user" : null;

    return (
        <header className="w-full flex items-center justify-between px-6 py-3 border border-[#232323] bg-[#171717]/80 backdrop-blur-md rounded-full text-white max-w-6xl mx-auto relative mt-8 z-20">
            <div className="flex items-center space-x-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                    className="h-6 w-6 text-lime-400" fill="currentColor">
                    <path d="M12 2C8 8 2 12 2 12s6 4 10 10c4-6 10-10 10-10S16 8 12 2z" />
                </svg>
                <span className="text-lg font-bold bg-gradient-to-r from-white to-[#C9F300] bg-clip-text text-transparent">
                    ChainVote
                </span>
            </div>
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8 text-sm font-medium">
                <a href="/" className="text-[#EDEDED] hover:text-[#C9F300] transition">Home</a>
                <a href="#" className="text-[#EDEDED] hover:text-[#C9F300] transition">Features</a>
                <a href="#" className="text-[#EDEDED] hover:text-[#C9F300] transition">How It Works</a>
                <a href="#" className="text-[#EDEDED] hover:text-[#C9F300] transition">FAQs</a>
            </nav>
            {/* Auth Buttons */}
            <div className="flex items-center space-x-3">
                {/* If logged in show only logout */}
                {sessionType ? (
                    <button
                        onClick={sessionType === "admin" ? handleAdminLogout : handleLogout}
                        className={`px-4 py-2 rounded-full border ${sessionType === "admin"
                            ? "border-red-500/50 text-red-400 hover:bg-red-500/10"
                            : "border-[#3A3A3A] text-[#EDEDED] hover:bg-[#2A2A2A]"
                            } transition text-sm`}
                    >
                        {sessionType === "admin" ? "Admin Logout" : "Logout"}
                    </button>
                ) : (
                    <>
                        {/* Desktop Logins */}
                        <div className="hidden sm:block relative" ref={dropdownRef}>
                            <button
                                onClick={() => setIsDropdownOpen((v) => !v)}
                                className="px-4 py-2 rounded-full border border-[#3A3A3A] text-[#EDEDED] hover:bg-[#2A2A2A] transition text-sm flex items-center focus:outline-none focus:ring-2 focus:ring-[#C9F300]/60"
                                aria-haspopup="true"
                                aria-expanded={isDropdownOpen ? "true" : "false"}
                                tabIndex={0}
                                onKeyDown={(e) => { if (e.key === "Escape") setIsDropdownOpen(false); }}
                            >
                                Login
                                <svg className={`h-4 w-4 ml-2 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                            {isDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-[#232323] bg-[#171717] shadow-lg py-2 z-50 animate-fadeIn">
                                    <button
                                        onClick={() => { setIsDropdownOpen(false); router.push("/login"); }}
                                        className="w-full text-left px-5 py-3 text-sm text-[#EDEDED] hover:bg-[#2A2A2A] transition flex items-center"
                                    >
                                        <span className="text-lime-400 font-bold mr-2">●</span>Voter Login
                                    </button>
                                    <button
                                        onClick={() => { setIsDropdownOpen(false); router.push("/candidate/login"); }}
                                        className="w-full text-left px-5 py-3 text-sm text-[#EDEDED] hover:bg-[#2A2A2A] transition flex items-center"
                                    >
                                        <span className="text-blue-400 font-bold mr-2">●</span>Candidate Login
                                    </button>
                                    <button
                                        onClick={() => { setIsDropdownOpen(false); router.push("/admin/login"); }}
                                        className="w-full text-left px-5 py-3 text-sm text-[#EDEDED] hover:bg-red-500/10 transition flex items-center"
                                    >
                                        <span className="text-red-400 font-bold mr-2">●</span>Admin Login
                                    </button>
                                </div>
                            )}
                        </div>
                        {/* Voter Sign Up */}
                        <button
                            onClick={() => router.push("/enroll")}
                            className="hidden sm:block px-4 py-2 rounded-full bg-gradient-to-r from-[#C9F300] to-[#9EFF00] text-[#121212] font-medium hover:shadow-lg hover:shadow-[#C9F300]/20 transition-all text-sm"
                        >
                            Enroll as Voter
                        </button>
                    </>
                )}
                {/* Mobile menu button */}
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="md:hidden p-2 rounded-lg bg-[#1E1E1E] border border-[#2A2A2A] text-[#EDEDED]"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>
            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="absolute top-full right-0 mt-4 w-full rounded-2xl border border-[#232323] bg-[#171717] p-5 md:hidden z-50">
                    <nav className="flex flex-col space-y-4 mb-6">
                        <a href="/" className="text-[#EDEDED] hover:text-[#C9F300] transition py-2">Home</a>
                        <a href="#" className="text-[#EDEDED] hover:text-[#C9F300] transition py-2">Features</a>
                        <a href="#" className="text-[#EDEDED] hover:text-[#C9F300] transition py-2">How It Works</a>
                        <a href="#" className="text-[#EDEDED] hover:text-[#C9F300] transition py-2">FAQs</a>
                    </nav>
                    {/* Auth buttons go here */}
                    <div className="pt-4 border-t border-[#232323] space-y-3">
                        {sessionType ? (
                            <button
                                onClick={sessionType === "admin" ? handleAdminLogout : handleLogout}
                                className={`w-full px-4 py-2.5 rounded-lg border ${sessionType === "admin"
                                    ? "border-red-500/50 text-red-400 hover:bg-red-500/10"
                                    : "border-[#3A3A3A] text-[#EDEDED] hover:bg-[#2A2A2A]"
                                    } text-sm`}
                            >
                                {sessionType === "admin" ? "Admin Logout" : "Logout"}
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={() => { router.push("/login"); setIsMobileMenuOpen(false); }}
                                    className="w-full px-4 py-2.5 rounded-lg border border-[#3A3A3A] text-[#EDEDED] hover:bg-[#2A2A2A] text-sm"
                                >
                                    Voter Login
                                </button>
                                <button
                                    onClick={() => { router.push("/enroll"); setIsMobileMenuOpen(false); }}
                                    className="w-full px-4 py-2.5 rounded-lg bg-gradient-to-r from-[#C9F300] to-[#9EFF00] text-[#121212] font-medium hover:shadow-lg hover:shadow-[#C9F300]/20 text-sm"
                                >
                                    Sign Up
                                </button>
                                <button
                                    onClick={() => { router.push("/candidate/login"); setIsMobileMenuOpen(false); }}
                                    className="w-full px-4 py-2.5 rounded-lg border border-[#2A2A2A] text-blue-400 hover:bg-[#2A2A2A] text-sm"
                                >
                                    Candidate Login
                                </button>
                                <button
                                    onClick={() => { router.push("/admin/login"); setIsMobileMenuOpen(false); }}
                                    className="w-full px-4 py-2.5 rounded-lg border border-[#2A2A2A] text-red-400 hover:bg-[#2A2A2A] text-sm"
                                >
                                    Admin Login
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}
