'use client';
import { useEffect, useState } from 'react';
import { Vote } from 'lucide-react';
import { Alert, Button, Card, EmptyState, Loading, PageHeader, StatusBadge } from '../../components/ui/primitives';
import { electionPhase, formatDateTime, phaseLabel, titleCase } from '../../components/ui/format';

export default function CandidateElections() {
    const [list, setList] = useState([]);
    const [state, setState] = useState('loading');

    async function load() {
        setState('loading');
        try {
            const r = await fetch('/api/candidate/elections', { cache: 'no-store' });
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
            <PageHeader title="Elections" description="Upcoming and current elections for your seat." />
            {state === 'loading' && <Loading label="Loading elections…" />}
            {state === 'error' && (
                <Alert tone="danger" action={<Button variant="secondary" size="sm" onClick={load}>Try again</Button>}>We couldn’t load elections.</Alert>
            )}
            {state === 'ready' && (
                <Card>
                    {list.length === 0 ? (
                        <EmptyState icon={Vote} title="No upcoming elections">When the election office schedules an election for your seat, it will appear here.</EmptyState>
                    ) : (
                        <ul className="divide-y divide-line">
                            {list.map((e) => {
                                const phase = electionPhase(e);
                                const mine = (e.ballot || []).length;
                                return (
                                    <li key={e._id} className="px-4 py-4 sm:px-6">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <p className="font-semibold text-ink">{e.name}</p>
                                            <StatusBadge status={phase} />
                                        </div>
                                        <p className="mt-1 text-sm text-ink-2">
                                            {phaseLabel(e)} · {titleCase(e.type)} · {titleCase(e.ballotType)} ballot · {mine} item{mine === 1 ? '' : 's'} on the ballot
                                        </p>
                                        <p className="mt-0.5 text-sm text-ink-3">{formatDateTime(e.startAt)} to {formatDateTime(e.endAt)}</p>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </Card>
            )}
        </>
    );
}
