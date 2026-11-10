// // 'use client';
// // import { useEffect, useState } from 'react';

// // export default function CandidateManifestos() {
// //     const REQUIRED = { title: 5, summary: 10 }; // min chars for UX
// //     const [list, setList] = useState([]);
// //     const [title, setTitle] = useState('');
// //     const [summary, setSummary] = useState('');
// //     const [milestones, setMilestones] = useState([{ title: '', targetDate: '' }]);
// //     const [msg, setMsg] = useState('');

// //     async function load() {
// //         const r = await fetch('/api/candidate/manifestos');
// //         const j = await r.json();
// //         if (j.ok) setList(j.data);
// //     }
// //     useEffect(() => { load(); }, []);

// //     function addRow() { setMilestones(m => [...m, { title: '', targetDate: '' }]); }
// //     function setRow(i, key, val) { setMilestones(m => m.map((r, idx) => idx === i ? { ...r, [key]: val } : r)); }
// //     function delRow(i) { setMilestones(m => m.filter((_, idx) => idx !== i)); }

// //     async function submit() {
// //         setMsg('');
// //         const r = await fetch('/api/candidate/manifestos', {
// //             method: 'POST', headers: { 'Content-Type': 'application/json' },
// //             body: JSON.stringify({
// //                 title, summary,
// //                 milestones: milestones.filter(x => x.title?.trim())
// //             })
// //         });
// //         const j = await r.json();
// //         if (j.ok) {
// //             setMsg('Submitted for approval.');
// //             setTitle(''); setSummary(''); setMilestones([{ title: '', targetDate: '' }]);
// //             load();
// //         } else setMsg(j.error || 'Failed');
// //     }

// //     return (
// //         <div className="space-y-6">
// //             <h1 className="text-white text-xl font-semibold">Manifestos</h1>

// //             {/* Create */}
// //             <div className="rounded-2xl border border-[#232323] bg-[#171717] p-4 space-y-4">
// //                 <h2 className="text-white font-semibold">Create a New Manifesto</h2>

// //                 <label className="flex flex-col gap-1">
// //                     <span className="text-[#A1A1A1] text-sm">Manifesto Title <span className="text-red-400">*</span></span>
// //                     <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Clean Water for Ward 5"
// //                         className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded-xl px-3 py-2 text-[#EDEDED]" />
// //                     <small className="text-[#6B6B6B]">Min {REQUIRED.title} characters</small>
// //                 </label>

// //                 <label className="flex flex-col gap-1">
// //                     <span className="text-[#A1A1A1] text-sm">Why this matters (Description) <span className="text-red-400">*</span></span>
// //                     <textarea value={summary} onChange={e => setSummary(e.target.value)} rows={5}
// //                         placeholder="Explain the problem, your plan, expected benefits for citizens…"
// //                         className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded-xl px-3 py-2 text-[#EDEDED]" />
// //                     <small className="text-[#6B6B6B]">Min {REQUIRED.summary} characters</small>
// //                 </label>

// //                 <div className="space-y-2">
// //                     <div className="text-[#A1A1A1] text-sm">
// //                         Timeline to Achieve <span className="text-red-400">*</span>
// //                         <div className="text-xs text-[#6B6B6B]">Add one or more milestones with a target date.</div>
// //                     </div>

// //                     {milestones.map((m, i) => (
// //                         <div key={i} className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
// //                             <input value={m.title} onChange={e => setRow(i, 'title', e.target.value)} placeholder="Milestone title (e.g., Tender issued)"
// //                                 className="bg-[#0F0F0F] border border-[#2A2A2A] rounded-xl px-3 py-2 text-[#EDEDED] md:col-span-2" />
// //                             <input type="date" value={m.targetDate} onChange={e => setRow(i, 'targetDate', e.target.value)}
// //                                 className="bg-[#0F0F0F] border border-[#2A2A2A] rounded-xl px-3 py-2 text-[#EDEDED]" />
// //                             <button onClick={() => delRow(i)} className="text-xs text-red-400">Remove</button>
// //                         </div>
// //                     ))}
// //                     <button onClick={addRow} className="px-3 py-1 rounded-lg bg-[#1F1F1F] border border-[#2A2A2A] text-white">
// //                         Add Another Milestone
// //                     </button>
// //                 </div>

// //                 <button
// //                     onClick={submit}
// //                     disabled={
// //                         title.trim().length < REQUIRED.title ||
// //                         summary.trim().length < REQUIRED.summary ||
// //                         milestones.length === 0 ||
// //                         milestones.some(x => !x.title.trim() || !x.targetDate)
// //                     }
// //                     className="px-4 py-2 rounded-lg bg-[#C9F300] text-black font-medium disabled:opacity-50"
// //                 >
// //                     Submit for Admin Approval
// //                 </button>
// //                 {msg && <span className="text-[#9EFF00] text-sm ml-3">{msg}</span>}
// //             </div>


// //             {/* List */}
// //             <div className="rounded-2xl border border-[#232323] bg-[#171717] overflow-x-auto">
// //                 <table className="min-w-full text-sm">
// //                     <thead className="bg-[#1b1b1b] text-[#A1A1A1]">
// //                         <tr>
// //                             <Th text="Title" />
// //                             <Th text="Status" />
// //                             <Th text="Created" />
// //                         </tr>
// //                     </thead>
// //                     <tbody>
// //                         {list.length === 0 ? (
// //                             <tr><td colSpan={3} className="p-6 text-center text-[#A1A1A1]">No manifestos</td></tr>
// //                         ) : list.map(m => (
// //                             <tr key={m._id} className="border-t border-[#232323] hover:bg-[#1c1c1c]">
// //                                 <Td className="text-white">{m.title}</Td>
// //                                 <Td>{m.status}</Td>
// //                                 <Td>{new Date(m.createdAt).toLocaleString()}</Td>
// //                             </tr>
// //                         ))}
// //                     </tbody>
// //                 </table>
// //             </div>
// //         </div>
// //     );
// // }
// // function Th({ text }) { return <th className="text-left px-4 py-3 font-medium">{text}</th>; }
// // function Td({ children, className = '' }) { return <td className={`px-4 py-3 text-[#EDEDED] ${className}`}>{children}</td>; }

// 'use client';
// import { useEffect, useState } from 'react';

// export default function CandidateManifestos() {
//   const REQUIRED = { title: 5, summary: 10 };

//   const [list, setList] = useState([]);
//   const [title, setTitle] = useState('');
//   const [summary, setSummary] = useState('');
//   const [targetWindowMonths, setTargetWindowMonths] = useState('6'); // default 6 months
//   const [msg, setMsg] = useState('');
//   const [saving, setSaving] = useState(false);

//   async function load() {
//     const r = await fetch('/api/candidate/manifestos', { cache: 'no-store', credentials: 'include' });
//     const j = await r.json();
//     if (j.ok) setList(j.data);
//   }
//   useEffect(() => { load(); }, []);

//   const monthsValid = Number.isInteger(Number(targetWindowMonths))
//     && Number(targetWindowMonths) >= 1
//     && Number(targetWindowMonths) <= 60;

//   const canSubmit =
//     title.trim().length >= REQUIRED.title &&
//     summary.trim().length >= REQUIRED.summary &&
//     monthsValid;

//   async function submit() {
//     if (!canSubmit) return;
//     setMsg('');
//     setSaving(true);
//     try {
//       const r = await fetch('/api/candidate/manifestos', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         credentials: 'include',
//         body: JSON.stringify({
//           title,
//           summary,
//           targetWindowMonths: Number(targetWindowMonths),
//         }),
//       });
//       const j = await r.json();
//       if (j.ok) {
//         setMsg('✅ Submitted for admin approval.');
//         setTitle('');
//         setSummary('');
//         setTargetWindowMonths('6');
//         load();
//       } else {
//         setMsg(j.error || 'Failed');
//       }
//     } catch {
//       setMsg('Network error');
//     } finally {
//       setSaving(false);
//     }
//   }

//   return (
//     <div className="space-y-6">
//       <h1 className="text-white text-xl font-semibold">Manifestos</h1>

//       {/* Create */}
//       <div className="rounded-2xl border border-[#232323] bg-[#171717] p-4 space-y-4">
//         <h2 className="text-white font-semibold">Create a New Manifesto</h2>

//         <label className="flex flex-col gap-1">
//           <span className="text-[#A1A1A1] text-sm">
//             Manifesto Title <span className="text-red-400">*</span>
//           </span>
//           <input
//             value={title}
//             onChange={(e) => setTitle(e.target.value)}
//             placeholder="e.g., Clean Water for Ward 5"
//             className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded-xl px-3 py-2 text-[#EDEDED]"
//           />
//           <small className="text-[#6B6B6B]">Min {REQUIRED.title} characters</small>
//         </label>

//         <label className="flex flex-col gap-1">
//           <span className="text-[#A1A1A1] text-sm">
//             Why this matters (Description) <span className="text-red-400">*</span>
//           </span>
//           <textarea
//             value={summary}
//             onChange={(e) => setSummary(e.target.value)}
//             rows={5}
//             placeholder="Explain the problem, your plan, expected benefits for citizens…"
//             className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded-xl px-3 py-2 text-[#EDEDED]"
//           />
//           <small className="text-[#6B6B6B]">Min {REQUIRED.summary} characters</small>
//         </label>

//         {/* ✅ Fixed target duration (months) */}
//         <label className="flex flex-col gap-1">
//           <span className="text-[#A1A1A1] text-sm">
//             If elected, this will be my first priority to implement within
//           </span>
//           <div className="flex items-center gap-2">
//             <input
//               type="number"
//               min={1}
//               max={60}
//               value={targetWindowMonths}
//               onChange={(e) => setTargetWindowMonths(e.target.value)}
//               className="w-28 bg-[#0F0F0F] border border-[#2A2A2A] rounded-xl px-3 py-2 text-[#EDEDED]"
//             />
//             <span className="text-[#EDEDED]">months</span>
//           </div>
//           {!monthsValid && (
//             <small className="text-red-400">Please enter a number between 1 and 60.</small>
//           )}
//         </label>

//         <button
//           onClick={submit}
//           disabled={!canSubmit || saving}
//           className="px-4 py-2 rounded-lg bg-[#C9F300] text-black font-medium disabled:opacity-50"
//         >
//           {saving ? 'Submitting…' : 'Submit for Admin Approval'}
//         </button>
//         {msg && <span className="text-[#9EFF00] text-sm ml-3">{msg}</span>}
//       </div>

//       {/* List */}
//       <div className="rounded-2xl border border-[#232323] bg-[#171717] overflow-x-auto">
//         <table className="min-w-full text-sm">
//           <thead className="bg-[#1b1b1b] text-[#A1A1A1]">
//             <tr>
//               <Th text="Title" />
//               <Th text="Target (months)" />
//               <Th text="Status" />
//               <Th text="Created" />
//             </tr>
//           </thead>
//           <tbody>
//             {list.length === 0 ? (
//               <tr>
//                 <td colSpan={4} className="p-6 text-center text-[#A1A1A1]">No manifestos</td>
//               </tr>
//             ) : (
//               list.map((m) => (
//                 <tr key={m._id} className="border-t border-[#232323] hover:bg-[#1c1c1c]">
//                   <Td className="text-white">{m.title}</Td>
//                   <Td>{m.targetWindowMonths ?? '-'}</Td>
//                   <Td className="capitalize">{m.status}</Td>
//                   <Td>{new Date(m.createdAt).toLocaleString()}</Td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }
// function Th({ text }) { return <th className="text-left px-4 py-3 font-medium">{text}</th>; }
// function Td({ children, className = '' }) { return <td className={`px-4 py-3 text-[#EDEDED] ${className}`}>{children}</td>; }

'use client';
import { useEffect, useState } from 'react';

/* Utilities */
function addMonths(date, months) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}
function addMinutes(date, minutes) {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() + minutes);
  return d;
}
function fmtDue(m) {
  if (!m.createdAt) return null;
  const created = new Date(m.createdAt);
  if (m.targetWindowMinutes) {
    const due = addMinutes(created, m.targetWindowMinutes);
    return { due, label: `${m.targetWindowMinutes} minute(s)`, unit: 'minutes' };
  }
  if (m.targetWindowMonths) {
    const due = addMonths(created, m.targetWindowMonths);
    return { due, label: `${m.targetWindowMonths} month(s)`, unit: 'months' };
  }
  return null;
}

export default function CandidateManifestos() {
  // Form
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [durationUnit, setDurationUnit] = useState('months'); // 'months' | 'minutes'
  const [targetMonths, setTargetMonths] = useState('');
  const [targetMinutes, setTargetMinutes] = useState('');

  // State
  const [msg, setMsg] = useState('');
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const REQUIRED = { title: 5, summary: 10 };

  async function load() {
    setLoading(true);
    try {
      const r = await fetch('/api/candidate/manifestos', { cache: 'no-store', credentials: 'include' });
      const j = await r.json();
      if (j.ok) setList(j.data || []);
      else setList([]);
    } catch {
      setList([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function submit() {
    setMsg('');
    // Validate the duration depending on unit
    let body = { title: title.trim(), summary: summary.trim(), durationUnit };
    if (!body.title || body.title.length < REQUIRED.title) {
      setMsg(`Title must be at least ${REQUIRED.title} characters`);
      return;
    }
    if (!body.summary || body.summary.length < REQUIRED.summary) {
      setMsg(`Description must be at least ${REQUIRED.summary} characters`);
      return;
    }

    if (durationUnit === 'minutes') {
      const mins = Number(targetMinutes);
      if (!mins || mins < 1) {
        setMsg('Please enter a valid minutes duration (>=1)');
        return;
      }
      body.targetWindowMinutes = mins;
    } else {
      const months = Number(targetMonths);
      if (!months || months < 1) {
        setMsg('Please enter a valid months duration (>=1)');
        return;
      }
      body.targetWindowMonths = months;
    }

    try {
      const r = await fetch('/api/candidate/manifestos', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify(body)
      });
      const j = await r.json();
      if (!j.ok) {
        setMsg(j.error || 'Failed to submit');
        return;
      }
      setMsg('Submitted for admin approval.');
      // Clear form
      setTitle(''); setSummary('');
      setTargetMonths(''); setTargetMinutes(''); setDurationUnit('months');
      load();
    } catch {
      setMsg('Network error');
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-white text-xl font-semibold">Manifestos</h1>

      {/* Create */}
      <div className="rounded-2xl border border-[#232323] bg-[#171717] p-4 space-y-4">
        <h2 className="text-white font-semibold">Create a New Manifesto</h2>

        {/* Title */}
        <label className="flex flex-col gap-1">
          <span className="text-[#A1A1A1] text-sm">
            Manifesto Title <span className="text-red-400">*</span>
          </span>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g., Clean Water for Ward 5"
            className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded-xl px-3 py-2 text-[#EDEDED]"
          />
          <small className="text-[#6B6B6B]">Min {REQUIRED.title} characters</small>
        </label>

        {/* Summary */}
        <label className="flex flex-col gap-1">
          <span className="text-[#A1A1A1] text-sm">
            Why this matters (Description) <span className="text-red-400">*</span>
          </span>
          <textarea
            value={summary}
            onChange={e => setSummary(e.target.value)}
            rows={5}
            placeholder="Explain the problem, your plan, expected benefits for citizens…"
            className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded-xl px-3 py-2 text-[#EDEDED]"
          />
          <small className="text-[#6B6B6B]">Min {REQUIRED.summary} characters</small>
        </label>

        {/* Duration Toggle */}
        <div>
          <div className="text-[#A1A1A1] text-sm mb-1">Commitment Window</div>
          <div className="flex items-center gap-4 mb-2">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="durUnit"
                value="months"
                checked={durationUnit === 'months'}
                onChange={() => setDurationUnit('months')}
              />
              <span className="text-[#EDEDED]">Months</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="durUnit"
                value="minutes"
                checked={durationUnit === 'minutes'}
                onChange={() => setDurationUnit('minutes')}
              />
              <span className="text-[#EDEDED]">Minutes (testing)</span>
            </label>
          </div>

          {durationUnit === 'months' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <label className="flex flex-col gap-1">
                <span className="text-[#A1A1A1] text-sm">Target Duration (Months)</span>
                <input
                  type="number"
                  value={targetMonths}
                  min={1}
                  onChange={(e) => setTargetMonths(e.target.value)}
                  placeholder="e.g., 6"
                  className="bg-[#0F0F0F] border border-[#2A2A2A] rounded-xl px-3 py-2 text-[#EDEDED]"
                />
              </label>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <label className="flex flex-col gap-1">
                <span className="text-[#A1A1A1] text-sm">Target Duration (Minutes)</span>
                <input
                  type="number"
                  value={targetMinutes}
                  min={1}
                  onChange={(e) => setTargetMinutes(e.target.value)}
                  placeholder="e.g., 5"
                  className="bg-[#0F0F0F] border border-[#2A2A2A] rounded-xl px-3 py-2 text-[#EDEDED]"
                />
              </label>
            </div>
          )}
        </div>

        {/* Submit */}
        <button
          onClick={submit}
          className="px-4 py-2 rounded-lg bg-[#C9F300] text-black font-medium hover:opacity-90"
        >
          Submit for Admin Approval
        </button>
        {msg && <span className="text-[#9EFF00] text-sm ml-3">{msg}</span>}
      </div>

      {/* List */}
      <div className="rounded-2xl border border-[#232323] bg-[#171717] overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-[#1b1b1b] text-[#A1A1A1]">
            <tr>
              <Th text="Title" />
              <Th text="Status" />
              <Th text="Duration" />
              <Th text="Due Date" />
              <Th text="Created" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="p-6 text-center text-[#A1A1A1]">Loading…</td></tr>
            ) : list.length === 0 ? (
              <tr><td colSpan={5} className="p-6 text-center text-[#A1A1A1]">No manifestos</td></tr>
            ) : (
              list.map((m) => {
                const info = fmtDue(m) || {};
                return (
                  <tr key={m._id} className="border-t border-[#232323] hover:bg-[#1c1c1c]">
                    <Td className="text-white">{m.title}</Td>
                    <Td className="capitalize">{m.status}</Td>
                    <Td className="text-[#EDEDED]">
                      {m.targetWindowMinutes
                        ? `${m.targetWindowMinutes} minute(s)`
                        : m.targetWindowMonths
                          ? `${m.targetWindowMonths} month(s)`
                          : '—'}
                    </Td>
                    <Td className="text-[#EDEDED]">
                      {info.due ? new Date(info.due).toLocaleString() : '—'}
                    </Td>
                    <Td className="text-[#EDEDED]">{new Date(m.createdAt).toLocaleString()}</Td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* small UI helpers */
function Th({ text }) {
  return <th className="text-left px-4 py-3 font-medium">{text}</th>;
}
function Td({ children, className = '' }) {
  return <td className={`px-4 py-3 text-[#EDEDED] ${className}`}>{children}</td>;
}
