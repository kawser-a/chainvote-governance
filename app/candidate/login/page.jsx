'use client';
import { useState } from 'react';
import { useRouter } from "next/navigation";

export default function CandidateLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [msg, setMsg] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function submit(e) {
        e.preventDefault();
        setMsg('');
        setLoading(true);
        const r = await fetch('/api/candidate/login', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const j = await r.json();
        setLoading(false);
        if (!j.ok) { setMsg(j.error || 'Login failed'); return; }
        window.location.href = '/candidate/dashboard';
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#111] to-[#181818] p-4">
            <form
                onSubmit={submit}
                className="w-full max-w-md rounded-2xl border border-[#262626] bg-[#171717] px-8 py-10 shadow-2xl space-y-8 relative"
                autoComplete="on"
            >
                {/* Back/Home Button */}
                <button
                    onClick={e => { e.preventDefault(); router.push('/'); }}
                    type="button"
                    className="absolute left-6 top-6 flex items-center text-xs text-[#A1A1A1] hover:text-[#C9F300] transition focus:outline-none focus:ring-2 focus:ring-[#C9F300]/60"
                >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                    Home
                </button>

                <div className="flex flex-col items-center gap-2 pt-3">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#C9F300] to-[#9EFF00] flex items-center justify-center text-[#121212] text-2xl font-bold shadow-lg">C</div>
                    <h1 className="text-2xl font-semibold text-[#EDEDED]">Candidate Login</h1>
                    <p className="text-sm text-[#A1A1A1] text-center max-w-xs">Secure candidate access. Only authorized users may log in.</p>
                </div>

                <div className="space-y-5">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-[#C9F300] mb-1">
                            Email
                        </label>
                        <input
                            id="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="candidate@email.com"
                            autoComplete="username"
                            className="w-full bg-[#101010] border border-[#232323] rounded-xl px-3 py-2 text-[#EDEDED] placeholder-[#6B6B6B] focus:outline-none focus:ring-2 focus:ring-[#C9F300]/50 transition"
                            type="email"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-[#C9F300] mb-1">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="••••••••"
                            autoComplete="current-password"
                            className="w-full bg-[#101010] border border-[#232323] rounded-xl px-3 py-2 text-[#EDEDED] placeholder-[#6B6B6B] focus:outline-none focus:ring-2 focus:ring-[#C9F300]/50 transition"
                            minLength={6}
                            required
                        />
                    </div>

                    <div className="flex justify-between items-center text-xs text-[#A1A1A1]">
                        <a href="/candidate/signup" className="text-[#9EFF00] hover:underline focus:underline transition-colors">Become a candidate?</a>
                        {/* You can add a "Forgot password?" link if needed */}
                    </div>
                </div>

                <button
                    disabled={loading}
                    className="w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#C9F300] to-[#9EFF00] text-[#121212] font-semibold hover:shadow-lg hover:shadow-[#C9F300]/20 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#9EFF00]/50 text-base"
                >
                    {loading ? (
                        <span className="flex justify-center items-center gap-2">
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-20" cx="12" cy="12" r="10" stroke="#121212" strokeWidth="4" />
                                <path className="opacity-90" fill="#121212" d="M4 12a8 8 0 018-8v8H4z" />
                            </svg>
                            Signing in...
                        </span>
                    ) : "Login"}
                </button>

                {/* Other login options */}
                <div className="flex flex-col sm:flex-row items-center gap-2 justify-center pt-2">
                    <a href="/login" className="text-[#ACE800] px-3 py-1 rounded-full hover:bg-[#243500] focus:bg-[#243500] focus:outline-none text-xs transition">
                        Voter Login
                    </a>
                    <a href="/admin/login" className="text-red-400 px-3 py-1 rounded-full hover:bg-[#2a1919] focus:bg-[#2a1919] focus:outline-none text-xs transition">
                        Admin Login
                    </a>
                </div>

                {msg && (
                    <div className="text-center rounded-lg border border-[#2A2A2A] bg-[#181818] p-2 mt-2 text-sm text-[#FF6B6B]">
                        {msg}
                    </div>
                )}
            </form>
        </div>
    );
}
