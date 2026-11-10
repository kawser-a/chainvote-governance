'use client';

import { useEffect, useState } from 'react';

export default function CandidateElections() {
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState('');

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const r = await fetch('/api/candidate/elections', { cache: 'no-store' });
                const j = await r.json();
                if (!j.ok) { setErr('Failed to load'); return; }
                setList(j.data || []);
            } catch {
                setErr('Network error');
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    return (
        <div className="space-y-4">
            <h1 className="text-white text-xl font-semibold">Elections Relevant to You</h1>
            {loading && <div className="text-[#A1A1A1]">Loading...</div>}
            {err && <div className="text-red-400 text-sm">{err}</div>}
            {!loading && !err && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {list.length === 0 ? (
                        <div className="text-[#A1A1A1]">No upcoming elections.</div>
                    ) : list.map((e) => (
                        <div key={e._id} className="rounded-2xl border border-[#232323] bg-[#171717] p-4">
                            <div className="text-white font-semibold">{e.name}</div>
                            <div className="text-[#A1A1A1] text-sm capitalize">
                                {e.type} • {e.eligibility?.scope || 'seat'}
                            </div>
                            <div className="text-[#A1A1A1] text-sm">Start: {new Date(e.startAt).toLocaleString()}</div>
                            <div className="text-[#A1A1A1] text-sm mb-2">End: {new Date(e.endAt).toLocaleString()}</div>
                            <div className="text-[#C9F300] text-sm">Ballot items: {e.ballot?.length || 0}</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
