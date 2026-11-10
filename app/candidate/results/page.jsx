'use client';
import { useEffect, useState } from 'react';
import { BarChart3 } from 'lucide-react';
import { Alert, Badge, Button, Card, CardHeader, EmptyState, Loading, PageHeader } from '../../components/ui/primitives';
import { formatDate } from '../../components/ui/format';

export default function CandidateResultsPage() {
    const [items, setItems] = useState([]);
    const [state, setState] = useState('loading');

    async function load() {
        setState('loading');
        try {
            const r = await fetch('/api/candidate/results', { cache: 'no-store' });
            const j = await r.json();
            if (!j.ok) throw new Error();
            setItems(j.data || []);
            setState('ready');
        } catch {
            setState('error');
        }
    }

    useEffect(() => {
        load();
    }, []);

    return (
        <>
            <PageHeader title="Results" description="Finished elections for your seat, and the votes each of your manifestos received." />
            {state === 'loading' && <Loading label="Loading results…" />}
            {state === 'error' && (
                <Alert tone="danger" action={<Button variant="secondary" size="sm" onClick={load}>Try again</Button>}>We couldn’t load results.</Alert>
            )}
            {state === 'ready' && items.length === 0 && (
                <Card><EmptyState icon={BarChart3} title="No results yet">Results appear here once an election you took part in has ended.</EmptyState></Card>
            )}
            {state === 'ready' && items.length > 0 && (
                <div className="space-y-6">
                    {items.map((r, i) => {
                        const total = (r.byManifesto || []).reduce((s, m) => s + (m.votes || 0), 0);
                        const max = Math.max(0, ...(r.byManifesto || []).map((m) => m.votes || 0));
                        return (
                            <Card key={r.election?._id || i}>
                                <CardHeader
                                    title={r.election?.name || 'Election'}
                                    description={`${r.seat} · ended ${formatDate(r.election?.endAt)} · ${total.toLocaleString()} votes for your manifestos`}
                                    action={r.youWon ? <Badge tone="success">You won this seat</Badge> : <Badge>Not elected</Badge>}
                                />
                                <ol className="divide-y divide-line">
                                    {(r.byManifesto || []).map((m, idx) => (
                                        <li key={m.manifestoId || idx} className="px-4 py-3 sm:px-6">
                                            <div className="flex items-baseline justify-between gap-3">
                                                <p className="font-medium text-ink">{m.title}</p>
                                                <p className="shrink-0 text-sm tabular-nums"><span className="font-semibold text-ink">{m.votes}</span><span className="text-ink-3"> votes</span></p>
                                            </div>
                                            <div className="mt-2 h-2 overflow-hidden rounded-full bg-subtle" aria-hidden="true">
                                                <div className="h-full rounded-full bg-brand" style={{ width: `${max ? Math.max(2, (m.votes / max) * 100) : 0}%` }} />
                                            </div>
                                        </li>
                                    ))}
                                </ol>
                            </Card>
                        );
                    })}
                </div>
            )}
        </>
    );
}
