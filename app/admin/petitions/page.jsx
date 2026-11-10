// // // /app/admin/petitions/page.jsx
// // 'use client';

// // import { useEffect, useState } from 'react';

// // export default function AdminPetitionsPage() {
// //   const [status, setStatus] = useState('open');
// //   const [items, setItems] = useState([]);

// //   async function load() {
// //     const r = await fetch(`/api/petitions?status=${status}`, { credentials: 'include', cache: 'no-store' });
// //     const j = await r.json();
// //     if (j.ok) setItems(j.items || []);
// //   }

// //   useEffect(() => { load(); }, [status]);

// //   async function setStatusFor(id, next) {
// //     const r = await fetch('/api/petitions', {
// //       method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
// //       body: JSON.stringify({ petitionId: id, status: next }),
// //     });
// //     const j = await r.json();
// //     if (j.ok) load();
// //     else alert(j.error || 'Update failed');
// //   }

// //   return (
// //     <div className="space-y-4">
// //       <h1 className="text-white text-xl font-semibold">Petitions</h1>
// //       <div className="flex gap-2">
// //         {['open', 'review', 'closed', 'all'].map(s => (
// //           <button key={s} onClick={() => setStatus(s)} className={`px-3 py-1 rounded-lg ${status === s ? 'bg-[#2A2A2A] text-white' : 'bg-[#1F1F1F] text-[#EDEDED]'}`}>
// //             {s}
// //           </button>
// //         ))}
// //       </div>

// //       <div className="rounded-2xl border border-[#2A2A2A] bg-[#171717] overflow-x-auto">
// //         <table className="min-w-full text-sm">
// //           <thead className="bg-[#1b1b1b] text-[#A1A1A1]">
// //             <tr>
// //               <th className="text-left px-3 py-2">Election</th>
// //               <th className="text-left px-3 py-2">Candidate</th>
// //               <th className="text-left px-3 py-2">Manifesto</th>
// //               <th className="text-left px-3 py-2">Voter</th>
// //               <th className="text-left px-3 py-2">Reason</th>
// //               <th className="text-left px-3 py-2">Status</th>
// //               <th className="text-left px-3 py-2">Actions</th>
// //             </tr>
// //           </thead>
// //           <tbody>
// //             {items.length === 0 ? (
// //               <tr><td colSpan={7} className="text-center text-[#A1A1A1] p-4">No petitions</td></tr>
// //             ) : items.map(p => (
// //               <tr key={p._id} className="border-t border-[#232323]">
// //                 <td className="px-3 py-2 text-[#EDEDED]">{p.election?.name}</td>
// //                 <td className="px-3 py-2 text-[#EDEDED]">{p.candidate?.name} ({p.candidate?.independent ? 'Independent' : p.candidate?.partyName})</td>
// //                 <td className="px-3 py-2 text-white">{p.manifesto?.title}</td>
// //                 <td className="px-3 py-2 text-[#EDEDED]">{p.voterNid}</td>
// //                 <td className="px-3 py-2 text-[#A1A1A1]">{p.reason || '-'}</td>
// //                 <td className="px-3 py-2 text-[#EDEDED] capitalize">{p.status}</td>
// //                 <td className="px-3 py-2">
// //                   {p.status !== 'open' && (
// //                     <button onClick={() => setStatusFor(p._id, 'open')} className="px-2 py-1 bg-[#1F1F1F] text-white rounded mr-1">Reopen</button>
// //                   )}
// //                   {p.status !== 'review' && (
// //                     <button onClick={() => setStatusFor(p._id, 'review')} className="px-2 py-1 bg-yellow-600 text-white rounded mr-1">Review</button>
// //                   )}
// //                   {p.status !== 'closed' && (
// //                     <button onClick={() => setStatusFor(p._id, 'closed')} className="px-2 py-1 bg-green-600 text-white rounded">Close</button>
// //                   )}
// //                 </td>
// //               </tr>
// //             ))}
// //           </tbody>
// //         </table>
// //       </div>
// //     </div>
// //   );
// // }

// 'use client';

// import { useEffect, useMemo, useState } from 'react';

// export default function AdminPetitions() {
//     const [list, setList] = useState([]);
//     const [loading, setLoading] = useState(false);

//     const [page, setPage] = useState(1);
//     const [limit] = useState(20);
//     const [totalPages, setTotalPages] = useState(1);
//     const [total, setTotal] = useState(0);

//     const [status, setStatus] = useState('all'); // open | under_review | verified | rejected | resolved | all
//     const [seat, setSeat] = useState('');
//     const [search, setSearch] = useState('');
//     const [electionId, setElectionId] = useState('');
//     const [candidateId, setCandidateId] = useState('');
//     const [manifestoId, setManifestoId] = useState('');

//     const [mutatingId, setMutatingId] = useState(null);

//     const query = useMemo(() => {
//         const p = new URLSearchParams();
//         p.set('page', String(page));
//         p.set('limit', String(limit));
//         p.set('status', status);
//         if (seat) p.set('seat', seat);
//         if (search) p.set('search', search);
//         if (electionId) p.set('electionId', electionId);
//         if (candidateId) p.set('candidateId', candidateId);
//         if (manifestoId) p.set('manifestoId', manifestoId);
//         return p.toString();
//     }, [page, limit, status, seat, search, electionId, candidateId, manifestoId]);

//     async function load() {
//         setLoading(true);
//         try {
//             const r = await fetch(`/api/admin/petitions?${query}`, {
//                 credentials: 'include',
//                 cache: 'no-store',
//             });
//             const j = await r.json();
//             if (j.ok) {
//                 setList(j.data || []);
//                 setTotal(j.total || 0);
//                 setTotalPages(j.totalPages || 1);
//             } else {
//                 setList([]);
//                 setTotal(0);
//                 setTotalPages(1);
//             }
//         } catch (e) {
//             setList([]);
//             setTotal(0);
//             setTotalPages(1);
//         } finally {
//             setLoading(false);
//         }
//     }

//     useEffect(() => {
//         load();
//     }, [query]);

//     async function setStatusFor(id, next) {
//         try {
//             setMutatingId(id);
//             const r = await fetch(`/api/admin/petitions/${id}`, {
//                 method: 'PATCH',
//                 headers: { 'Content-Type': 'application/json' },
//                 credentials: 'include',
//                 body: JSON.stringify({ status: next }),
//             });
//             const j = await r.json();
//             if (!j.ok) alert(j.error || 'Update failed');
//             else await load();
//         } catch {
//             alert('Network error');
//         } finally {
//             setMutatingId(null);
//         }
//     }

//     return (
//         <div className="space-y-6">
//             <h1 className="text-white text-xl font-semibold">Petitions</h1>

//             {/* Filters */}
//             <div className="grid grid-cols-1 lg:grid-cols-6 gap-3">
//                 <Select
//                     value={status}
//                     onChange={(v) => {
//                         setPage(1);
//                         setStatus(v);
//                     }}
//                     options={[
//                         { value: 'all', label: 'All Status' },
//                         { value: 'open', label: 'Open' },
//                         { value: 'under_review', label: 'Under Review' },
//                         { value: 'verified', label: 'Verified' },
//                         { value: 'rejected', label: 'Rejected' },
//                         { value: 'resolved', label: 'Resolved' },
//                     ]}
//                 />
//                 <Input
//                     placeholder="Seat..."
//                     value={seat}
//                     onChange={(v) => {
//                         setPage(1);
//                         setSeat(v);
//                     }}
//                 />
//                 <Input
//                     placeholder="Search reason..."
//                     value={search}
//                     onChange={(v) => {
//                         setPage(1);
//                         setSearch(v);
//                     }}
//                 />
//                 <Input
//                     placeholder="Election ID (optional)"
//                     value={electionId}
//                     onChange={(v) => {
//                         setPage(1);
//                         setElectionId(v);
//                     }}
//                 />
//                 <Input
//                     placeholder="Candidate ID (optional)"
//                     value={candidateId}
//                     onChange={(v) => {
//                         setPage(1);
//                         setCandidateId(v);
//                     }}
//                 />
//                 <Input
//                     placeholder="Manifesto ID (optional)"
//                     value={manifestoId}
//                     onChange={(v) => {
//                         setPage(1);
//                         setManifestoId(v);
//                     }}
//                 />
//             </div>

//             {/* <div className="rounded-2xl border border-[#232323] bg-[#171717] p-4">
//                 <div className="text-white font-semibold mb-2">Summary by Candidate (threshold check)</div>
//                 <SummaryBlock />
//             </div> */}

//             <div className="rounded-2xl border border-[#232323] bg-[#171717] overflow-x-auto">
//                 <table className="min-w-full text-sm">
//                     <thead className="bg-[#1b1b1b] text-[#A1A1A1]">
//                         <tr>
//                             <Th text="Created" />
//                             <Th text="Voter NID" />
//                             <Th text="Seat" />
//                             <Th text="Election" />
//                             <Th text="Candidate" />
//                             <Th text="Manifesto" />
//                             <Th text="Removal?" />
//                             <Th text="Reason" />
//                             <Th text="Status" />
//                             <Th text="Actions" />
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {loading ? (
//                             <tr><td colSpan={10} className="p-6 text-center text-[#A1A1A1]">Loading…</td></tr>
//                         ) : list.length === 0 ? (
//                             <tr><td colSpan={10} className="p-6 text-center text-[#A1A1A1]">No petitions</td></tr>
//                         ) : list.map(p => (
//                             <tr key={p._id} className="border-t border-[#232323] hover:bg-[#1c1c1c]">
//                                 <Td>{new Date(p.createdAt).toLocaleString()}</Td>
//                                 <Td>{p.voterNid || '-'}</Td>
//                                 <Td>{p.seat || '-'}</Td>
//                                 <Td className="text-white">{p.election?.name || '-'}</Td>
//                                 <Td className="text-white">{p.candidate?.name || '-'}</Td>
//                                 <Td className="text-white">{p.manifesto?.title || '-'}</Td>
//                                 <Td>{p.requestRemoval ? 'Yes' : 'No'}</Td>
//                                 <Td className="max-w-sm">
//                                     <details>
//                                         <summary className="cursor-pointer text-[#9EFF00]">View</summary>
//                                         <div className="mt-2">{p.reason || '-'}</div>
//                                     </details>
//                                 </Td>
//                                 <Td className="capitalize">{p.status}</Td>
//                                 <Td>
//                                     <div className="flex flex-wrap gap-1">
//                                         {['under_review', 'verified', 'rejected', 'resolved'].map(s => (
//                                             <button
//                                                 key={s}
//                                                 onClick={() => setStatusFor(p._id, s)}
//                                                 disabled={mutatingId === p._id}
//                                                 className="px-2 py-1 rounded-md text-xs bg-[#1F1F1F] border border-[#2A2A2A] text-white hover:bg-[#2A2A2A]"
//                                                 title={`Set status: ${s}`}
//                                             >
//                                                 {s.replace('_', ' ')}
//                                             </button>
//                                         ))}
//                                     </div>
//                                 </Td>
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>
//             </div>

//             {/* Pagination */}
//             <div className="flex items-center justify-between">
//                 <div className="text-[#A1A1A1] text-sm">Total: {total}</div>
//                 <div className="flex items-center gap-2">
//                     <button
//                         onClick={() => setPage(p => Math.max(1, p - 1))}
//                         disabled={page === 1}
//                         className="px-3 py-1 rounded-lg bg-[#1F1F1F] border border-[#2A2A2A] text-white disabled:opacity-50"
//                     >
//                         Prev
//                     </button>
//                     <span className="text-[#A1A1A1] text-sm">
//                         Page {page} / {totalPages}
//                     </span>
//                     <button
//                         onClick={() => setPage(p => Math.min(totalPages, p + 1))}
//                         disabled={page === totalPages}
//                         className="px-3 py-1 rounded-lg bg-[#1F1F1F] border border-[#2A2A2A] text-white disabled:opacity-50"
//                     >
//                         Next
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// }

// /* small UI helpers */
// function Th({ text }) {
//     return <th className="text-left px-4 py-3 font-medium">{text}</th>;
// }
// function Td({ children, className = '' }) {
//     return <td className={`px-4 py-3 text-[#EDEDED] ${className}`}>{children}</td>;
// }
// function Input({ value, onChange, placeholder = '', className = '' }) {
//     return (
//         <input
//             value={value}
//             onChange={(e) => onChange(e.target.value)}
//             placeholder={placeholder}
//             className={`bg-[#0F0F0F] border border-[#2A2A2A] rounded-xl px-3 py-2 text-[#EDEDED] ${className}`}
//         />
//     );
// }
// function Select({ value, onChange, options }) {
//     return (
//         <select
//             value={value}
//             onChange={(e) => onChange(e.target.value)}
//             className="bg-[#0F0F0F] border border-[#2A2A2A] rounded-xl px-3 py-2 text-[#EDEDED]"
//         >
//             {options.map((o) => (
//                 <option key={o.value} value={o.value}>
//                     {o.label}
//                 </option>
//             ))}
//         </select>
//     );
// }
// function SummaryBlock() {
//     const [summary, setSummary] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [err, setErr] = useState('');
//     const [removingId, setRemovingId] = useState(null);

//     useEffect(() => {
//         (async () => {
//             setLoading(true);
//             setErr('');
//             try {
//                 const r = await fetch('/api/admin/petitions/summary', { cache: 'no-store', credentials: 'include' });
//                 const j = await r.json();
//                 if (!j.ok) setErr('Failed to load summary');
//                 else setSummary(j.data || []);
//             } catch {
//                 setErr('Network error');
//             } finally {
//                 setLoading(false);
//             }
//         })();
//     }, []);

//     async function removeCandidate(candidateId, name) {
//         const reason = prompt(`Confirm removal for ${name}. Reason (optional):`) || 'Removed due to verified petitions threshold.';
//         if (!confirm(`Are you sure you want to remove ${name}?`)) return;
//         try {
//             setRemovingId(candidateId);
//             const r = await fetch(`/api/admin/candidates/${candidateId}/remove`, {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 credentials: 'include',
//                 body: JSON.stringify({ reason }),
//             });
//             const j = await r.json();
//             if (!j.ok) alert(j.error || 'Failed to remove candidate');
//             else {
//                 alert('Candidate removed.');
//                 // reload summary
//                 const rr = await fetch('/api/admin/petitions/summary', { cache: 'no-store', credentials: 'include' });
//                 const jj = await rr.json();
//                 if (jj.ok) setSummary(jj.data || []);
//             }
//         } catch {
//             alert('Network error');
//         } finally {
//             setRemovingId(null);
//         }
//     }

//     if (loading) return <div className="text-[#A1A1A1] text-sm">Loading…</div>;
//     if (err) return <div className="text-red-400 text-sm">{err}</div>;
//     if (!summary.length) return <div className="text-[#A1A1A1]">No petition groups.</div>;

//     return (
//         <div className="overflow-x-auto">
//             <table className="min-w-full text-sm">
//                 <thead className="bg-[#1b1b1b] text-[#A1A1A1]">
//                     <tr>
//                         <Th text="Candidate" />
//                         <Th text="Seat" />
//                         <Th text="Petitions (verified)" />
//                         <Th text="Eligible Voters" />
//                         <Th text="Threshold" />
//                         <Th text="Can Remove?" />
//                         <Th text="Action" />
//                     </tr>
//                 </thead>
//                 <tbody>
//                     {summary.map((g) => (
//                         <tr key={`${g.candidate._id}-${g.electionId}`} className="border-t border-[#232323] hover:bg-[#1c1c1c]">
//                             <Td className="text-white">{g.candidate.name} {g.candidate.removed ? '(removed)' : ''}</Td>
//                             <Td>{g.candidate.seat || '-'}</Td>
//                             <Td>{g.petitionCount}</Td>
//                             <Td>{g.eligibleVoters}</Td>
//                             <Td>{g.thresholdPercent}% → {g.thresholdCount}</Td>
//                             <Td className={g.canRemove ? 'text-green-400' : 'text-[#A1A1A1]'}>{g.canRemove ? 'Yes' : 'No'}</Td>
//                             <Td>
//                                 <button
//                                     disabled={!g.canRemove || g.candidate.removed || removingId === g.candidate._id}
//                                     onClick={() => removeCandidate(g.candidate._id, g.candidate.name)}
//                                     className={`px-3 py-1 rounded-lg text-xs ${!g.canRemove || g.candidate.removed
//                                         ? 'bg-[#2A2A2A] text-[#8a8a8a] cursor-not-allowed'
//                                         : 'bg-red-600 text-white hover:bg-red-700'
//                                         }`}
//                                 >
//                                     {g.candidate.removed ? 'Removed' : 'Remove Candidate'}
//                                 </button>
//                             </Td>
//                         </tr>
//                     ))}
//                 </tbody>
//             </table>
//         </div>
//     );
// }

'use client';

import { useEffect, useMemo, useState } from 'react';

export default function AdminPetitionsPage() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('open'); // open | under_review | accepted | rejected | dismissed | all
  const [electionId, setElectionId] = useState('');
  const [candidateId, setCandidateId] = useState('');
  const [msg, setMsg] = useState('');

  async function load() {
    setLoading(true);
    setMsg('');
    try {
      const p = new URLSearchParams();
      if (status && status !== 'all') p.set('status', status);
      if (electionId) p.set('electionId', electionId);
      if (candidateId) p.set('candidateId', candidateId);

      const r = await fetch(`/api/admin/petitions?${p.toString()}`, { credentials: 'include', cache: 'no-store' });
      const j = await r.json();
      if (!j.ok) {
        setMsg(j.error || 'Failed to load petitions');
        setList([]);
        return;
      }
      setList(j.data || []);
    } catch {
      setMsg('Network error');
      setList([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [status, electionId, candidateId]);

  // Example: let admin manually change petition status
  async function updateStatus(id, next) {
    try {
      const r = await fetch(`/api/admin/petitions/${id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      });
      const j = await r.json();
      if (!j.ok) { alert(j.error || 'Failed to update'); return; }
      load();
    } catch {
      alert('Network error');
    }
  }

  const counts = useMemo(() => {
    const m = new Map();
    for (const p of list) {
      const key = String(p.candidateId);
      m.set(key, (m.get(key) || 0) + 1);
    }
    return m;
  }, [list]);

  return (
    <div className="space-y-6">
      <h1 className="text-white text-xl font-semibold">Petitions (Admin)</h1>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Select value={status} onChange={setStatus}
          options={[
            { value: 'open', label: 'Open' },
            { value: 'under_review', label: 'Under Review' },
            { value: 'accepted', label: 'Accepted' },
            { value: 'rejected', label: 'Rejected' },
            { value: 'dismissed', label: 'Dismissed' },
            { value: 'all', label: 'All' },
          ]}
        />
        <Input value={electionId} onChange={setElectionId} placeholder="Filter by electionId" />
        <Input value={candidateId} onChange={setCandidateId} placeholder="Filter by candidateId" />
        <button onClick={load} className="px-3 py-2 rounded-lg bg-[#1F1F1F] border border-[#2A2A2A] text-white">
          Refresh
        </button>
      </div>

      {msg && <div className="text-sm text-red-400">{msg}</div>}

      <div className="rounded-2xl border border-[#232323] bg-[#171717] overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-[#1b1b1b] text-[#A1A1A1]">
            <tr>
              <Th text="Created" />
              <Th text="Election" />
              <Th text="Candidate" />
              <Th text="Manifesto" />
              <Th text="Voter NID" />
              <Th text="Reason" />
              <Th text="Status" />
              <Th text="Actions" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="p-6 text-center text-[#A1A1A1]">Loading…</td></tr>
            ) : list.length === 0 ? (
              <tr><td colSpan={8} className="p-6 text-center text-[#A1A1A1]">No items</td></tr>
            ) : (
              list.map((p) => (
                <tr key={p._id} className="border-t border-[#232323]">
                  <Td>{new Date(p.createdAt).toLocaleString()}</Td>
                  <Td>{String(p.electionId).slice(-6)}</Td>
                  <Td>{String(p.candidateId).slice(-6)}</Td>
                  <Td>{String(p.manifestoId).slice(-6)}</Td>
                  <Td>{p.voterNid}</Td>
                  <Td className="text-[#A1A1A1]">{p.reason || '—'}</Td>
                  <Td className="capitalize">{p.status}</Td>
                  <Td>
                    <div className="flex flex-wrap gap-2">
                      {p.status !== 'under_review' && (
                        <button onClick={() => updateStatus(p._id, 'under_review')}
                          className="px-3 py-1 text-xs rounded bg-yellow-700 text-white">
                          Under Review
                        </button>
                      )}
                      {p.status !== 'accepted' && (
                        <button onClick={() => updateStatus(p._id, 'accepted')}
                          className="px-3 py-1 text-xs rounded bg-green-700 text-white">
                          Accept
                        </button>
                      )}
                      {p.status !== 'rejected' && (
                        <button onClick={() => updateStatus(p._id, 'rejected')}
                          className="px-3 py-1 text-xs rounded bg-red-700 text-white">
                          Reject
                        </button>
                      )}
                      {p.status !== 'dismissed' && (
                        <button onClick={() => updateStatus(p._id, 'dismissed')}
                          className="px-3 py-1 text-xs rounded bg-gray-600 text-white">
                          Dismiss
                        </button>
                      )}
                    </div>
                  </Td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Candidate threshold hint */}
      <div className="rounded-2xl border border-[#232323] bg-[#171717] p-4">
        <div className="text-white font-semibold">Candidate Petition Totals</div>
        <div className="text-[#A1A1A1] text-sm mt-1">
          You can use these counts to determine if a candidate should be removed for too many petitions.
        </div>
        <div className="mt-2 text-sm text-[#EDEDED]">
          {Array.from(counts.entries()).map(([cid, n]) => (
            <div key={cid}>Candidate ID ending <b>{cid.slice(-6)}</b>: {n} petition(s)</div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Th({ text }) { return <th className="text-left px-4 py-3 font-medium">{text}</th>; }
function Td({ children, className = '' }) { return <td className={`px-4 py-3 text-[#EDEDED] ${className}`}>{children}</td>; }
function Input({ value, onChange, placeholder = '' }) {
  return (
    <input value={value} placeholder={placeholder} onChange={e => onChange(e.target.value)}
      className="bg-[#0F0F0F] border border-[#2A2A2A] rounded-xl px-3 py-2 text-[#EDEDED]" />
  );
}
function Select({ value, onChange, options }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      className="bg-[#0F0F0F] border border-[#2A2A2A] rounded-xl px-3 py-2 text-[#EDEDED]">
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}
