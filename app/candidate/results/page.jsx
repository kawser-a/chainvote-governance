// /app/candidate/results/page.jsx
'use client';

import { useEffect, useState } from 'react';

export default function CandidateResultsPage() {
  const [items, setItems] = useState([]);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch('/api/candidate/results', { cache: 'no-store' });
        const j = await r.json();
        if (!j.ok) setMsg(j.error || 'Failed to load');
        else setItems(j.data || []);
      } catch {
        setMsg('Network error');
      }
    })();
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-white text-xl font-semibold">Past Election Results</h1>
      {!!msg && <div className="text-red-400 text-sm">{msg}</div>}
      {items.length === 0 ? (
        <div className="rounded-xl border border-[#2A2A2A] bg-[#171717] p-4 text-[#A1A1A1]">No past results.</div>
      ) : items.map((r, i) => (
        <div key={i} className="rounded-xl border border-[#2A2A2A] bg-[#171717] p-4">
          <div className="text-white font-medium">{r.election?.name}</div>
          <div className="text-[#A1A1A1] text-sm">Seat: {r.seat} • End: {new Date(r.election?.endAt).toLocaleString()}</div>
          <div className="text-[#C9F300] text-sm mt-1">{r.youWon ? 'You WON this seat' : 'You did not win this seat'}</div>
          <div className="mt-2 text-white font-medium">Your Manifesto Votes</div>
          <ul className="list-disc ml-5">
            {r.byManifesto.map((m, idx) => (
              <li key={idx} className="text-[#EDEDED] text-sm">{m.title} — <b className="text-[#C9F300]">{m.votes}</b></li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
