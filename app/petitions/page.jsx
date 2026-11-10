'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FileWarning } from 'lucide-react';
import { Alert, Button, ButtonLink, Card, EmptyState, Loading, PageHeader, StatusBadge } from '../components/ui/primitives';
import { DataTable } from '../components/ui/interactive';
import { formatDate } from '../components/ui/format';

const STATUS_HELP = [
    ['open', 'Waiting for the election office to look at it.'],
    ['under_review', 'The election office is checking the facts.'],
    ['accepted', 'The office agreed the commitment wasn’t met.'],
    ['rejected', 'The office decided the commitment was met.'],
    ['dismissed', 'Closed without a decision, for example a duplicate.'],
];

export default function MyPetitions() {
    const [list, setList] = useState([]);
    const [state, setState] = useState('loading');

    async function load() {
        setState('loading');
        try {
            const r = await fetch('/api/petitions', { cache: 'no-store', credentials: 'include' });
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
            <PageHeader
                title="My petitions"
                description="Petitions you’ve filed about commitments that weren’t delivered, and where each one stands."
            />

            {state === 'loading' && <Loading label="Loading petitions…" />}
            {state === 'error' && (
                <Alert tone="danger" title="We couldn’t load your petitions" action={<Button variant="secondary" size="sm" onClick={load}>Try again</Button>}>
                    Check your connection and try again.
                </Alert>
            )}

            {state === 'ready' && (
                <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_18rem]">
                    <Card className="min-w-0">
                        <DataTable
                            caption="Your petitions"
                            rows={list}
                            empty={
                                <EmptyState
                                    icon={FileWarning}
                                    title="You haven’t filed any petitions"
                                    action={<ButtonLink href="/elections" variant="secondary">See past elections</ButtonLink>}
                                >
                                    When an elected candidate misses a deadline, you can file a petition from that election’s results page.
                                </EmptyState>
                            }
                            columns={[
                                {
                                    key: 'commitment',
                                    header: 'Commitment',
                                    primary: true,
                                    cell: (p) => (
                                        <div className="min-w-0">
                                            <p className="font-medium text-ink">{p.manifestoTitle || 'Commitment'}</p>
                                            <p className="text-sm font-normal text-ink-3">{p.candidateName || '—'}</p>
                                        </div>
                                    ),
                                },
                                {
                                    key: 'election',
                                    header: 'Election',
                                    cell: (p) =>
                                        p.electionId ? (
                                            <Link href={`/elections/${p.electionId}/results`} className="text-brand underline hover:text-brand-hover">
                                                {p.electionName || 'View election'}
                                            </Link>
                                        ) : '—',
                                },
                                { key: 'reason', header: 'Your reason', wide: true, cell: (p) => <span className="text-ink-2">{p.reason || '—'}</span> },
                                { key: 'filed', header: 'Filed', nowrap: true, cell: (p) => formatDate(p.createdAt) },
                                { key: 'status', header: 'Status', cell: (p) => <StatusBadge status={p.status} /> },
                            ]}
                        />
                    </Card>

                    <Card as="aside" className="h-fit p-4 sm:p-5">
                        <h2 className="text-sm font-semibold text-ink">What the statuses mean</h2>
                        <dl className="mt-3 space-y-3">
                            {STATUS_HELP.map(([s, d]) => (
                                <div key={s}>
                                    <dt><StatusBadge status={s} /></dt>
                                    <dd className="mt-1 text-sm text-ink-2">{d}</dd>
                                </div>
                            ))}
                        </dl>
                    </Card>
                </div>
            )}
        </>
    );
}
