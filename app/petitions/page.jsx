'use client';

import { useEffect, useState } from 'react';

export default function MyPetitions() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      setMsg('');
      try {
        const r = await fetch('/api/petitions', { cache: 'no-store', credentials: 'include' });
        const j = await r.json();
        if (!j.ok) setMsg(j.error || 'Failed to load petitions');
        else setList(j.data || []);
      } catch {
        setMsg('Network error');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="text-[#A1A1A1]">Loading…</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-white text-xl font-semibold">My Petitions</h1>
      {msg && <div className="text-sm text-red-400">{msg}</div>}
      <div className="rounded-2xl border border-[#232323] bg-[#171717] overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-[#1b1b1b] text-[#A1A1A1]">
            <tr>
              <th className="text-left px-4 py-3">Created</th>
              <th className="text-left px-4 py-3">Election</th>
              <th className="text-left px-4 py-3">Candidate</th>
              <th className="text-left px-4 py-3">Manifesto</th>
              <th className="text-left px-4 py-3">Reason</th>
              <th className="text-left px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-[#A1A1A1]">No petitions filed</td>
              </tr>
            ) : list.map(p => (
              <tr key={p._id} className="border-t border-[#232323]">
                <td className="px-4 py-3 text-[#EDEDED]">{new Date(p.createdAt).toLocaleString()}</td>
                <td className="px-4 py-3 text-[#EDEDED]">{String(p.electionId).slice(-6)}</td>
                <td className="px-4 py-3 text-[#EDEDED]">{String(p.candidateId).slice(-6)}</td>
                <td className="px-4 py-3 text-[#EDEDED]">{String(p.manifestoId).slice(-6)}</td>
                <td className="px-4 py-3 text-[#A1A1A1]">{p.reason || '—'}</td>
                <td className="px-4 py-3 capitalize text-[#C9F300]">{p.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
