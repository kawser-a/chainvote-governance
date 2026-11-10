// /app/components/LiveElectionWidget.jsx
'use client';
import useSWR from 'swr';

const fetcher = (url)=>fetch(url,{cache:'no-store'}).then(r=>r.json());

export default function LiveElectionWidget({ electionId }) {
  const { data } = useSWR(`/api/elections/${electionId}/live`, fetcher, { refreshInterval: 5000 });
  if (!data?.ok) return null;

  if (data.ballotType === 'manifesto' || data.ballotType === 'candidate') {
    return (
      <div className="space-y-2">
        {(data.data || []).map((x) => (
          <div key={(x.manifestoId||x.candidateId)} className="flex items-center justify-between p-2 rounded-lg bg-[#1F1F1F] border border-[#2A2A2A]">
            <div className="text-[#EDEDED]">
              <div className="font-medium">{x.title}</div>
              {x.seat && <div className="text-xs text-[#A1A1A1]">{x.seat}</div>}
            </div>
            <div className="text-[#C9F300] font-semibold">{x.votes}</div>
          </div>
        ))}
      </div>
    );
  }

  // proposals
  return (
    <div className="space-y-3">
      {(data.data || []).map((p) => (
        <div key={p.ballotItemId} className="rounded-xl border border-[#2A2A2A] p-3">
          <div className="text-white font-medium">{p.title}</div>
          {p.reason && <div className="text-xs text-[#A1A1A1]">Reason: {p.reason}</div>}
          <div className="mt-2 space-y-1">
            {p.options.map(o => (
              <div key={o.key} className="flex items-center justify-between">
                <span className="text-[#EDEDED]">{o.label}</span>
                <span className="text-[#C9F300] font-semibold">{o.votes}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
