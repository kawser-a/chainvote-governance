// 'use client';

// import { useEffect, useMemo, useState } from 'react';

// export default function AdminManifestos() {
//     // table data
//     const [list, setList] = useState([]);
//     const [loading, setLoading] = useState(false);

//     // pagination
//     const [page, setPage] = useState(1);
//     const [limit, setLimit] = useState(20);
//     const [totalPages, setTotalPages] = useState(1);
//     const [total, setTotal] = useState(0);

//     // filters & sorting
//     const [status, setStatus] = useState('pending'); // pending | approved | rejected | all
//     const [seat, setSeat] = useState('');
//     const [search, setSearch] = useState('');
//     const [sortBy, setSortBy] = useState('createdAt'); // createdAt | title | seat | candidate
//     const [sortOrder, setSortOrder] = useState('desc'); // asc | desc

//     // seat options
//     const [seats, setSeats] = useState([]);

//     // optimistic mutation lock
//     const [mutatingId, setMutatingId] = useState(null);

//     const query = useMemo(() => {
//         const p = new URLSearchParams();
//         p.set('page', String(page));
//         p.set('limit', String(limit));
//         p.set('status', status);
//         if (seat) p.set('seat', seat);
//         if (search) p.set('search', search);
//         p.set('sortBy', sortBy);
//         p.set('sortOrder', sortOrder);
//         return p.toString();
//     }, [page, limit, status, seat, search, sortBy, sortOrder]);

//     async function load() {
//         setLoading(true);
//         try {
//             const r = await fetch(`/api/admin/manifestos?${query}`, {
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
//         } catch {
//             setList([]);
//             setTotal(0);
//             setTotalPages(1);
//         } finally {
//             setLoading(false);
//         }
//     }

//     useEffect(() => {
//         load();
//         // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, [query]);

//     // try to load seat options (best-effort)
//     useEffect(() => {
//         (async () => {
//             try {
//                 // If you already have /api/admin/stats returning { seats: [{seat, total}] }
//                 const r = await fetch('/api/admin/stats', {
//                     credentials: 'include',
//                     cache: 'no-store',
//                 });
//                 const j = await r.json();
//                 if (j.ok && Array.isArray(j.seats)) {
//                     setSeats(j.seats.map((s) => s.seat));
//                 }
//             } catch {
//                 // ignore — seat filter will still work manually
//             }
//         })();
//     }, []);

//     async function setStatusFor(id, next) {
//         try {
//             setMutatingId(id);
//             const r = await fetch(`/api/admin/manifestos/${id}`, {
//                 method: 'PATCH',
//                 headers: { 'Content-Type': 'application/json' },
//                 credentials: 'include',
//                 body: JSON.stringify({ status: next }),
//             });
//             const j = await r.json();
//             if (!j.ok) {
//                 alert(j.error || 'Update failed');
//             } else {
//                 await load();
//             }
//         } catch {
//             alert('Network error');
//         } finally {
//             setMutatingId(null);
//         }
//     }

//     return (
//         <div className="space-y-6">
//             <h1 className="text-white text-xl font-semibold">Manifestos (Admin Review)</h1>

//             {/* Filters */}
//             <div className="grid grid-cols-1 lg:grid-cols-6 gap-3">
//                 <Select
//                     value={status}
//                     onChange={(v) => {
//                         setPage(1);
//                         setStatus(v);
//                     }}
//                     options={[
//                         { value: 'pending', label: 'Pending' },
//                         { value: 'approved', label: 'Approved' },
//                         { value: 'rejected', label: 'Rejected' },
//                         { value: 'all', label: 'All' },
//                     ]}
//                 />
//                 <Select
//                     value={seat}
//                     onChange={(v) => {
//                         setPage(1);
//                         setSeat(v);
//                     }}
//                     options={[{ value: '', label: 'All seats' }, ...seats.map((s) => ({ value: s, label: s }))]}
//                 />
//                 <Input
//                     placeholder="Search title..."
//                     value={search}
//                     onChange={(v) => {
//                         setPage(1);
//                         setSearch(v);
//                     }}
//                     className="lg:col-span-2"
//                 />
//                 <Select
//                     value={sortBy}
//                     onChange={setSortBy}
//                     options={[
//                         { value: 'createdAt', label: 'Created' },
//                         { value: 'title', label: 'Title' },
//                         { value: 'seat', label: 'Seat' },
//                         { value: 'candidate', label: 'Candidate' },
//                     ]}
//                 />
//                 <Select
//                     value={sortOrder}
//                     onChange={setSortOrder}
//                     options={[
//                         { value: 'desc', label: 'Desc' },
//                         { value: 'asc', label: 'Asc' },
//                     ]}
//                 />
//             </div>

//             {/* Table */}
//             <div className="rounded-2xl border border-[#232323] bg-[#171717] overflow-x-auto">
//                 <table className="min-w-full text-sm">
//                     {/* <thead className="bg-[#1b1b1b] text-[#A1A1A1]">
//                         <tr>
//                             <Th text="Seat" />
//                             <Th text="Candidate" />
//                             <Th text="Party/Ind." />
//                             <Th text="Title" />
//                             <Th text="Status" />
//                             <Th text="Created" />
//                             <Th text="Actions" />
//                         </tr>
//                     </thead> */}
//                     <thead className="bg-[#1b1b1b] text-[#A1A1A1]">
//                         <tr>
//                             <Th text="Seat" />
//                             <Th text="Candidate" />
//                             <Th text="Party/Ind." />
//                             <Th text="Title" />
//                             <Th text="Target (months)" />  {/* NEW */}
//                             <Th text="Status" />
//                             <Th text="Created" />
//                             <Th text="Actions" />
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {loading ? (
//                             <tr>
//                                 <td colSpan={7} className="p-6 text-center text-[#A1A1A1]">
//                                     Loading...
//                                 </td>
//                             </tr>
//                         ) : list.length === 0 ? (
//                             <tr>
//                                 <td colSpan={7} className="p-6 text-center text-[#A1A1A1]">
//                                     No items
//                                 </td>
//                             </tr>
//                         ) : (
//                             list.map((m) => (
//                                 <Row
//                                     key={m._id}
//                                     m={m}
//                                     disabled={mutatingId === m._id}
//                                     onApprove={() => setStatusFor(m._id, 'approved')}
//                                     onReject={() => setStatusFor(m._id, 'rejected')}
//                                 />
//                             ))
//                         )}
//                     </tbody>
//                 </table>
//             </div>

//             {/* Footer / Pagination */}
//             <div className="flex items-center justify-between">
//                 <div className="text-[#A1A1A1] text-sm">Total: {total}</div>
//                 <div className="flex items-center gap-2">
//                     <button
//                         onClick={() => setPage((p) => Math.max(1, p - 1))}
//                         disabled={page === 1}
//                         className="px-3 py-1 rounded-lg bg-[#1F1F1F] border border-[#2A2A2A] text-white disabled:opacity-50"
//                     >
//                         Prev
//                     </button>
//                     <span className="text-[#A1A1A1] text-sm">
//                         Page {page} / {totalPages}
//                     </span>
//                     <button
//                         onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
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

// /* Row + cells */
// // function Row({ m, onApprove, onReject, disabled }) {
// //     const party = m.candidate?.independent ? 'Independent' : m.candidate?.partyName || '';
// //     return (
// //         <tr className="border-t border-[#232323] hover:bg-[#1c1c1c]">
// //             <Td>{m.seat}</Td>
// //             <Td className="text-white">{m.candidate?.name}</Td>
// //             <Td>{party}</Td>
// //             <Td className="text-white">{m.title}</Td>
// //             <Td className="capitalize">{m.status}</Td>
// //             <Td>{new Date(m.createdAt).toLocaleString()}</Td>
// //             <Td>
// //                 <details>
// //                     <summary className="cursor-pointer inline-block mr-3 text-[#9EFF00]">View</summary>
// //                     <div className="mt-2 p-3 rounded-lg bg-[#1F1F1F] border border-[#2A2A2A] text-[#EDEDED] space-y-2">
// //                         {m.summary ? (
// //                             <p className="whitespace-pre-wrap">{m.summary}</p>
// //                         ) : (
// //                             <p className="text-[#A1A1A1]">No summary</p>
// //                         )}
// //                         <div>
// //                             <div className="text-[#A1A1A1] text-sm mb-1">Milestones</div>
// //                             {!m.milestones || m.milestones.length === 0 ? (
// //                                 <div className="text-[#A1A1A1]">None</div>
// //                             ) : (
// //                                 <ul className="list-disc ml-5 space-y-1">
// //                                     {m.milestones.map((x, i) => (
// //                                         <li key={i}>
// //                                             <span className="text-white">{x.title}</span>
// //                                             {x.targetDate && (
// //                                                 <span className="text-[#A1A1A1] ml-2">
// //                                                     ({new Date(x.targetDate).toLocaleDateString()})
// //                                                 </span>
// //                                             )}
// //                                         </li>
// //                                     ))}
// //                                 </ul>
// //                             )}
// //                         </div>
// //                     </div>
// //                 </details>

// //                 {m.status !== 'approved' && (
// //                     <button
// //                         onClick={onApprove}
// //                         disabled={disabled}
// //                         className="px-3 py-1 rounded-lg text-xs bg-green-600 text-white hover:bg-green-700 mr-2 disabled:opacity-50"
// //                     >
// //                         Approve
// //                     </button>
// //                 )}
// //                 {m.status !== 'rejected' && (
// //                     <button
// //                         onClick={onReject}
// //                         disabled={disabled}
// //                         className="px-3 py-1 rounded-lg text-xs bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
// //                     >
// //                         Reject
// //                     </button>
// //                 )}
// //             </Td>
// //         </tr>
// //     );
// // }

// function Row({ m, onApprove, onReject, disabled }) {
//     const party = m.candidate?.independent ? 'Independent' : m.candidate?.partyName || '';
//     return (
//         <tr className="border-t border-[#232323] hover:bg-[#1c1c1c]">
//             <Td>{m.seat}</Td>
//             <Td className="text-white">{m.candidate?.name}</Td>
//             <Td>{party}</Td>
//             <Td className="text-white">{m.title}</Td>
//             <Td>{m.targetWindowMonths ?? '-'}</Td> {/* NEW */}
//             <Td className="capitalize">{m.status}</Td>
//             <Td>{new Date(m.createdAt).toLocaleString()}</Td>
//             <Td>
//                 <details>
//                     <summary className="cursor-pointer inline-block mr-3 text-[#9EFF00]">View</summary>
//                     <div className="mt-2 p-3 rounded-lg bg-[#1F1F1F] border border-[#2A2A2A] text-[#EDEDED] space-y-2">
//                         {m.summary ? (
//                             <p className="whitespace-pre-wrap">{m.summary}</p>
//                         ) : (
//                             <p className="text-[#A1A1A1]">No summary</p>
//                         )}
//                         <div className="text-[#A1A1A1] text-sm">
//                             Target Window: <span className="text-white">{m.targetWindowMonths ?? '-'} months</span>
//                         </div>
//                     </div>
//                 </details>

//                 {m.status !== 'approved' && (
//                     <button
//                         onClick={onApprove}
//                         disabled={disabled}
//                         className="px-3 py-1 rounded-lg text-xs bg-green-600 text-white hover:bg-green-700 mr-2 disabled:opacity-50"
//                     >
//                         Approve
//                     </button>
//                 )}
//                 {m.status !== 'rejected' && (
//                     <button
//                         onClick={onReject}
//                         disabled={disabled}
//                         className="px-3 py-1 rounded-lg text-xs bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
//                     >
//                         Reject
//                     </button>
//                 )}
//             </Td>
//         </tr>
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

// 'use client';

// import { useEffect, useMemo, useState } from 'react';

// export default function AdminManifestos() {
//     // table data
//     const [list, setList] = useState([]);
//     const [loading, setLoading] = useState(false);

//     // pagination
//     const [page, setPage] = useState(1);
//     const [limit, setLimit] = useState(20);
//     const [totalPages, setTotalPages] = useState(1);
//     const [total, setTotal] = useState(0);

//     // filters & sorting
//     const [status, setStatus] = useState('pending'); // pending | approved | rejected | all
//     const [seat, setSeat] = useState('');
//     const [search, setSearch] = useState('');
//     const [sortBy, setSortBy] = useState('createdAt'); // createdAt | title | seat | candidate
//     const [sortOrder, setSortOrder] = useState('desc'); // asc | desc

//     // seat options
//     const [seats, setSeats] = useState([]);

//     // optimistic mutation lock
//     const [mutatingId, setMutatingId] = useState(null);

//     const query = useMemo(() => {
//         const p = new URLSearchParams();
//         p.set('page', String(page));
//         p.set('limit', String(limit));
//         p.set('status', status);
//         if (seat) p.set('seat', seat);
//         if (search) p.set('search', search);
//         p.set('sortBy', sortBy);
//         p.set('sortOrder', sortOrder);
//         return p.toString();
//     }, [page, limit, status, seat, search, sortBy, sortOrder]);

//     async function load() {
//         setLoading(true);
//         try {
//             const r = await fetch(`/api/admin/manifestos?${query}`, {
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
//         } catch {
//             setList([]);
//             setTotal(0);
//             setTotalPages(1);
//         } finally {
//             setLoading(false);
//         }
//     }

//     useEffect(() => {
//         load();
//         // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, [query]);

//     // try to load seat options (best-effort)
//     useEffect(() => {
//         (async () => {
//             try {
//                 const r = await fetch('/api/admin/stats', {
//                     credentials: 'include',
//                     cache: 'no-store',
//                 });
//                 const j = await r.json();
//                 if (j.ok && Array.isArray(j.seats)) {
//                     setSeats(j.seats.map((s) => s.seat));
//                 }
//             } catch {
//                 // ignore
//             }
//         })();
//     }, []);

//     async function setStatusFor(id, next) {
//         try {
//             setMutatingId(id);
//             const r = await fetch(`/api/admin/manifestos/${id}`, {
//                 method: 'PATCH',
//                 headers: { 'Content-Type': 'application/json' },
//                 credentials: 'include',
//                 body: JSON.stringify({ status: next }),
//             });
//             const j = await r.json();
//             if (!j.ok) {
//                 alert(j.error || 'Update failed');
//             } else {
//                 await load();
//             }
//         } catch {
//             alert('Network error');
//         } finally {
//             setMutatingId(null);
//         }
//     }

//     return (
//         <div className="space-y-6">
//             <h1 className="text-white text-xl font-semibold">Manifestos (Admin Review)</h1>

//             {/* Filters */}
//             <div className="grid grid-cols-1 lg:grid-cols-6 gap-3">
//                 <Select
//                     value={status}
//                     onChange={(v) => {
//                         setPage(1);
//                         setStatus(v);
//                     }}
//                     options={[
//                         { value: 'pending', label: 'Pending' },
//                         { value: 'approved', label: 'Approved' },
//                         { value: 'rejected', label: 'Rejected' },
//                         { value: 'all', label: 'All' },
//                     ]}
//                 />
//                 <Select
//                     value={seat}
//                     onChange={(v) => {
//                         setPage(1);
//                         setSeat(v);
//                     }}
//                     options={[{ value: '', label: 'All seats' }, ...seats.map((s) => ({ value: s, label: s }))]}
//                 />
//                 <Input
//                     placeholder="Search title..."
//                     value={search}
//                     onChange={(v) => {
//                         setPage(1);
//                         setSearch(v);
//                     }}
//                     className="lg:col-span-2"
//                 />
//                 <Select
//                     value={sortBy}
//                     onChange={setSortBy}
//                     options={[
//                         { value: 'createdAt', label: 'Created' },
//                         { value: 'title', label: 'Title' },
//                         { value: 'seat', label: 'Seat' },
//                         { value: 'candidate', label: 'Candidate' },
//                     ]}
//                 />
//                 <Select
//                     value={sortOrder}
//                     onChange={setSortOrder}
//                     options={[
//                         { value: 'desc', label: 'Desc' },
//                         { value: 'asc', label: 'Asc' },
//                     ]}
//                 />
//             </div>

//             {/* Table */}
//             <div className="rounded-2xl border border-[#232323] bg-[#171717] overflow-x-auto">
//                 <table className="min-w-full text-sm">
//                     <thead className="bg-[#1b1b1b] text-[#A1A1A1]">
//                         <tr>
//                             <Th text="Seat" />
//                             <Th text="Candidate" />
//                             <Th text="Party/Ind." />
//                             <Th text="Title" />
//                             <Th text="Target" /> {/* <-- label updated */}
//                             <Th text="Status" />
//                             <Th text="Created" />
//                             <Th text="Actions" />
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {loading ? (
//                             <tr>
//                                 <td colSpan={8} className="p-6 text-center text-[#A1A1A1]">
//                                     Loading...
//                                 </td>
//                             </tr>
//                         ) : list.length === 0 ? (
//                             <tr>
//                                 <td colSpan={8} className="p-6 text-center text-[#A1A1A1]">
//                                     No items
//                                 </td>
//                             </tr>
//                         ) : (
//                             list.map((m) => (
//                                 <Row
//                                     key={m._id}
//                                     m={m}
//                                     disabled={mutatingId === m._id}
//                                     onApprove={() => setStatusFor(m._id, 'approved')}
//                                     onReject={() => setStatusFor(m._id, 'rejected')}
//                                 />
//                             ))
//                         )}
//                     </tbody>
//                 </table>
//             </div>

//             {/* Footer / Pagination */}
//             <div className="flex items-center justify-between">
//                 <div className="text-[#A1A1A1] text-sm">Total: {total}</div>
//                 <div className="flex items-center gap-2">
//                     <button
//                         onClick={() => setPage((p) => Math.max(1, p - 1))}
//                         disabled={page === 1}
//                         className="px-3 py-1 rounded-lg bg-[#1F1F1F] border border-[#2A2A2A] text-white disabled:opacity-50"
//                     >
//                         Prev
//                     </button>
//                     <span className="text-[#A1A1A1] text-sm">
//                         Page {page} / {totalPages}
//                     </span>
//                     <button
//                         onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
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

// function Row({ m, onApprove, onReject, disabled }) {
//     const party = m.candidate?.independent ? 'Independent' : m.candidate?.partyName || '';
//     const targetLabel = m.targetWindowMinutes
//         ? `${m.targetWindowMinutes} minute(s)`
//         : (m.targetWindowMonths ? `${m.targetWindowMonths} month(s)` : '—');

//     const dueDate = calcDue(m); // uses createdAt + targetWindowX

//     return (
//         <tr className="border-t border-[#232323] hover:bg-[#1c1c1c]">
//             <Td>{m.seat}</Td>
//             <Td className="text-white">{m.candidate?.name}</Td>
//             <Td>{party}</Td>
//             <Td className="text-white">{m.title}</Td>
//             <Td>{targetLabel}</Td>
//             <Td className="capitalize">{m.status}</Td>
//             <Td>{new Date(m.createdAt).toLocaleString()}</Td>
//             <Td>
//                 <details>
//                     <summary className="cursor-pointer inline-block mr-3 text-[#9EFF00]">View</summary>
//                     <div className="mt-2 p-3 rounded-lg bg-[#1F1F1F] border border-[#2A2A2A] text-[#EDEDED] space-y-2">
//                         {m.summary ? (
//                             <p className="whitespace-pre-wrap">{m.summary}</p>
//                         ) : (
//                             <p className="text-[#A1A1A1]">No summary</p>
//                         )}
//                         <div className="text-[#A1A1A1] text-sm">
//                             <div>Target: <span className="text-white">{targetLabel}</span></div>
//                             <div>Due: <span className="text-white">{dueDate ? new Date(dueDate).toLocaleString() : '—'}</span></div>
//                         </div>
//                     </div>
//                 </details>

//                 {m.status !== 'approved' && (
//                     <button
//                         onClick={onApprove}
//                         disabled={disabled}
//                         className="px-3 py-1 rounded-lg text-xs bg-green-600 text-white hover:bg-green-700 mr-2 disabled:opacity-50"
//                     >
//                         Approve
//                     </button>
//                 )}
//                 {m.status !== 'rejected' && (
//                     <button
//                         onClick={onReject}
//                         disabled={disabled}
//                         className="px-3 py-1 rounded-lg text-xs bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
//                     >
//                         Reject
//                     </button>
//                 )}
//             </Td>
//         </tr>
//     );
// }

// /* helpers */
// function calcDue(m) {
//     if (!m.createdAt) return null;
//     const base = new Date(m.createdAt);
//     if (m.targetWindowMinutes) return addMinutes(base, Number(m.targetWindowMinutes));
//     if (m.targetWindowMonths) return addMonths(base, Number(m.targetWindowMonths));
//     return null;
// }
// function addMonths(date, months) {
//     const d = new Date(date);
//     d.setMonth(d.getMonth() + months);
//     return d;
// }
// function addMinutes(date, minutes) {
//     const d = new Date(date);
//     d.setMinutes(d.getMinutes() + minutes);
//     return d;
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

'use client';
import { useEffect, useMemo, useState } from 'react';

export default function AdminManifestos() {
    // Table states
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(false);
    // Pagination
    const [page, setPage] = useState(1);
    const [limit] = useState(20);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    // Filters & sorting
    const [status, setStatus] = useState('pending');
    const [seat, setSeat] = useState('');
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState('desc');
    const [seats, setSeats] = useState([]);
    const [mutatingId, setMutatingId] = useState(null);

    const query = useMemo(() => {
        const p = new URLSearchParams();
        p.set('page', String(page));
        p.set('limit', String(limit));
        p.set('status', status);
        if (seat) p.set('seat', seat);
        if (search) p.set('search', search);
        p.set('sortBy', sortBy);
        p.set('sortOrder', sortOrder);
        return p.toString();
    }, [page, limit, status, seat, search, sortBy, sortOrder]);

    async function load() {
        setLoading(true);
        try {
            const r = await fetch(`/api/admin/manifestos?${query}`, {
                credentials: 'include',
                cache: 'no-store',
            });
            const j = await r.json();
            if (j.ok) {
                setList(j.data || []);
                setTotal(j.total || 0);
                setTotalPages(j.totalPages || 1);
            } else {
                setList([]);
                setTotal(0);
                setTotalPages(1);
            }
        } catch {
            setList([]);
            setTotal(0);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
    }, [query]);

    useEffect(() => {
        (async () => {
            try {
                const r = await fetch('/api/admin/stats', {
                    credentials: 'include',
                    cache: 'no-store',
                });
                const j = await r.json();
                if (j.ok && Array.isArray(j.seats)) {
                    setSeats(j.seats.map((s) => s.seat));
                }
            } catch {
                // fail silently
            }
        })();
    }, []);

    async function setStatusFor(id, next) {
        try {
            setMutatingId(id);
            const r = await fetch(`/api/admin/manifestos/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ status: next }),
            });
            const j = await r.json();
            if (!j.ok) {
                alert(j.error || 'Update failed');
            } else {
                await load();
            }
        } catch {
            alert('Network error');
        } finally {
            setMutatingId(null);
        }
    }

    return (
        <div className="space-y-6 px-8 py-6 max-w-full overflow-x-auto">
            <h1 className="text-3xl font-extrabold text-white tracking-tight select-none">Manifestos (Admin Review)</h1>

            {/* Filters Section */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6 text-gray-300">
                <Select
                    label="Status"
                    value={status}
                    onChange={v => {
                        setPage(1);
                        setStatus(v);
                    }}
                    options={[
                        { value: "pending", label: "Pending" },
                        { value: "approved", label: "Approved" },
                        { value: "rejected", label: "Rejected" },
                        { value: "all", label: "All" },
                    ]}
                />
                <Select
                    label="Seat"
                    value={seat}
                    onChange={v => {
                        setPage(1);
                        setSeat(v);
                    }}
                    options={[{ value: "", label: "All seats" }, ...seats.map(s => ({ value: s, label: s }))]}
                />
                <Input
                    label="Search Title"
                    placeholder="Search title..."
                    value={search}
                    onChange={v => {
                        setPage(1);
                        setSearch(v);
                    }}
                    className="md:col-span-2"
                />
                <Select
                    label="Sort By"
                    value={sortBy}
                    onChange={setSortBy}
                    options={[
                        { value: "createdAt", label: "Created" },
                        { value: "title", label: "Title" },
                        { value: "seat", label: "Seat" },
                        { value: "candidate", label: "Candidate" },
                    ]}
                />
                <Select
                    label="Sort Order"
                    value={sortOrder}
                    onChange={setSortOrder}
                    options={[
                        { value: "desc", label: "Descending" },
                        { value: "asc", label: "Ascending" },
                    ]}
                />
            </div>

            {/* Table Container */}
            <div className="rounded-3xl border border-[#232323] bg-gradient-to-br from-[#171717] to-[#141414] shadow-lg overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead className="bg-[#1b1b1b] text-[#A1A1A1]">
                        <tr>
                            <Th text="Seat" />
                            <Th text="Candidate" />
                            <Th text="Party/Ind." />
                            <Th text="Title" />
                            <Th text="Target" />
                            <Th text="Status" />
                            <Th text="Created" />
                            <Th text="Actions" />
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={8} className="p-12 text-center text-[#A1A1A1] font-medium select-none">Loading manifestos...</td>
                            </tr>
                        ) : list.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="p-12 text-center text-[#A1A1A1] font-medium select-none">No manifestos found.</td>
                            </tr>
                        ) : (
                            list.map(m => (
                                <Row
                                    key={m._id}
                                    manifesto={m}
                                    isMutating={mutatingId === m._id}
                                    onApprove={() => setStatusFor(m._id, 'approved')}
                                    onReject={() => setStatusFor(m._id, 'rejected')}
                                />
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-6 text-gray-300 select-none">
                <span>Total: {total.toLocaleString()}</span>
                <div className="flex items-center gap-3">
                    <button
                        disabled={page === 1 || loading}
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        className="px-3 py-1 rounded-lg bg-[#1F1F1F] border border-[#2A2A2A] text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#232323] transition"
                    >
                        Prev
                    </button>
                    <span className="text-sm">{page} / {totalPages}</span>
                    <button
                        disabled={page === totalPages || loading}
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        className="px-3 py-1 rounded-lg bg-[#1F1F1F] border border-[#2A2A2A] text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#232323] transition"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}

function Row({ manifesto: m, onApprove, onReject, isMutating }) {
    const party = m.candidate?.independent ? 'Independent' : m.candidate?.partyName || '';
    const targetLabel = m.targetWindowMinutes
        ? `${m.targetWindowMinutes} minute(s)`
        : m.targetWindowMonths
            ? `${m.targetWindowMonths} month(s)`
            : '—';

    const dueDate = calculateDueDate(m);

    return (
        <tr className="border-t border-[#232323] hover:bg-[#222] group">
            <Td>{m.seat}</Td>
            <Td className="text-white font-medium">{m.candidate?.name}</Td>
            <Td>{party}</Td>
            <Td className="text-white">{m.title}</Td>
            <Td>{targetLabel}</Td>
            <Td className="capitalize">{m.status}</Td>
            <Td>{new Date(m.createdAt).toLocaleString()}</Td>
            <Td className="space-x-2">
                {m.status !== 'approved' && (
                    <button
                        onClick={onApprove}
                        disabled={isMutating}
                        className="px-3 py-1 rounded-lg text-xs bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                    >
                        Approve
                    </button>
                )}
                {m.status !== 'rejected' && (
                    <button
                        onClick={onReject}
                        disabled={isMutating}
                        className="px-3 py-1 rounded-lg text-xs bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                    >
                        Reject
                    </button>
                )}
                <details className="inline-block ml-1 group-hover:inline-block hidden">
                    <summary className="text-xs cursor-pointer text-lime-400">Details</summary>
                    <div className="mt-2 p-3 bg-[#1F1F1F] border border-[#2A2A2A] rounded-lg text-gray-400 text-xs max-w-xs">
                        {m.summary ? m.summary : <em>No summary available</em>}
                        <div className="mt-2">
                            <strong>Target:</strong> {targetLabel}<br />
                            <strong>Due Date:</strong> {dueDate ? new Date(dueDate).toLocaleString() : '—'}
                        </div>
                    </div>
                </details>
            </Td>
        </tr>
    );
}

// Helper to calculate due date for manifesto
function calculateDueDate(m) {
    if (!m.createdAt) return null;
    const baseDate = new Date(m.createdAt);
    if (m.targetWindowMinutes) {
        return new Date(baseDate.getTime() + m.targetWindowMinutes * 60000);
    }
    if (m.targetWindowMonths) {
        const d = new Date(baseDate);
        d.setMonth(d.getMonth() + m.targetWindowMonths);
        return d;
    }
    return null;
}

// Table helpers
function Th({ text }) {
    return <th className="text-left px-4 py-3 font-semibold">{text}</th>;
}
function Td({ children, className = '' }) {
    return <td className={`px-4 py-3 text-[#EDEDED] ${className}`}>{children}</td>;
}
function Input({ label, value, onChange, placeholder, className = "" }) {
    return (
        <div className="flex flex-col">
            {label && <label className="text-xs mb-1 text-gray-400">{label}</label>}
            <input
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                className={"rounded-lg border border-[#2A2A2A] bg-[#0F0F0F] px-3 py-2 text-[#EDEDED] focus:outline-none focus:ring-2 focus:ring-lime-500 " + className}
            />
        </div>
    );
}
function Select({ label, value, onChange, options }) {
    return (
        <div className="flex flex-col">
            {label && <label className="text-xs mb-1 text-gray-400">{label}</label>}
            <select
                value={value}
                onChange={e => onChange(e.target.value)}
                className="rounded-lg border border-[#2A2A2A] bg-[#0F0F0F] px-3 py-2 text-[#EDEDED] focus:outline-none focus:ring-2 focus:ring-lime-500"
            >
                {options.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                ))}
            </select>
        </div>
    );
}
