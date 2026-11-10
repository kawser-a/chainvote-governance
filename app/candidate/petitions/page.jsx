'use client';
import { useCallback, useEffect, useState } from 'react';
import { FileWarning } from 'lucide-react';
import { Alert, Button, Card, EmptyState, Loading, PageHeader, StatusBadge } from '../../components/ui/primitives';
import { DataTable, Segmented } from '../../components/ui/interactive';
import { formatDate } from '../../components/ui/format';

const FILTERS = [
    { value: 'open', label: 'Open' },
    { value: 'under_review', label: 'Under review' },
    { value: 'accepted', label: 'Accepted' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'all', label: 'All' },
];

export default function CandidatePetitions() {
    const [status, setStatus] = useState('open');
    const [items, setItems] = useState([]);
    const [state, setState] = useState('loading');

    const load = useCallback(async () => {
        setState('loading');
        try {
            const r = await fetch(`/api/candidate/petitions?status=${status}`, { cache: 'no-store' });
            const j = await r.json();
            if (!j.ok) throw new Error();
            setItems(j.items || []);
            setState('ready');
        } catch {
            setState('error');
        }
    }, [status]);

    useEffect(() => {
        load();
    }, [load]);

    return (
        <>
            <PageHeader
                title="Petitions"
                description="Voters can petition when they believe one of your commitments wasn’t delivered by its deadline. The election office reviews each one."
            />

            <Segmented label="Filter by status" value={status} onChange={setStatus} options={FILTERS} className="mb-4" />

            <Card>
                {state === 'loading' && <div className="p-4 sm:p-6"><Loading rows={2} label="Loading petitions…" /></div>}
                {state === 'error' && (
                    <div className="p-4 sm:p-6">
                        <Alert tone="danger" action={<Button variant="secondary" size="sm" onClick={load}>Try again</Button>}>We couldn’t load petitions.</Alert>
                    </div>
                )}
                {state === 'ready' && (
                    <DataTable
                        caption="Petitions about your commitments"
                        rows={items}
                        empty={
                            <EmptyState icon={FileWarning} title={status === 'all' ? 'No petitions' : `No ${FILTERS.find((f) => f.value === status)?.label.toLowerCase()} petitions`}>
                                {status === 'open' ? 'Nobody has an open petition about your commitments.' : 'Try a different filter.'}
                            </EmptyState>
                        }
                        columns={[
                            { key: 'm', header: 'Commitment', primary: true, cell: (p) => <span className="font-medium text-ink">{p.manifesto?.title || '—'}</span> },
                            { key: 'e', header: 'Election', cell: (p) => p.election?.name || '—' },
                            { key: 'r', header: 'Voter’s reason', wide: true, cell: (p) => <span className="text-ink-2">{p.reason || 'No reason given'}</span> },
                            { key: 'd', header: 'Filed', nowrap: true, cell: (p) => formatDate(p.createdAt) },
                            { key: 's', header: 'Status', cell: (p) => <StatusBadge status={p.status} /> },
                        ]}
                    />
                )}
            </Card>
            <p className="mt-4 text-sm text-ink-3">To protect voters, petitions don’t show who filed them.</p>
        </>
    );
}
