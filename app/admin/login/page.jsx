'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [msg, setMsg] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function submit(e) {
        e.preventDefault();
        setMsg('');
        setLoading(true);
        try {
            const r = await fetch('/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });
            const j = await r.json();
            if (!j.ok) { setMsg(j.error || 'Login failed'); return; }
            window.location.href = '/admin/dashboard';
        } catch {
            setMsg('Network error');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#111] to-[#181818] flex items-center justify-center p-4">
            <div className="w-full max-w-md mx-auto">
                {/* Navigation Row */}
                <div className="mb-6 flex items-center justify-between">
                    {/* Home/back */}
                    <button
                        className="inline-flex items-center text-sm text-[#A1A1A1] hover:text-[#C9F300] focus:text-[#C9F300] focus:outline-none transition"
                        onClick={() => router.push('/')}
                        type="button"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                        </svg>
                        Home
                    </button>
                    {/* Other logins */}
                    <div className="flex space-x-3">
                        <Link
                            href="/login"
                            className="text-xs px-3 py-1 rounded-full bg-[#171717] border border-[#232323] text-[#EDEDED] hover:bg-[#2A2A2A] focus:outline-none focus:ring-2 focus:ring-[#C9F300]/30 transition"
                        >
                            Voter Login
                        </Link>
                        <Link
                            href="/candidate/login"
                            className="text-xs px-3 py-1 rounded-full bg-[#171717] border border-[#232323] text-[#EDEDED] hover:bg-[#2A2A2A] focus:outline-none focus:ring-2 focus:ring-blue-400/40 transition"
                        >
                            Candidate Login
                        </Link>
                    </div>
                </div>

                {/* Login Card */}
                <form
                    onSubmit={submit}
                    className="rounded-2xl border border-[#232323] bg-[#171717] p-8 shadow-2xl space-y-7 relative overflow-hidden"
                    autoComplete="on"
                >
                    {/* Decorative blur */}
                    <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-[#C9F300]/10 blur-2xl"></div>
                    <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-[#9EFF00]/10 blur-2xl"></div>
                    <div className="flex flex-col items-center gap-3 relative z-10">
                        <span className="inline-flex items-center justify-center h-14 w-14 rounded-xl bg-gradient-to-br from-[#C9F300] to-[#9EFF00] text-[#121212] text-2xl font-bold shadow-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                            </svg>
                        </span>
                        <h2 className="text-2xl font-bold text-white mb-2">Admin Portal</h2>
                        <p className="text-sm text-[#A1A1A1] text-center max-w-xs">
                            Authorized personnel only. Enter your credentials to access the administration dashboard.
                        </p>
                    </div>
                    <div className="space-y-5 relative z-10">
                        <div>
                            <label htmlFor="user" className="block text-sm font-medium text-[#EDEDED] mb-2">Username</label>
                            <input
                                id="user"
                                value={username}
                                autoComplete="username"
                                onChange={e => setUsername(e.target.value)}
                                placeholder="Enter admin username"
                                className="w-full bg-[#191919] border border-[#2A2A2A] rounded-lg px-4 py-3 text-[#EDEDED] placeholder-[#6B6B6B] focus:outline-none focus:ring-2 focus:ring-[#C9F300]/40"
                                disabled={loading}
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="pwd" className="block text-sm font-medium text-[#EDEDED] mb-2">Password</label>
                            <input
                                id="pwd"
                                type="password"
                                autoComplete="current-password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                className="w-full bg-[#191919] border border-[#2A2A2A] rounded-lg px-4 py-3 text-[#EDEDED] placeholder-[#6B6B6B] focus:outline-none focus:ring-2 focus:ring-[#C9F300]/40"
                                disabled={loading}
                                required
                            />
                        </div>
                    </div>
                    <button
                        disabled={loading || !username || !password}
                        className="w-full inline-flex items-center justify-center rounded-xl px-4 py-3.5 text-base font-semibold bg-gradient-to-r from-[#C9F300] to-[#9EFF00] text-[#121212] hover:from-[#ACE800] hover:to-[#8EE500] disabled:opacity-60 disabled:cursor-not-allowed transition-all focus:outline-none focus:ring-2 focus:ring-[#9EFF00]/40 relative z-10 mt-2"
                        type="submit"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-[#121212]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Authenticating...
                            </>
                        ) : 'Login to Dashboard'}
                    </button>
                    {msg && (
                        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300 flex items-start mt-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <span>{msg}</span>
                        </div>
                    )}
                </form>
                {/* Help section */}
                <div className="mt-8 p-5 rounded-xl border border-[#232323] bg-[#171717]">
                    <div className="flex items-start">
                        <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#2A2A2A] bg-[#1E1E1E] text-[#C9F300]">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <h3 className="text-sm font-medium text-[#EDEDED]">Administrator Access</h3>
                            <p className="mt-1 text-sm text-[#A1A1A1]">
                                If you’re experiencing issues or require access, please contact the system owner.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
