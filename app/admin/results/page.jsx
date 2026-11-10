'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BarChart3, ChevronRight } from 'lucide-react';
import { Alert, Button, Card, EmptyState, Loading, PageHeader } from '../../components/ui/primitives';
import { formatDateTime, titleCase } from '../../components/ui/format';

export default function AdminResults() {
    const [list, setList] = useState([]);
    const [state, setState] = useState('loading');

    async function load() {
        setState('loading');
        try {
            const r = await fetch('/api/admin/elections?status=completed', { credentials: 'include', cache: 'no-store' });
            const j = await r.json();
            if (!j.ok) throw new Error();
            setList(j.data || []);
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
            <PageHeader title="Results" description="Final results for elections that have ended. Live counts for open elections are on the Elections page." />
            {state === 'loading' && <Loading label="Loading results…" />}
            {state === 'error' && <Alert tone="danger" action={<Button variant="secondary" size="sm" onClick={load}>Try again</Button>}>We couldn’t load completed elections.</Alert>}
            {state === 'ready' && (
                <Card>
                    {list.length === 0 ? (
                        <EmptyState icon={BarChart3} title="No completed elections yet">Results appear here once an election has ended.</EmptyState>
                    ) : (
                        <ul className="divide-y divide-line">
                            {list.map((e) => (
                                <li key={e._id}>
                                    <Link href={`/admin/elections/${e._id}/results`} className="group flex items-center gap-4 px-4 py-4 hover:bg-subtle/60 sm:px-6">
                                        <div className="min-w-0 flex-1">
                                            <p className="font-semibold text-ink group-hover:underline">{e.name}</p>
                                            <p className="mt-0.5 text-sm text-ink-3">{titleCase(e.type)} · {titleCase(e.ballotType)} ballot · ended {formatDateTime(e.endAt)}</p>
                                        </div>
                                        <span className="hidden text-sm font-semibold text-brand sm:inline">See results</span>
                                        <ChevronRight className="h-5 w-5 shrink-0 text-ink-3" aria-hidden="true" />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </Card>
            )}
        </>
    );
}
