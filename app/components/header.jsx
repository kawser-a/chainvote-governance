

"use client";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Header() {
    const { user, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();

    async function handleLogout() {
        await logout();
        router.push("/"); // redirect home
    }

    return (
        <header className="w-full flex items-center justify-between px-6 py-3 border border-neutral-700 rounded-full text-white max-w-6xl mx-auto relative mt-8">
            {/* Logo */}
            <div className="flex items-center space-x-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                    className="h-6 w-6 text-lime-400" fill="currentColor">
                    <path d="M12 2C8 8 2 12 2 12s6 4 10 10c4-6 10-10 10-10S16 8 12 2z" />
                </svg>
                <span className="text-lg font-semibold">ChainVote</span>
            </div>

            {/* Navigation */}
            <nav className="flex items-center space-x-8 text-sm font-medium relative">
                <a href="/" className="hover:text-lime-400 transition">Home</a>
                <a href="#" className="hover:text-lime-400 transition">Features</a>
                <a href="#" className="hover:text-lime-400 transition">Integrations</a>
                <a href="#" className="hover:text-lime-400 transition">FAQs</a>
            </nav>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-3">
                {!user ? (
                    <>
                        <button onClick={() => router.push("/login")}
                            className="px-5 py-2 rounded-full border border-white text-white hover:bg-neutral-800 transition">
                            Log In
                        </button>
                        <button onClick={() => router.push("/enroll")}
                            className="px-5 py-2 rounded-full bg-lime-400 text-black font-medium hover:bg-lime-500 transition">
                            Sign Up
                        </button>

                        {/* Hardcoded Admin Login */}
                        <button onClick={() => router.push("/admin")}
                            className="px-5 py-2 rounded-full bg-red-500 text-white font-medium hover:bg-red-600 transition">
                            Admin Login
                        </button>
                    </>
                ) : (
                    <button onClick={handleLogout}
                        className="px-5 py-2 rounded-full border border-white text-white hover:bg-neutral-800 transition">
                        Logout
                    </button>
                )}
            </div>
        </header>
    );
}
