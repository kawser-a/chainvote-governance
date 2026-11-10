// 'use client';
// import { useEffect, useMemo, useState } from 'react';

// export default function CandidateDashboard() {
//     const [me, setMe] = useState(null);
//     const [stats, setStats] = useState(null);
//     const [err, setErr] = useState('');

//     useEffect(() => {
//         let cancelled = false;

//         async function safeJson(res) {
//             if (!res) return null;
//             const ct = res.headers.get('content-type') || '';
//             if (!ct.includes('application/json')) return null;
//             try { return await res.json(); } catch { return null; }
//         }

//         (async () => {
//             try {
//                 const r1 = await fetch('/api/candidate/me', { cache: 'no-store' });
//                 const j1 = await safeJson(r1);
//                 if (!j1?.ok) { if (!cancelled) setErr('Please log in again.'); return; }
//                 if (!cancelled) setMe(j1);

//                 const r2 = await fetch('/api/candidate/stats', { cache: 'no-store' });
//                 const j2 = await safeJson(r2);
//                 if (j2?.ok && !cancelled) setStats(j2);
//             } catch {
//                 if (!cancelled) setErr('Network error');
//             }
//         })();

//         return () => { cancelled = true; };
//     }, []);

//     const sortedMan = useMemo(() => {
//         const list = stats?.myManifestos || [];
//         return [...list].sort((a, b) => (b.votes || 0) - (a.votes || 0));
//     }, [stats]);

//     const totalVotes = useMemo(
//         () => (stats?.myManifestos || []).reduce((sum, m) => sum + (m.votes || 0), 0),
//         [stats]
//     );

//     if (err && !me) return <div className="text-red-400">{err}</div>;
//     if (!me) return <div className="text-[#A1A1A1]">Loading...</div>;

//     const partyLabel = me.partyName && !me.independent ? me.partyName : 'Independent';

//     return (
//         <div className="space-y-6">
//             {/* Welcome */}
//             <div className="rounded-2xl border border-[#232323] bg-[#171717] p-5">
//                 <h2 className="text-white text-lg font-semibold">Welcome, {me.name}</h2>
//                 <div className="text-[#A1A1A1] text-sm">
//                     Seat: <span className="text-white">{me.seat}</span>
//                     <span className="mx-2">•</span>
//                     Party: <span className="text-white">{partyLabel}</span>
//                 </div>
//             </div>

//             {/* Quick Stats */}
//             {stats && (
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                     <Card k="Total Voters (Seat)" v={stats.totalVoters} />
//                     <Card k="Opposition Candidates" v={stats.oppositionCount} />
//                     <Card k="Ongoing Elections" v={stats?.ongoingElections?.length ?? 0} />
//                 </div>
//             )}

//             {/* Manifestos Ordered List */}
//             <div className="rounded-2xl border border-[#232323] bg-[#171717] p-5">
//                 <div className="flex items-center justify-between mb-3">
//                     <h3 className="text-white font-semibold">Your Approved Manifestos</h3>
//                     <div className="text-xs text-[#A1A1A1]">
//                         {sortedMan.length} item{sortedMan.length !== 1 ? 's' : ''} • {totalVotes} total vote{totalVotes !== 1 ? 's' : ''}
//                     </div>
//                 </div>

//                 {sortedMan.length === 0 ? (
//                     <div className="text-[#A1A1A1]">No approved manifestos yet.</div>
//                 ) : (
//                     <ol className="space-y-2">
//                         {sortedMan.map((m, idx) => (
//                             <li
//                                 key={m._id}
//                                 className="rounded-xl border border-[#2A2A2A] bg-[#141414] px-3 py-2 flex items-center justify-between"
//                             >
//                                 <div className="text-[#EDEDED] flex items-center gap-2">
//                                     <span className="text-[#A1A1A1] font-semibold">{idx + 1}.</span>
//                                     <span className="text-white font-medium">{m.title}</span>
//                                     {m.createdAt ? (
//                                         <span className="text-xs text-[#8a8a8a] ml-2">
//                                             {new Date(m.createdAt).toISOString().slice(0, 10)}
//                                         </span>
//                                     ) : null}
//                                 </div>
//                                 <span className="inline-block text-xs px-2 py-0.5 rounded-lg border border-[#3A3A3A] bg-[#222] text-[#C9F300]">
//                                     {new Intl.NumberFormat().format(m.votes || 0)} vote{(m.votes || 0) !== 1 ? 's' : ''}
//                                 </span>
//                             </li>
//                         ))}
//                     </ol>
//                 )}
//             </div>
//         </div>
//     );
// }

// function Card({ k, v }) {
//     return (
//         <div className="rounded-2xl border border-[#232323] bg-[#171717] p-5">
//             <div className="text-[#A1A1A1] text-sm mb-1">{k}</div>
//             <div className="text-white text-2xl font-semibold">{v}</div>
//         </div>
//     );
// }

'use client';
import { useEffect, useMemo, useState } from 'react';

export default function CandidateDashboard() {
    const [me, setMe] = useState(null);
    const [stats, setStats] = useState(null);
    const [err, setErr] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        async function safeJson(res) {
            if (!res) return null;
            const ct = res.headers.get('content-type') || '';
            if (!ct.includes('application/json')) return null;
            try { return await res.json(); } catch { return null; }
        }

        (async () => {
            try {
                setIsLoading(true);
                const r1 = await fetch('/api/candidate/me', { cache: 'no-store' });
                const j1 = await safeJson(r1);
                if (!j1?.ok) { if (!cancelled) setErr('Please log in again.'); return; }
                if (!cancelled) setMe(j1);

                const r2 = await fetch('/api/candidate/stats', { cache: 'no-store' });
                const j2 = await safeJson(r2);
                if (j2?.ok && !cancelled) setStats(j2);
            } catch {
                if (!cancelled) setErr('Network error');
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        })();

        return () => { cancelled = true; };
    }, []);

    const sortedMan = useMemo(() => {
        const list = stats?.myManifestos || [];
        return [...list].sort((a, b) => (b.votes || 0) - (a.votes || 0));
    }, [stats]);

    const totalVotes = useMemo(
        () => (stats?.myManifestos || []).reduce((sum, m) => sum + (m.votes || 0), 0),
        [stats]
    );

    if (err && !me) return (
        <div className="flex items-center justify-center h-64">
            <div className="text-red-400 bg-[#1E1E1E] border border-red-500/20 rounded-xl p-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {err}
            </div>
        </div>
    );

    if (isLoading) return (
        <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C9F300]"></div>
                <p className="text-[#A1A1A1] mt-3">Loading your dashboard...</p>
            </div>
        </div>
    );

    const partyLabel = me.partyName && !me.independent ? me.partyName : 'Independent';

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Candidate Dashboard</h2>
                <div className="text-sm text-[#A1A1A1]">
                    Last updated: {new Date().toLocaleTimeString()}
                </div>
            </div>

            {/* Welcome Card */}
            <div className="rounded-2xl border border-[#232323] bg-gradient-to-br from-[#171717] to-[#141414] p-6 relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full bg-[#C9F300]/10 blur-xl"></div>
                <div className="flex items-center gap-4 relative z-10">
                    <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-[#C9F300] to-[#9EFF00] flex items-center justify-center text-[#121212] text-xl font-bold shadow-lg">
                        {me.name.charAt(0)}
                    </div>
                    <div>
                        <h2 className="text-white text-xl font-semibold">Welcome back, {me.name}</h2>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#1E1E1E] text-[#C9F300] border border-[#2A2A2A]">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                {me.seat}
                            </span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#1E1E1E] text-[#9EFF00] border border-[#2A2A2A]">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                {partyLabel}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <Card
                        k="Total Voters (Seat)"
                        v={stats.totalVoters}
                        icon={
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        }
                    />
                    <Card
                        k="Opposition Candidates"
                        v={stats.oppositionCount}
                        icon={
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        }
                    />
                    <Card
                        k="Ongoing Elections"
                        v={stats?.ongoingElections?.length ?? 0}
                        icon={
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        }
                    />
                </div>
            )}

            {/* Manifestos Section */}
            <div className="rounded-2xl border border-[#232323] bg-gradient-to-b from-[#171717] to-[#141414] p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 gap-3">
                    <h3 className="text-white font-semibold text-lg flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[#C9F300]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Your Approved Manifestos
                    </h3>
                    <div className="text-sm text-[#A1A1A1] bg-[#1E1E1E] px-3 py-1.5 rounded-lg border border-[#2A2A2A]">
                        {sortedMan.length} item{sortedMan.length !== 1 ? 's' : ''} • {totalVotes} total vote{totalVotes !== 1 ? 's' : ''}
                    </div>
                </div>

                {sortedMan.length === 0 ? (
                    <div className="text-center py-10 text-[#A1A1A1] bg-[#1E1E1E] rounded-xl border border-[#2A2A2A]">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-[#2A2A2A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="mt-3">No approved manifestos yet.</p>
                        <p className="text-xs mt-1">Your submitted manifestos will appear here once approved.</p>
                    </div>
                ) : (
                    <ol className="space-y-3">
                        {sortedMan.map((m, idx) => (
                            <li
                                key={m._id}
                                className="rounded-xl border border-[#2A2A2A] bg-[#1A1A1A] p-4 flex items-center justify-between hover:border-[#3A3A3A] transition-colors group"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-gradient-to-br from-[#1E1E1E] to-[#141414] border border-[#2A2A2A] flex items-center justify-center text-[#C9F300] font-bold text-sm">
                                        #{idx + 1}
                                    </div>
                                    <div>
                                        <h4 className="text-white font-medium group-hover:text-[#C9F300] transition-colors">{m.title}</h4>
                                        {m.createdAt && (
                                            <p className="text-xs text-[#8a8a8a] mt-1">
                                                Added on {new Date(m.createdAt).toLocaleDateString()}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex-shrink-0 flex items-center gap-3">
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[#C9F300]/10 text-[#C9F300] border border-[#C9F300]/20">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                        </svg>
                                        {new Intl.NumberFormat().format(m.votes || 0)} vote{(m.votes || 0) !== 1 ? 's' : ''}
                                    </span>
                                </div>
                            </li>
                        ))}
                    </ol>
                )}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="rounded-2xl border border-[#232323] bg-gradient-to-b from-[#171717] to-[#141414] p-5">
                    <h3 className="text-white font-semibold mb-4 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[#C9F300]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Quick Actions
                    </h3>
                    <div className="space-y-2">
                        <button className="w-full text-left p-3 rounded-lg bg-[#1E1E1E] hover:bg-[#2A2A2A] border border-[#2A2A2A] text-[#EDEDED] transition-colors flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[#C9F300]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Submit New Manifesto
                        </button>
                        <button className="w-full text-left p-3 rounded-lg bg-[#1E1E1E] hover:bg-[#2A2A2A] border border-[#2A2A2A] text-[#EDEDED] transition-colors flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[#C9F300]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Generate Campaign Report
                        </button>
                    </div>
                </div>
                <div className="rounded-2xl border border-[#232323] bg-gradient-to-b from-[#171717] to-[#141414] p-5">
                    <h3 className="text-white font-semibold mb-4 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[#C9F300]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        Performance
                    </h3>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center p-3 rounded-lg bg-[#1E1E1E] border border-[#2A2A2A]">
                            <span className="text-[#A1A1A1]">Ranking</span>
                            <span className="text-white font-semibold">#{sortedMan.length > 0 ? '1' : 'N/A'}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 rounded-lg bg-[#1E1E1E] border border-[#2A2A2A]">
                            <span className="text-[#A1A1A1]">Approval Rate</span>
                            <span className="text-white font-semibold">{sortedMan.length > 0 ? '100%' : '0%'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Card({ k, v, icon }) {
    return (
        <div className="rounded-2xl border border-[#232323] bg-gradient-to-b from-[#171717] to-[#141414] p-5 hover:border-[#2A2A2A] transition-colors">
            <div className="flex justify-between items-start mb-4">
                <div className="text-[#A1A1A1] text-sm font-medium">{k}</div>
                <div className="p-2 rounded-lg bg-[#1E1E1E] text-[#C9F300]">
                    {icon}
                </div>
            </div>
            <div className="text-white text-2xl font-bold">{v.toLocaleString()}</div>
        </div>
    );
}
