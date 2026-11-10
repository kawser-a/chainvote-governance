// /app/admin/results/page.jsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AdminResults() {
  const [list, setList] = useState([]);

  useEffect(() => {
    (async () => {
      const r = await fetch('/api/admin/elections?status=completed', { credentials: 'include', cache: 'no-store' });
      const j = await r.json();
      if (j.ok) setList(j.data || []);
    })();
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-white text-xl font-semibold">Past Election Results</h1>
      {list.length === 0 ? (
        <div className="rounded-xl border border-[#2A2A2A] bg-[#171717] p-4 text-[#A1A1A1]">No completed elections.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {list.map(e => (
            <div key={e._id} className="rounded-xl border border-[#2A2A2A] bg-[#171717] p-4">
              <div className="text-white font-medium">{e.name}</div>
              <div className="text-[#A1A1A1] text-sm">{e.type} • {e.ballotType}</div>
              <div className="text-[#A1A1A1] text-xs mt-1">End: {new Date(e.endAt).toLocaleString()}</div>
              <Link href={`/admin/elections/${e._id}/results`} className="inline-block mt-2 px-3 py-1 rounded-lg bg-[#1F1F1F] border border-[#2A2A2A] text-white text-sm">
                View Results →
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
