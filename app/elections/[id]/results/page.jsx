// // 'use client';
// // import { useEffect, useState } from 'react';

// // export default function ElectionResults({ params }) {
// //     const id = params?.id;
// //     const [res, setRes] = useState(null);
// //     const [loading, setLoading] = useState(true);
// //     const [msg, setMsg] = useState('');

// //     useEffect(() => {
// //         if (!id) return;
// //         (async () => {
// //             setLoading(true); setMsg('');
// //             try {
// //                 const r = await fetch(`/api/elections/${id}/results`, { cache: 'no-store' });
// //                 const j = await r.json();
// //                 if (!j.ok) setMsg(j.error || 'Failed to load results');
// //                 else setRes(j);
// //             } catch { setMsg('Network error'); }
// //             finally { setLoading(false); }
// //         })();
// //     }, [id]);

// //     if (loading) return <div className="text-[#A1A1A1]">Loading results…</div>;
// //     if (!res?.ok) return <div className="text-red-400">{msg || 'Not found'}</div>;

// //     const e = res.election;
// //     const r = res.results;

// //     return (
// //         <div className="space-y-5">
// //             <div className="rounded-2xl border border-[#2A2A2A] bg-[#171717] p-4">
// //                 <div className="text-white text-xl font-semibold">{e.name} — Results</div>
// //                 <div className="text-[#A1A1A1] text-xs mt-1">
// //                     Ended: {new Date(e.endAt).toLocaleString()} | Status: {e.status}
// //                 </div>
// //             </div>

// //             <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
// //                 <div className="rounded-2xl border border-[#2A2A2A] bg-[#171717] p-4">
// //                     <div className="text-white font-semibold mb-2">Seat Winners</div>
// //                     {r.seatWinners.length === 0 ? (
// //                         <div className="text-[#A1A1A1]">No data</div>
// //                     ) : (
// //                         <ul className="space-y-1">
// //                             {r.seatWinners.map((x, i) => (
// //                                 <li key={i} className="rounded-lg border border-[#2A2A2A] p-2">
// //                                     <div className="text-white">{x.seat}</div>
// //                                     <div className="text-[#A1A1A1] text-sm">
// //                                         Winner: {x.candidate.name} ({x.candidate.partyName}) — {x.votes} votes
// //                                     </div>
// //                                 </li>
// //                             ))}
// //                         </ul>
// //                     )}
// //                 </div>

// //                 <div className="rounded-2xl border border-[#2A2A2A] bg-[#171717] p-4">
// //                     <div className="text-white font-semibold mb-2">Party-wise totals</div>
// //                     {r.partyWise.length === 0 ? (
// //                         <div className="text-[#A1A1A1]">No data</div>
// //                     ) : (
// //                         <ul className="space-y-1">
// //                             {r.partyWise.map((p, i) => (
// //                                 <li key={i} className="rounded-lg border border-[#2A2A2A] p-2">
// //                                     <span className="text-white">{p.party}</span>
// //                                     <span className="text-[#A1A1A1] text-sm ml-2">{p.votes} votes</span>
// //                                 </li>
// //                             ))}
// //                         </ul>
// //                     )}
// //                 </div>
// //             </div>
// //         </div>
// //     );
// // }


// // // /app/elections/[id]/results/page.jsx
// // 'use client';
// // import { useEffect, useState } from 'react';
// // import Link from 'next/link';

// // export default function ElectionResultsPage({ params }) {
// //   const id = params?.id;
// //   const [data, setData] = useState(null);
// //   const [winners, setWinners] = useState([]);
// //   const [msg, setMsg] = useState('');
// //   const [loading, setLoading] = useState(true);
// //   const [submitting, setSubmitting] = useState(null);

// //   useEffect(() => {
// //     if (!id) return;
// //     (async () => {
// //       setLoading(true);
// //       setMsg('');
// //       try {
// //         const [r1, r2] = await Promise.all([
// //           fetch(`/api/elections/${id}/results`, { cache: 'no-store' }),
// //           fetch(`/api/elections/${id}/winners`, { cache: 'no-store' })
// //         ]);
// //         const j1 = await r1.json();
// //         const j2 = await r2.json();
// //         if (!j1.ok) setMsg(j1.error || 'Failed to load results');
// //         else setData(j1);
// //         if (!j2.ok) setMsg(j2.error || 'Failed to load winners');
// //         else setWinners(j2.winners || []);
// //       } catch {
// //         setMsg('Network error');
// //       } finally {
// //         setLoading(false);
// //       }
// //     })();
// //   }, [id]);

// //   async function filePetition(electionId, candidateId, manifestoId) {
// //     try {
// //       setMsg('');
// //       setSubmitting(manifestoId);
// //       const reason = window.prompt('Describe your complaint (optional):') || '';
// //       const r = await fetch('/api/petitions', {
// //         method: 'POST',
// //         headers: { 'Content-Type': 'application/json' },
// //         credentials: 'include',
// //         body: JSON.stringify({ electionId, candidateId, manifestoId, reason }),
// //       });
// //       const j = await r.json();
// //       if (!j.ok) setMsg(j.error || 'Failed to file petition');
// //       else setMsg('✅ Petition filed successfully.');
// //     } catch {
// //       setMsg('Failed to file petition');
// //     } finally {
// //       setSubmitting(null);
// //     }
// //   }

// //   if (loading) return <div className="text-[#A1A1A1]">Loading…</div>;
// //   if (!data) return <div className="text-red-400">{msg || 'Failed'}</div>;

// //   const e = data.election || {};

// //   return (
// //     <div className="space-y-5">
// //       <div className="rounded-2xl border border-[#2A2A2A] bg-[#171717] p-4 flex items-center justify-between">
// //         <div>
// //           <div className="text-white text-xl font-semibold">{e.name}</div>
// //           <div className="text-[#A1A1A1] text-sm capitalize">{e.type} • {e.ballotType}</div>
// //           <div className="text-[#A1A1A1] text-xs mt-1">{new Date(e.startAt).toLocaleString()} — {new Date(e.endAt).toLocaleString()}</div>
// //           <div className="text-[#C9F300] text-xs mt-1">Total Votes: {data.totalVotes || 0}</div>
// //         </div>
// //         <Link href="/elections" className="px-3 py-1.5 rounded-lg bg-[#1F1F1F] border border-[#2A2A2A] text-[#EDEDED]">← Back</Link>
// //       </div>

// //       {/* Winners & Promises */}
// //       <section className="rounded-2xl border border-[#2A2A2A] bg-[#171717] p-4">
// //         <div className="text-white font-semibold mb-2">Elected Candidates & Their Promises</div>
// //         {(!winners || winners.length === 0) ? (
// //           <div className="text-[#A1A1A1] text-sm">No winners data</div>
// //         ) : (
// //           winners.map((w, idx) => (
// //             <div key={idx} className="rounded-xl border border-[#2A2A2A] p-3 mb-3 bg-[#1a1a1a]">
// //               <div className="text-white font-medium">{w.seat}</div>
// //               <div className="text-[#A1A1A1] text-sm">
// //                 {w.candidate?.name} • {(w.candidate?.partyName && w.candidate?.partyName !== 'Independent') ? w.candidate.partyName : 'Independent'}
// //               </div>
// //               {w.candidate?.shortSpeech && (
// //                 <div className="text-xs text-[#A1A1A1] mt-1">“{w.candidate.shortSpeech}”</div>
// //               )}
// //               <div className="text-[#C9F300] text-sm mt-1">Total Votes: {w.totalVotes}</div>

// //               <div className="mt-2 text-white font-medium">Manifestos & Timelines</div>
// //               {(!w.manifestos || w.manifestos.length === 0) ? (
// //                 <div className="text-[#A1A1A1] text-sm">No manifestos</div>
// //               ) : (
// //                 <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
// //                   {w.manifestos.map((m) => {
// //                     const due = m.dueDate ? new Date(m.dueDate).toLocaleDateString() : '—';
// //                     return (
// //                       <div key={m._id} className="rounded-lg border border-[#2A2A2A] p-2">
// //                         <div className="text-white font-medium">{m.title}</div>
// //                         {m.summary && <div className="text-xs text-[#A1A1A1] mt-1">{m.summary}</div>}
// //                         <div className="text-xs text-[#A1A1A1] mt-1">
// //                           Timeline: {m.targetWindowMonths ? `${m.targetWindowMonths} months` : '—'} • Due: {due}
// //                         </div>
// //                         {m.isOverdue ? (
// //                           <button
// //                             disabled={submitting === String(m._id)}
// //                             onClick={() => filePetition(e._id, w.candidate._id, m._id)}
// //                             className="mt-2 px-2 py-1 rounded-md bg-red-600 text-white text-xs"
// //                           >
// //                             {submitting === String(m._id) ? 'Submitting...' : 'File Petition (Overdue)'}
// //                           </button>
// //                         ) : (
// //                           <div className="mt-2 text-xs text-[#9EFF00]">On track</div>
// //                         )}
// //                       </div>
// //                     );
// //                   })}
// //                 </div>
// //               )}
// //             </div>
// //           ))
// //         )}
// //       </section>

// //       {/* Seat-wise winners */}
// //       <section className="rounded-2xl border border-[#2A2A2A] bg-[#171717] p-4">
// //         <div className="text-white font-semibold mb-2">Seat-wise Winners</div>
// //         {(!data.seatWise || data.seatWise.length === 0) ? (
// //           <div className="text-[#A1A1A1] text-sm">No data</div>
// //         ) : (
// //           <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
// //             {data.seatWise.map((w, idx) => (
// //               <div key={idx} className="rounded-lg border border-[#2A2A2A] p-3">
// //                 <div className="text-white font-medium">{w.seat}</div>
// //                 <div className="text-[#A1A1A1] text-sm">{w.candidateName} • {w.partyName || 'Unknown'}</div>
// //                 <div className="text-[#C9F300] text-sm mt-1">Votes: {w.totalVotes}</div>
// //               </div>
// //             ))}
// //           </div>
// //         )}
// //       </section>

// //       {/* Party-wise & Manifesto-wise... (already implemented above) */}

// //       {!!msg && <div className="text-sm text-[#9EFF00]">{msg}</div>}
// //     </div>
// //   );
// // }

// 'use client';

// import { useEffect, useState } from 'react';
// import Link from 'next/link';

// export default function ElectionResultsPage({ params }) {
//     const id = params?.id;
//     const [resData, setResData] = useState(null);   // /api/elections/:id/results
//     const [winners, setWinners] = useState([]);     // /api/elections/:id/winners
//     const [msg, setMsg] = useState('');
//     const [loading, setLoading] = useState(true);
//     const [submitting, setSubmitting] = useState(null);

//     useEffect(() => {
//         if (!id) return;
//         (async () => {
//             setLoading(true);
//             setMsg('');
//             try {
//                 const [r1, r2] = await Promise.all([
//                     fetch(`/api/elections/${id}/results`, { cache: 'no-store', credentials: 'include' }),
//                     fetch(`/api/elections/${id}/winners`, { cache: 'no-store', credentials: 'include' }),
//                 ]);
//                 const j1 = await r1.json();
//                 const j2 = await r2.json();

//                 if (!j1.ok) setMsg(j1.error || 'Failed to load results');
//                 else setResData(j1);

//                 if (!j2.ok) setMsg(j2.error || 'Failed to load winners');
//                 else setWinners(j2.winners || []);
//             } catch {
//                 setMsg('Network error');
//             } finally {
//                 setLoading(false);
//             }
//         })();
//     }, [id]);

//     async function filePetition(electionId, candidateId, manifestoId) {
//         try {
//             setMsg('');
//             setSubmitting(String(manifestoId));
//             const reason = window.prompt('Describe your complaint (optional):') || '';
//             const r = await fetch('/api/petitions', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 credentials: 'include',
//                 body: JSON.stringify({ electionId, candidateId, manifestoId, reason }),
//             });
//             const j = await r.json();
//             if (!j.ok) setMsg(j.error || 'Failed to file petition');
//             else setMsg('✅ Petition filed successfully.');
//         } catch {
//             setMsg('Failed to file petition');
//         } finally {
//             setSubmitting(null);
//         }
//     }

//     if (loading) return <div className="text-[#A1A1A1]">Loading…</div>;
//     if (!resData) return <div className="text-red-400">{msg || 'Failed to load'}</div>;

//     const e = resData.election || {};
//     const seatWise = resData.seatWise || [];
//     const byParty = resData.byParty || [];
//     const byManifesto = resData.byManifesto || [];
//     const totalVotes = resData.totalVotes || 0;

//     return (
//         <div className="space-y-6">
//             {/* Header */}
//             <div className="rounded-2xl border border-[#2A2A2A] bg-[#171717] p-4 flex items-center justify-between">
//                 <div>
//                     <div className="text-white text-xl font-semibold">{e.name}</div>
//                     <div className="text-[#A1A1A1] text-sm capitalize">
//                         {e.type} • {e.ballotType}
//                     </div>
//                     <div className="text-[#A1A1A1] text-xs mt-1">
//                         {new Date(e.startAt).toLocaleString()} — {new Date(e.endAt).toLocaleString()}
//                     </div>
//                     <div className="text-[#C9F300] text-xs mt-1">Total Votes: {totalVotes}</div>
//                 </div>
//                 <Link
//                     href="/elections"
//                     className="px-3 py-1.5 rounded-lg bg-[#1F1F1F] border border-[#2A2A2A] text-[#EDEDED]"
//                 >
//                     ← Back
//                 </Link>
//             </div>

//             {/* Elected Candidates & Their Promises */}
//             <section className="rounded-2xl border border-[#2A2A2A] bg-[#171717] p-4">
//                 <div className="text-white font-semibold mb-2">Elected Candidates & Their Promises</div>
//                 {(!winners || winners.length === 0) ? (
//                     <div className="text-[#A1A1A1] text-sm">No winners data</div>
//                 ) : (
//                     winners.map((w, idx) => (
//                         <div key={idx} className="rounded-xl border border-[#2A2A2A] p-3 mb-3 bg-[#1a1a1a]">
//                             <div className="flex items-center justify-between">
//                                 <div>
//                                     <div className="text-white font-medium">{w.seat}</div>
//                                     <div className="text-[#A1A1A1] text-sm">
//                                         {w.candidate?.name} • {(w.candidate?.partyName && w.candidate?.partyName !== 'Independent') ? w.candidate.partyName : 'Independent'}
//                                     </div>
//                                     {w.candidate?.shortSpeech && (
//                                         <div className="text-xs text-[#A1A1A1] mt-1">“{w.candidate.shortSpeech}”</div>
//                                     )}
//                                 </div>
//                                 <div className="text-[#C9F300] text-sm">Total Votes: {w.totalVotes}</div>
//                             </div>

//                             {/* Manifestos */}
//                             <div className="mt-3 text-white font-medium">Manifestos & Timelines</div>
//                             {(!w.manifestos || w.manifestos.length === 0) ? (
//                                 <div className="text-[#A1A1A1] text-sm">No manifestos</div>
//                             ) : (
//                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
//                                     {w.manifestos.map((m) => {
//                                         const due = m.dueDate ? new Date(m.dueDate).toLocaleDateString() : '—';
//                                         return (
//                                             <div key={m._id} className="rounded-lg border border-[#2A2A2A] p-3">
//                                                 <div className="text-white font-medium">{m.title}</div>
//                                                 {m.summary && <div className="text-xs text-[#A1A1A1] mt-1">{m.summary}</div>}
//                                                 <div className="text-xs text-[#A1A1A1] mt-1">
//                                                     Timeline: {m.targetWindowMonths ? `${m.targetWindowMonths} months` : '—'} • Due: {due}
//                                                 </div>
//                                                 {m.isOverdue ? (
//                                                     <button
//                                                         disabled={submitting === String(m._id)}
//                                                         onClick={() => filePetition(e._id, w.candidate._id, m._id)}
//                                                         className="mt-2 px-2 py-1 rounded-md bg-red-600 text-white text-xs"
//                                                     >
//                                                         {submitting === String(m._id) ? 'Submitting…' : 'File Petition (Overdue)'}
//                                                     </button>
//                                                 ) : (
//                                                     <div className="mt-2 text-xs text-[#9EFF00]">On track</div>
//                                                 )}
//                                             </div>
//                                         );
//                                     })}
//                                 </div>
//                             )}
//                         </div>
//                     ))
//                 )}
//             </section>

//             {/* Seat-wise Winners */}
//             <section className="rounded-2xl border border-[#2A2A2A] bg-[#171717] p-4">
//                 <div className="text-white font-semibold mb-2">Seat-wise Winners</div>
//                 {seatWise.length === 0 ? (
//                     <div className="text-[#A1A1A1] text-sm">No seat-wise data</div>
//                 ) : (
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//                         {seatWise.map((w, idx) => (
//                             <div key={idx} className="rounded-lg border border-[#2A2A2A] p-3">
//                                 <div className="text-white font-medium">{w.seat}</div>
//                                 <div className="text-[#A1A1A1] text-sm">
//                                     {w.candidateName} • {w.partyName || 'Unknown'}
//                                 </div>
//                                 <div className="text-[#C9F300] text-sm mt-1">Votes: {w.totalVotes}</div>
//                             </div>
//                         ))}
//                     </div>
//                 )}
//             </section>

//             {/* Party-wise Totals */}
//             <section className="rounded-2xl border border-[#2A2A2A] bg-[#171717] p-4">
//                 <div className="text-white font-semibold mb-2">Party-wise Totals</div>
//                 {byParty.length === 0 ? (
//                     <div className="text-[#A1A1A1] text-sm">No party totals available</div>
//                 ) : (
//                     <table className="min-w-full text-sm">
//                         <thead className="bg-[#1b1b1b] text-[#A1A1A1]">
//                             <tr>
//                                 <th className="text-left px-3 py-2">Party</th>
//                                 <th className="text-left px-3 py-2">Votes</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {byParty.map((p, i) => (
//                                 <tr key={i} className="border-t border-[#232323]">
//                                     <td className="px-3 py-2 text-white">{p.partyName}</td>
//                                     <td className="px-3 py-2 text-[#EDEDED]">{p.votes}</td>
//                                 </tr>
//                             ))}
//                         </tbody>
//                     </table>
//                 )}
//             </section>

//             {/* Manifesto-wise Totals */}
//             <section className="rounded-2xl border border-[#2A2A2A] bg-[#171717] p-4">
//                 <div className="text-white font-semibold mb-2">Manifesto-wise Votes</div>
//                 {byManifesto.length === 0 ? (
//                     <div className="text-[#A1A1A1] text-sm">No manifesto breakdown available</div>
//                 ) : (
//                     <div className="space-y-2">
//                         {byManifesto.map((m, idx) => (
//                             <div key={idx} className="rounded-lg border border-[#2A2A2A] p-3 bg-[#1a1a1a]">
//                                 <div className="text-sm text-[#EDEDED]">
//                                     <b className="text-white">[{m.seat}]</b> {m.candidateName} • {m.partyName || 'Unknown'}
//                                 </div>
//                                 <div className="text-white font-medium mt-1">{m.title}</div>
//                                 {m.summary && <div className="text-xs text-[#A1A1A1] mt-1">{m.summary}</div>}
//                                 <div className="text-[#C9F300] text-sm mt-1">Votes: {m.votes}</div>
//                             </div>
//                         ))}
//                     </div>
//                 )}
//             </section>

//             {!!msg && <div className="text-sm text-[#9EFF00]">{msg}</div>}
//         </div>
//     );
// }

'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

/* Small UI helpers */
function Badge({ color = 'gray', children }) {
    const map = {
        gray: 'bg-[#2A2A2A] text-[#EDEDED] border-[#3A3A3A]',
        red: 'bg-red-900/30 text-red-300 border-red-700/50',
        green: 'bg-emerald-900/30 text-emerald-300 border-emerald-700/40',
        yellow: 'bg-yellow-900/30 text-yellow-300 border-yellow-700/40',
        lime: 'bg-[#22330a] text-[#C9F300] border-[#2f4a0d]',
    };
    return (
        <span className={`inline-block text-xs px-2 py-0.5 rounded-lg border ${map[color] || map.gray}`}>
            {children}
        </span>
    );
}

function Modal({ open, title, children, onClose }) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60">
            <div className="w-full max-w-md rounded-xl border border-[#2A2A2A] bg-[#171717] p-4">
                <div className="flex items-center justify-between mb-2">
                    <div className="text-white font-semibold">{title}</div>
                    <button onClick={onClose} className="text-[#A1A1A1] hover:text-white">✕</button>
                </div>
                <div>{children}</div>
            </div>
        </div>
    );
}

export default function ElectionResultsPage() {
    const { id } = useParams();
    const [resData, setResData] = useState(null);  // results response
    const [winners, setWinners] = useState([]);     // winners response
    const [petitions, setPetitions] = useState([]); // current user's petitions
    const [msg, setMsg] = useState('');
    const [loading, setLoading] = useState(true);

    // Auth: can the user file petitions?
    const [canPetition, setCanPetition] = useState(false);

    // Petition modal state
    const [petitionOpen, setPetitionOpen] = useState(false);
    const [loginOpen, setLoginOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [pManifesto, setPManifesto] = useState(null);
    const [pReason, setPReason] = useState('');

    useEffect(() => {
        (async () => {
            try {
                const r = await fetch('/api/me', { credentials: 'include', cache: 'no-store' });
                const j = await r.json();
                setCanPetition(!!j?.ok);
            } catch {
                setCanPetition(false);
            }
        })();
    }, []);

    useEffect(() => {
        if (!id) return;
        (async () => {
            setLoading(true);
            setMsg('');
            try {
                const [r1, r2] = await Promise.all([
                    fetch(`/api/elections/${id}/results`, { cache: 'no-store', credentials: 'include' }),
                    fetch(`/api/elections/${id}/winners`, { cache: 'no-store', credentials: 'include' }),
                ]);
                const j1 = await r1.json();
                const j2 = await r2.json();

                if (!j1.ok) setMsg(j1.error || 'Failed to load results');
                else setResData(j1);

                if (!j2.ok) setMsg(j2.error || 'Failed to load winners');
                else setWinners(j2.winners || []);
            } catch {
                setMsg('Network error');
            } finally {
                setLoading(false);
            }
        })();
    }, [id]);

    // Load current user's petitions for this election (GET now returns 200 even if unauth)
    useEffect(() => {
        if (!id) return;
        (async () => {
            try {
                const r = await fetch(`/api/petitions?electionId=${id}`, {
                    cache: 'no-store', credentials: 'include'
                });
                if (!r.ok) {
                    setPetitions([]);
                    return;
                }
                const j = await r.json();
                if (j.ok) setPetitions(j.data || []);
            } catch {
                setPetitions([]);
            }
        })();
    }, [id]);

    // Quick check: user already filed for this manifesto?
    const filedMap = useMemo(() => {
        const s = new Set();
        for (const p of petitions) {
            if (p.manifestoId) s.add(String(p.manifestoId));
        }
        return s;
    }, [petitions]);

    function openPetition(seatWinner, manifesto) {
        if (!canPetition) { setLoginOpen(true); return; }
        setPManifesto({
            title: manifesto?.title || 'Manifesto',
            electionId: resData?.election?._id,
            candidateId: seatWinner?.candidate?._id,
            manifestoId: manifesto?._id,
        });
        setPReason('');
        setPetitionOpen(true);
    }

    async function submitPetition() {
        if (!pManifesto) return;
        try {
            setSubmitting(true);
            setMsg('');
            const r = await fetch('/api/petitions', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    electionId: pManifesto.electionId,
                    candidateId: pManifesto.candidateId,
                    manifestoId: pManifesto.manifestoId,
                    reason: pReason,
                })
            });
            if (r.status === 401) {
                setPetitionOpen(false);
                setLoginOpen(true);
                return;
            }
            const j = await r.json();
            if (!j.ok) {
                setMsg(j.error || 'Failed to file petition');
                return;
            }
            setMsg('✅ Petition filed successfully.');
            setPetitionOpen(false);

            // Reload petitions so the "Filed" badge shows
            try {
                const rr = await fetch(`/api/petitions?electionId=${id}`, { credentials: 'include', cache: 'no-store' });
                if (rr.ok) {
                    const jj = await rr.json();
                    if (jj.ok) setPetitions(jj.data || []);
                }
            } catch { }
        } catch {
            setMsg('Failed to file petition');
        } finally {
            setSubmitting(false);
        }
    }

    if (loading) return <div className="text-[#A1A1A1]">Loading…</div>;
    if (!resData) return <div className="text-red-400">{msg || 'Failed to load'}</div>;

    const e = resData.election || {};
    const seatWise = resData.seatWise || [];
    const byParty = resData.byParty || [];
    const byManifesto = resData.byManifesto || [];
    const totalVotes = resData.totalVotes || 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="rounded-2xl border border-[#2A2A2A] bg-[#171717] p-4 flex items-center justify-between">
                <div>
                    <div className="text-white text-xl font-semibold">{e.name}</div>
                    <div className="text-[#A1A1A1] text-sm capitalize">
                        {e.type} • {e.ballotType}
                    </div>
                    <div className="text-[#A1A1A1] text-xs mt-1">
                        {new Date(e.startAt).toLocaleString()} — {new Date(e.endAt).toLocaleString()}
                    </div>
                    <div className="text-[#C9F300] text-xs mt-1">Total Votes: {totalVotes}</div>
                </div>
                <Link
                    href="/elections"
                    className="px-3 py-1.5 rounded-lg bg-[#1F1F1F] border border-[#2A2A2A] text-[#EDEDED]"
                >
                    ← Back
                </Link>
            </div>

            {/* Elected Candidates & Their Promises */}
            <section className="rounded-2xl border border-[#2A2A2A] bg-[#171717] p-4">
                <div className="text-white font-semibold mb-2">Elected Candidates & Their Promises</div>
                {(!winners || winners.length === 0) ? (
                    <div className="text-[#A1A1A1] text-sm">No winners data</div>
                ) : (
                    winners.map((w, idx) => (
                        <div key={idx} className="rounded-xl border border-[#2A2A2A] p-3 mb-3 bg-[#1a1a1a]">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-white font-medium">{w.seat}</div>
                                    <div className="text-[#A1A1A1] text-sm">
                                        {w.candidate?.name} • {(w.candidate?.partyName && w.candidate?.partyName !== 'Independent') ? w.candidate.partyName : 'Independent'}
                                    </div>
                                    {w.candidate?.shortSpeech && (
                                        <div className="text-xs text-[#A1A1A1] mt-1">“{w.candidate.shortSpeech}”</div>
                                    )}
                                </div>
                                <div className="text-[#C9F300] text-sm">Total Votes: {w.totalVotes}</div>
                            </div>

                            <div className="mt-3 text-white font-medium">Manifestos & Timelines</div>
                            {(!w.manifestos || w.manifestos.length === 0) ? (
                                <div className="text-[#A1A1A1] text-sm">No manifestos</div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {w.manifestos.map((m) => {
                                        const due = m.dueDate ? new Date(m.dueDate).toLocaleString() : '—';
                                        const isFiled = filedMap.has(String(m._id));
                                        const overdue = !!m.isOverdue;

                                        return (
                                            <div key={m._id} className="rounded-lg border border-[#2A2A2A] p-3 bg-[#141414]">
                                                <div className="flex items-center justify-between">
                                                    <div className="text-white font-medium">{m.title}</div>
                                                    <div>
                                                        {isFiled ? (
                                                            <Badge color="green">Petition Filed</Badge>
                                                        ) : overdue ? (
                                                            <Badge color="red">Overdue</Badge>
                                                        ) : (
                                                            <Badge color="lime">On Track</Badge>
                                                        )}
                                                    </div>
                                                </div>

                                                {m.summary && <div className="text-xs text-[#A1A1A1] mt-1">{m.summary}</div>}
                                                <div className="text-xs text-[#A1A1A1] mt-1">
                                                    Timeline: {m.targetWindowMonths ? `${m.targetWindowMonths} months` :
                                                        m.targetWindowMinutes ? `${m.targetWindowMinutes} minutes` : '—'}
                                                    {` • Due: ${due}`}
                                                </div>

                                                <div className="mt-2">
                                                    {overdue ? (
                                                        <button
                                                            disabled={isFiled}
                                                            onClick={() => !isFiled && openPetition(w, m)}
                                                            className={`px-2 py-1 rounded-md text-xs ${isFiled
                                                                ? 'bg-[#2A2A2A] text-[#8a8a8a] cursor-not-allowed'
                                                                : 'bg-red-600 text-white hover:bg-red-700'
                                                                }`}
                                                        >
                                                            {isFiled ? 'Petition Filed' : 'File Petition'}
                                                        </button>
                                                    ) : (
                                                        <span className="text-xs text-[#9EFF00]">No action required</span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </section>

            {/* Seat-wise Winners */}
            <section className="rounded-2xl border border-[#2A2A2A] bg-[#171717] p-4">
                <div className="text-white font-semibold mb-2">Seat-wise Winners</div>
                {seatWise.length === 0 ? (
                    <div className="text-[#A1A1A1] text-sm">No seat-wise data</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {seatWise.map((w, idx) => (
                            <div key={idx} className="rounded-lg border border-[#2A2A2A] p-3">
                                <div className="text-white font-medium">{w.seat}</div>
                                <div className="text-[#A1A1A1] text-sm">
                                    {w.candidateName} • {w.partyName || 'Unknown'}
                                </div>
                                <div className="text-[#C9F300] text-sm mt-1">Votes: {w.totalVotes}</div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Party-wise Totals */}
            <section className="rounded-2xl border border-[#2A2A2A] bg-[#171717] p-4">
                <div className="text-white font-semibold mb-2">Party-wise Totals</div>
                {byParty.length === 0 ? (
                    <div className="text-[#A1A1A1] text-sm">No party totals available</div>
                ) : (
                    <table className="min-w-full text-sm">
                        <thead className="bg-[#1b1b1b] text-[#A1A1A1]">
                            <tr>
                                <th className="text-left px-3 py-2">Party</th>
                                <th className="text-left px-3 py-2">Votes</th>
                            </tr>
                        </thead>
                        <tbody>
                            {byParty.map((p, i) => (
                                <tr key={i} className="border-t border-[#232323]">
                                    <td className="px-3 py-2 text-white">{p.partyName}</td>
                                    <td className="px-3 py-2 text-[#EDEDED]">{p.votes}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </section>

            {/* Manifesto-wise Totals */}
            <section className="rounded-2xl border border-[#2A2A2A] bg-[#171717] p-4">
                <div className="text-white font-semibold mb-2">Manifesto-wise Votes</div>
                {byManifesto.length === 0 ? (
                    <div className="text-[#A1A1A1] text-sm">No manifesto breakdown available</div>
                ) : (
                    <div className="space-y-2">
                        {byManifesto.map((m, idx) => (
                            <div key={idx} className="rounded-lg border border-[#2A2A2A] p-3 bg-[#1a1a1a]">
                                <div className="text-sm text-[#EDEDED]">
                                    <b className="text-white">[{m.seat}]</b> {m.candidateName} • {m.partyName || 'Unknown'}
                                </div>
                                <div className="text-white font-medium mt-1">{m.title}</div>
                                {m.summary && <div className="text-xs text-[#A1A1A1] mt-1">{m.summary}</div>}
                                <div className="text-[#C9F300] text-sm mt-1">Votes: {m.votes}</div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {!!msg && <div className="text-sm text-[#9EFF00]">{msg}</div>}

            {/* Petition Modal */}
            <Modal open={petitionOpen} onClose={() => !submitting && setPetitionOpen(false)} title="File Petition">
                <div className="text-[#EDEDED] text-sm">
                    You are filing a petition against: <b>{pManifesto?.title || 'Manifesto'}</b>
                </div>
                <label className="block mt-3">
                    <div className="text-[#A1A1A1] text-sm mb-1">Reason (optional)</div>
                    <textarea
                        rows={4}
                        value={pReason}
                        onChange={(e) => setPReason(e.target.value)}
                        placeholder="Describe your complaint or reason…"
                        className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded-xl px-3 py-2 text-[#EDEDED]"
                    />
                </label>
                <div className="mt-3 flex items-center gap-2 justify-end">
                    <button
                        disabled={submitting}
                        onClick={() => setPetitionOpen(false)}
                        className="px-3 py-1.5 rounded-lg bg-[#1F1F1F] border border-[#2A2A2A] text-[#EDEDED] disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        disabled={submitting}
                        onClick={submitPetition}
                        className="px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                    >
                        {submitting ? 'Submitting…' : 'Submit Petition'}
                    </button>
                </div>
            </Modal>

            {/* Login Required Modal */}
            <Modal open={loginOpen} onClose={() => setLoginOpen(false)} title="Login Required">
                <div className="text-[#EDEDED] text-sm">
                    You must be logged in as a voter to file a petition.
                </div>
                <div className="mt-3 flex items-center gap-2 justify-end">
                    <button
                        onClick={() => setLoginOpen(false)}
                        className="px-3 py-1.5 rounded-lg bg-[#1F1F1F] border border-[#2A2A2A] text-[#EDEDED]"
                    >
                        Close
                    </button>
                    <Link
                        href="/login"
                        className="px-3 py-1.5 rounded-lg bg-[#C9F300] text-black"
                    >
                        Go to Login
                    </Link>
                </div>
            </Modal>
        </div>
    );
}
