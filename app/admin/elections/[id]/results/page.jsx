// /app/admin/elections/[id]/results/page.jsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AdminElectionResults({ params }) {
  const id = params?.id;
  const [data, setData] = useState(null);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!id) return;
    (async () => {
      const r = await fetch(`/api/elections/${id}/results`, { credentials: 'include', cache: 'no-store' });
      const j = await r.json();
      if (!j.ok) setMsg(j.error || 'Failed to load results');
      else setData(j);
    })();
  }, [id]);

  if (!data) return <div className="text-[#A1A1A1]">{msg || 'Loading...'}</div>;
  const e = data.election;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="text-white text-xl font-semibold">{e.name}</div>
        <Link href="/admin/results" className="px-3 py-1 rounded-lg bg-[#1F1F1F] border border-[#2A2A2A] text-white">← Back</Link>
      </div>

      {/* seat-wise, party-wise & manifesto table reuses same visual from voter results page */}
      <div className="text-[#C9F300] text-sm">Total Votes: {data.totalVotes}</div>
      {/* Seat-wise winners */}
      <div className="rounded-2xl border border-[#2A2A2A] bg-[#171717] p-4">
        <div className="text-white font-semibold mb-2">Seat-wise Winners</div>
        {data.seatWise.map((w, idx) => (
          <div key={idx} className="text-[#EDEDED] text-sm border-b border-[#2A2A2A] py-2">
            <b className="text-white">{w.seat}</b>: {w.candidateName} • {w.partyName || 'Unknown'} • Votes: {w.totalVotes}
          </div>
        ))}
      </div>
      {/* Party-wise */}
      <div className="rounded-2xl border border-[#2A2A2A] bg-[#171717] p-4">
        <div className="text-white font-semibold mb-2">Party-wise Totals</div>
        {data.byParty.map((p, i) => <div key={i} className="text-[#EDEDED]">{p.partyName}: {p.votes}</div>)}
      </div>
      {/* Manifesto-wise */}
      <div className="rounded-2xl border border-[#2A2A2A] bg-[#171717] p-4">
        <div className="text-white font-semibold mb-2">Manifesto-wise Votes</div>
        {(data.byManifesto || []).map((r, idx) => (
          <div key={idx} className="text-sm text-[#EDEDED] border-b border-[#2A2A2A] py-2">
            [{r.seat}] {r.candidateName} • {r.partyName} — <b className="text-white">{r.title}</b> → {r.votes}
          </div>
        ))}
      </div>
    </div>
  );
}
