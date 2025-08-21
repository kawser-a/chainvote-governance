"use client"

import { useState } from "react";

export default function Header() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <header className="w-full flex items-center justify-between px-6 py-3 border border-neutral-700 rounded-full  text-white max-w-6xl mx-auto relative mt-8">
            {/* Logo */}
            <div className="flex items-center space-x-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-6 w-6 text-lime-400" fill="currentColor">
                    <path d="M12 2C8 8 2 12 2 12s6 4 10 10c4-6 10-10 10-10S16 8 12 2z" />
                </svg>
                <span className="text-lg font-semibold">ChainVote</span>
            </div>

            {/* Navigation */}
            <nav className="flex items-center space-x-8 text-sm font-medium relative">
                <a href="#" className="hover:text-lime-400 transition">Home</a>

                {/* Dropdown wrapper */}
                <div
                    className="relative"
                    onMouseEnter={() => setIsOpen(true)}
                    onMouseLeave={() => setIsOpen(false)}
                >
                    <button className="hover:text-lime-400 transition flex items-center space-x-1">
                        <span>Features</span>
                        <svg
                            className={`w-4 h-4 transform transition-transform ${isOpen ? "rotate-180" : "rotate-0"}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    {isOpen && (
                        <div className="absolute left-0 mt-2 w-44 bg-neutral-900 border border-neutral-700 rounded-lg shadow-lg py-2 z-20 animate-fadeIn">
                            {/* Invisible hover bridge */}
                            <div className="absolute -top-2 left-0 w-full h-2 bg-transparent" />

                            <a href="#" className="block px-4 py-2 hover:bg-neutral-800 transition">Analytics</a>
                            <a href="#" className="block px-4 py-2 hover:bg-neutral-800 transition">Collaboration</a>
                            <a href="#" className="block px-4 py-2 hover:bg-neutral-800 transition">Security</a>
                            <a href="#" className="block px-4 py-2 hover:bg-neutral-800 transition">Customization</a>
                        </div>
                    )}
                </div>

                <a href="#" className="hover:text-lime-400 transition">Integrations</a>
                <a href="#" className="hover:text-lime-400 transition">FAQs</a>
            </nav>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
                <button className="px-5 py-2 rounded-full border border-white text-white hover:bg-neutral-800 transition">
                    Log In
                </button>
                <button className="px-5 py-2 rounded-full bg-lime-400 text-black font-medium hover:bg-lime-500 transition">
                    Sign Up
                </button>
            </div>
        </header>
    );
}
