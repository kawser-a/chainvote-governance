'use client';
import useSWR from 'swr';

const fetcher = (url) => fetch(url, { cache: 'no-store' }).then((r) => r.json());

// Live vote counts for an open election, refreshed every 5 seconds.
export default function LiveElectionWidget({ electionId }) {
    const { data, error } = useSWR(`/api/elections/${electionId}/live`, fetcher, { refreshInterval: 5000 });

    if (error) return <p className="text-sm text-danger">Live counts are unavailable right now.</p>;
    if (!data) return <p className="text-sm text-ink-3" role="status">Loading live count…</p>;
    if (!data.ok) return <p className="text-sm text-ink-3">No live count available.</p>;

    const rows = data.data || [];
    if (rows.length === 0) return <p className="text-sm text-ink-3">No votes yet.</p>;

    if (data.ballotType === 'manifesto' || data.ballotType === 'candidate') {
        const max = Math.max(1, ...rows.map((x) => x.votes || 0));
        return (
            <ul className="space-y-3" aria-live="polite">
                {rows.map((x) => (
                    <li key={x.manifestoId || x.candidateId}>
                        <div className="flex items-baseline justify-between gap-3 text-sm">
                            <span className="min-w-0 font-medium text-ink">{x.title}{x.seat && <span className="font-normal text-ink-3"> · {x.seat}</span>}</span>
                            <span className="shrink-0 font-semibold tabular-nums text-ink">{x.votes}</span>
                        </div>
                        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-subtle" aria-hidden="true">
                            <div className="h-full rounded-full bg-brand" style={{ width: `${((x.votes || 0) / max) * 100}%` }} />
                        </div>
                    </li>
                ))}
            </ul>
        );
    }

    return (
        <div className="space-y-4" aria-live="polite">
            {rows.map((p) => (
                <div key={p.ballotItemId}>
                    <p className="text-sm font-medium text-ink">{p.title}</p>
                    <ul className="mt-1 space-y-1 text-sm">
                        {(p.options || []).map((o) => (
                            <li key={o.key} className="flex justify-between gap-3">
                                <span className="text-ink-2">{o.label}</span>
                                <span className="font-semibold tabular-nums text-ink">{o.votes}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
}
