

'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
    const { login } = useAuth();
    const router = useRouter();
    const [nid, setNid] = useState('');
    const [pin, setPin] = useState('');
    const [msg, setMsg] = useState('');
    const [loading, setLoading] = useState(false);

    async function submit() {
        setMsg('');
        setLoading(true);
        try {
            const r = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ nid, pin }),
            });
            const j = await r.json();
            if (!j.ok) {
                setMsg(j.error || 'Login failed');
                return;
            }
            await login();
            router.push('/dashboard');
        } catch {
            setMsg('Network error');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-[#121212] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                {/* Header */}
                <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-[#1E1E1E] mb-4 border border-[#2A2A2A]">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#C9F300]" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-white">
                        <span className="text-[#C9F300]">Vote</span>Chain Login
                    </h1>
                    <p className="mt-2 text-sm text-gray-400">Secure blockchain-based voting platform</p>
                </div>

                {/* Login Form Card */}
                <div className="bg-[#1E1E1E] rounded-2xl shadow-xl p-8 border border-gray-800">
                    <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); submit(); }}>
                        {/* NID Input */}
                        <div>
                            <label htmlFor="nid" className="block text-sm font-medium text-gray-300 mb-2">
                                National ID Number
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                                    </svg>
                                </div>
                                <input
                                    id="nid"
                                    inputMode="numeric"
                                    autoComplete="username"
                                    value={nid}
                                    onChange={(e) => setNid(e.target.value.replace(/\s+/g, ''))}
                                    placeholder="e.g., 1990123456789"
                                    className="block w-full pl-10 bg-[#2A2A2A] border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#C9F300] focus:border-transparent"
                                    required
                                />
                            </div>
                            <p className="mt-2 text-xs text-gray-500">
                                Enter digits only; no spaces or special characters
                            </p>
                        </div>

                        {/* PIN Input */}
                        <div>
                            <label htmlFor="pin" className="block text-sm font-medium text-gray-300 mb-2">
                                PIN
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <input
                                    id="pin"
                                    type="password"
                                    inputMode="numeric"
                                    autoComplete="current-password"
                                    value={pin}
                                    onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    placeholder="Enter 6-digit PIN"
                                    className="block w-full pl-10 bg-[#2A2A2A] border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#C9F300] focus:border-transparent"
                                    required
                                />
                            </div>
                            <p className="mt-2 text-xs text-gray-500">
                                6 digits. Avoid sequences (123456) or repeats (111111)
                            </p>
                        </div>

                        {/* Login Button */}
                        <div>
                            <button
                                type="submit"
                                disabled={loading || !nid || pin.length !== 6}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold bg-[#C9F300] hover:bg-[#9EFF00] text-[#121212] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#C9F300] focus:ring-offset-[#1E1E1E] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-[#121212]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Signing in...
                                    </>
                                ) : 'Login to Dashboard'}
                            </button>
                        </div>

                        {/* Error Message */}
                        {msg && (
                            <div className="rounded-lg bg-red-900/20 p-3 border border-red-800/50">
                                <p className="text-sm text-red-400 text-center">{msg}</p>
                            </div>
                        )}
                    </form>

                    {/* Divider */}
                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-800"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-[#1E1E1E] text-gray-500">New to VoteChain?</span>
                            </div>
                        </div>

                        {/* Enrollment CTA */}
                        <div className="mt-6 text-center">
                            <a
                                href="/enroll"
                                className="inline-flex items-center px-4 py-2 border border-gray-700 rounded-lg shadow-sm text-sm font-medium text-gray-300 bg-[#2A2A2A] hover:bg-[#363636] transition-colors duration-200"
                            >
                                Enroll for Voting Access
                            </a>
                        </div>
                    </div>
                </div>

                {/* Support Footer */}
                <div className="text-center">
                    <div className="inline-flex items-center text-xs text-gray-500 bg-[#1A1A1A] rounded-full px-4 py-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Forgot PIN? Contact support for assistance
                    </div>
                </div>
            </div>
        </div>
    );
}
