
// /app/admin/dashboard/page.jsx
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import Link from 'next/link';
import DashboardClient from '@/app/components/DashboardClient';
// import DashboardClient from '../components/DashboardClient';

export default async function AdminDashboard() {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_session')?.value;

    let me = null;
    if (token) {
        try {
            const payload = jwt.verify(token, process.env.JWT_SECRET);
            if (payload.role === 'admin') {
                me = { ok: true, username: payload.sub };
            }
        } catch {
            me = null;
        }
    }

    if (!me?.ok) {
        return (
            <div className="max-w-lg mx-auto rounded-2xl border border-[#2A2A2A] bg-[#181818] p-8 text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-500/10 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <h3 className="text-lg font-medium text-white mb-2">Session Expired</h3>
                <p className="text-[#A1A1A1] mb-6">Your admin session has expired. Please log in again to continue.</p>
                <Link
                    href="/admin/login"
                    className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-gradient-to-r from-[#C9F300] to-[#9EFF00] text-[#121212] font-medium hover:opacity-90 transition-opacity"
                >
                    Return to Login
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Page header */}
            <header className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-[#171717] to-[#141414] border border-[#232323] shadow-lg">
                <div className="flex items-center gap-3">
                    <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-gradient-to-br from-[#C9F300] to-[#9EFF00] text-[#121212] text-xl font-bold shadow-md">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
                        <p className="text-sm text-[#A1A1A1]">Voting System Control Panel</p>
                    </div>
                </div>
                {/* <form action="/api/admin/logout" method="post">
                    <button className="px-4 py-2 rounded-xl text-sm font-medium bg-[#1F1F1F] border border-[#2A2A2A] text-[#EDEDED] hover:bg-[#2A2A2A] transition-colors shadow">
                        Sign Out
                    </button>
                </form> */}
            </header>

            {/* Stats cards + Seat-wise bar chart */}
            {/* <DashboardClient /> */}

            {/* Quick Actions */}
            <section className="rounded-2xl border border-[#232323] bg-gradient-to-b from-[#171717] to-[#141414] p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-[#1F1F1F]">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#C9F300]" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <h2 className="text-lg font-semibold text-white">Quick Actions</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Link href="/admin/elections" className="w-full p-3 rounded-xl bg-[#1F1F1F] border border-[#2A2A2A] text-white hover:bg-[#2A2A2A] transition-colors text-sm flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#9EFF00]" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                        </svg>
                        Create / Manage Elections
                    </Link>
                    <Link href="/admin/voters" className="w-full p-3 rounded-xl bg-[#1F1F1F] border border-[#2A2A2A] text-white hover:bg-[#2A2A2A] transition-colors text-sm flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#9EFF00]" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3z" />
                        </svg>
                        Manage Voters
                    </Link>
                    <Link href="/admin/logs" className="w-full p-3 rounded-xl bg-[#1F1F1F] border border-[#2A2A2A] text-white hover:bg-[#2A2A2A] transition-colors text-sm flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#9EFF00]" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                        </svg>
                        View System Logs
                    </Link>
                </div>
            </section>

            <DashboardClient />

            {/* Recent Activity + System Status */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Activity */}
                <div className="lg:col-span-2 rounded-2xl border border-[#232323] bg-gradient-to-b from-[#171717] to-[#141414] p-6 shadow-lg">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-[#1F1F1F]">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#C9F300]" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
                    </div>
                    <div className="space-y-3">
                        <ActivityRow title='Seeded 50 voters' time='Just now' />
                        <ActivityRow title='Enrollment OTP service started (dev mode)' time='Today' />
                        <ActivityRow title='Admin signed in' time='Today' />
                    </div>
                </div>

                {/* System Status */}
                <div className="rounded-2xl border border-[#232323] bg-gradient-to-b from-[#171717] to-[#141414] p-6 shadow-lg">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-[#1F1F1F]">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#C9F300]" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <h2 className="text-lg font-semibold text-white">System Status</h2>
                    </div>

                    <StatusBar label="Blockchain Network" value={100} badge="Online" />
                    <StatusBar label="Database" value={92} badge="Stable" />
                    <StatusBar label="API Services" value={98} badge="Normal" />
                </div>
            </section>
        </div>
    );
}

function ActivityRow({ title, time }) {
    return (
        <div className="flex items-center justify-between p-3 rounded-xl bg-[#1F1F1F] border border-[#2A2A2A]">
            <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-[#9EFF00]" />
                <div>
                    <p className="text-white text-sm">{title}</p>
                    <p className="text-[#A1A1A1] text-xs">{time}</p>
                </div>
            </div>
        </div>
    );
}

function StatusBar({ label, value, badge }) {
    return (
        <div className="space-y-2 mb-4">
            <div className="flex justify-between items-center">
                <p className="text-[#A1A1A1] text-sm">{label}</p>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-900 text-green-200">
                    {badge}
                </span>
            </div>
            <div className="w-full bg-[#1F1F1F] rounded-full h-2">
                <div className="bg-[#9EFF00] h-2 rounded-full" style={{ width: `${value}%` }} />
            </div>
        </div>
    );
}
