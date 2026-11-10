

// 'use client';
// import { useEffect, useMemo, useState } from 'react';
// import Link from 'next/link';

// function sections(elections) {
//     const now = Date.now();
//     const up = [];
//     const on = [];
//     const past = [];

//     for (const e of elections) {
//         const s = Date.parse(e.startAt);
//         const end = Date.parse(e.endAt);
//         if (end < now) past.push(e);
//         else if (s > now) up.push(e);
//         else on.push(e);
//     }
//     // sort: upcoming by start time asc, ongoing by end asc, past by end desc
//     up.sort((a, b) => Date.parse(a.startAt) - Date.parse(b.startAt));
//     on.sort((a, b) => Date.parse(a.endAt) - Date.parse(b.endAt));
//     past.sort((a, b) => Date.parse(b.endAt) - Date.parse(a.endAt));

//     return { upcoming: up, ongoing: on, past };
// }

// function msToHhmm(ms) {
//     if (ms <= 0) return '0m';
//     const mins = Math.floor(ms / 60000);
//     const h = Math.floor(mins / 60);
//     const m = mins % 60;
//     return `${h ? `${h}h ` : ''}${m}m`;
// }
// function remainingLabel(e) {
//     const now = Date.now();
//     const s = Date.parse(e.startAt);
//     const end = Date.parse(e.endAt);
//     if (now < s) return `Starts in ${msToHhmm(s - now)}`;
//     if (now > end) return `Ended ${msToHhmm(now - end)} ago`;
//     return `${msToHhmm(end - now)} left`;
// }

// export default function VoterElections() {
//     const [list, setList] = useState([]);
//     const [loading, setLoading] = useState(true);

//     useEffect(() => {
//         (async () => {
//             setLoading(true);
//             const r = await fetch('/api/elections', { cache: 'no-store', credentials: 'include' });
//             const j = await r.json();
//             if (j.ok) setList(j.data || []);
//             setLoading(false);
//         })();
//     }, []);

//     const grouped = useMemo(() => sections(list), [list]);

//     if (loading) return <div className="text-[#A1A1A1]">Loading…</div>;

//     return (
//         <div className="space-y-8">
//             <h1 className="text-white text-xl font-semibold">Elections</h1>

//             {/* Ongoing */}
//             <Section title="Ongoing Elections" items={grouped.ongoing} empty="No ongoing elections">
//                 {(e) => (
//                     <ElectionCard e={e}>
//                         <div className="text-[#C9F300] text-xs mt-1">{remainingLabel(e)}</div>
//                         <Link href={`/elections/${e._id}`} className="inline-block mt-2 px-3 py-1 rounded-lg bg-[#C9F300] text-black text-sm">
//                             Go vote →
//                         </Link>
//                     </ElectionCard>
//                 )}
//             </Section>

//             {/* Upcoming */}
//             <Section title="Upcoming Elections" items={grouped.upcoming} empty="No upcoming elections">
//                 {(e) => (
//                     <ElectionCard e={e}>
//                         <div className="text-[#A1A1A1] text-xs mt-1">{remainingLabel(e)}</div>
//                         <Link href={`/elections/${e._id}`} className="inline-block mt-2 px-3 py-1 rounded-lg bg-[#1F1F1F] border border-[#2A2A2A] text-[#EDEDED] text-sm">
//                             Preview →
//                         </Link>
//                     </ElectionCard>
//                 )}
//             </Section>

//             {/* Past */}
//             <Section title="Past Elections" items={grouped.past} empty="No past elections">
//                 {(e) => (
//                     <ElectionCard e={e}>
//                         <div className="text-[#A1A1A1] text-xs mt-1">{remainingLabel(e)}</div>
//                         <Link href={`/elections/${e._id}/results`} className="inline-block mt-2 px-3 py-1 rounded-lg bg-[#1F1F1F] border border-[#2A2A2A] text-[#EDEDED] text-sm">
//                             View Results →
//                         </Link>
//                     </ElectionCard>
//                 )}
//             </Section>
//         </div>
//     );
// }

// function Section({ title, items, empty, children }) {
//     return (
//         <section>
//             <h2 className="text-white font-semibold mb-2">{title}</h2>
//             {items.length === 0 ? (
//                 <div className="rounded-xl border border-[#2A2A2A] bg-[#171717] p-4 text-[#A1A1A1]">{empty}</div>
//             ) : (
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//                     {items.map((e) => <div key={e._id}>{children(e)}</div>)}
//                 </div>
//             )}
//         </section>
//     );
// }

// function ElectionCard({ e, children }) {
//     return (
//         <div className="rounded-xl border border-[#2A2A2A] p-4 bg-[#171717]">
//             <div className="text-white font-medium">{e.name}</div>
//             <div className="text-[#A1A1A1] text-sm capitalize">{e.type} • {e.ballotType}</div>
//             <div className="text-[#A1A1A1] text-xs mt-1">Start: {new Date(e.startAt).toLocaleString()}</div>
//             <div className="text-[#A1A1A1] text-xs">End: {new Date(e.endAt).toLocaleString()}</div>
//             {children}
//         </div>
//     );
// }

// /app/elections/page.jsx
'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

function sections(elections) {
  const now = Date.now();
  const up = [], on = [], past = [];
  for (const e of elections) {
    const s = Date.parse(e.startAt);
    const end = Date.parse(e.endAt);
    if (e.status === 'completed' || end < now) past.push(e);
    else if (s > now) up.push(e);
    else on.push(e);
  }
  up.sort((a, b) => Date.parse(a.startAt) - Date.parse(b.startAt));
  on.sort((a, b) => Date.parse(a.endAt) - Date.parse(b.endAt));
  past.sort((a, b) => Date.parse(b.endAt) - Date.parse(a.endAt));
  return { upcoming: up, ongoing: on, past };
}
function msToHhmm(ms) { if (ms <= 0) return '0m'; const mins = Math.floor(ms / 60000); const h = Math.floor(mins / 60); const m = mins % 60; return `${h ? `${h}h ` : ''}${m}m`; }
function remainingLabel(e) {
  const now = Date.now();
  const s = Date.parse(e.startAt);
  const end = Date.parse(e.endAt);
  if (now < s) return `Starts in ${msToHhmm(s - now)}`;
  if (now > end) return `Ended ${msToHhmm(now - end)} ago`;
  return `${msToHhmm(end - now)} left`;
}

export default function VoterElections() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const r = await fetch('/api/elections?includePast=1', { cache: 'no-store', credentials: 'include' });
      const j = await r.json();
      if (j.ok) setList(j.data || []);
      setLoading(false);
    })();
  }, []);

  const grouped = useMemo(() => sections(list), [list]);

  if (loading) return <div className="text-[#A1A1A1]">Loading…</div>;

  return (
    <div className="space-y-8">
      <h1 className="text-white text-xl font-semibold">Elections</h1>

      <Section title="Ongoing Elections" items={grouped.ongoing} empty="No ongoing elections">
        {(e) => (
          <ElectionCard e={e}>
            <div className="text-[#C9F300] text-xs mt-1">{remainingLabel(e)}</div>
            <Link href={`/elections/${e._id}`} className="inline-block mt-2 px-3 py-1 rounded-lg bg-[#C9F300] text-black text-sm">
              Go vote →
            </Link>
          </ElectionCard>
        )}
      </Section>

      <Section title="Upcoming Elections" items={grouped.upcoming} empty="No upcoming elections">
        {(e) => (
          <ElectionCard e={e}>
            <div className="text-[#A1A1A1] text-xs mt-1">{remainingLabel(e)}</div>
            <Link href={`/elections/${e._id}`} className="inline-block mt-2 px-3 py-1 rounded-lg bg-[#1F1F1F] border border-[#2A2A2A] text-[#EDEDED] text-sm">
              Preview →
            </Link>
          </ElectionCard>
        )}
      </Section>

      <Section title="Past Elections" items={grouped.past} empty="No past elections">
        {(e) => (
          <ElectionCard e={e}>
            <div className="text-[#A1A1A1] text-xs mt-1">{remainingLabel(e)}</div>
            <Link href={`/elections/${e._id}/results`} className="inline-block mt-2 px-3 py-1 rounded-lg bg-[#1F1F1F] border border-[#2A2A2A] text-[#EDEDED] text-sm">
              View Results →
            </Link>
          </ElectionCard>
        )}
      </Section>
    </div>
  );
}

function Section({ title, items, empty, children }) {
  return (
    <section>
      <h2 className="text-white font-semibold mb-2">{title}</h2>
      {items.length === 0 ? (
        <div className="rounded-xl border border-[#2A2A2A] bg-[#171717] p-4 text-[#A1A1A1]">{empty}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {items.map((e) => <div key={e._id}>{children(e)}</div>)}
        </div>
      )}
    </section>
  );
}

function ElectionCard({ e, children }) {
  return (
    <div className="rounded-xl border border-[#2A2A2A] p-4 bg-[#171717]">
      <div className="text-white font-medium">{e.name}</div>
      <div className="text-[#A1A1A1] text-sm capitalize">{e.type} • {e.ballotType}</div>
      <div className="text-[#A1A1A1] text-xs mt-1">Start: {new Date(e.startAt).toLocaleString()}</div>
      <div className="text-[#A1A1A1] text-xs">End: {new Date(e.endAt).toLocaleString()}</div>
      {children}
    </div>
  );
}
