'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Vote } from 'lucide-react';
import { Alert, Button, Card, EmptyState, Loading, PageHeader, StatusBadge } from '../components/ui/primitives';
import { Segmented } from '../components/ui/interactive';
import { electionPhase, formatDateTime, phaseLabel, titleCase } from '../components/ui/format';

function group(list) {
    const now = Date.now();
    const out = { open: [], upcoming: [], past: [] };
    for (const e of list) {
        const p = electionPhase(e, now);
        if (p === 'active' || p === 'paused') out.open.push(e);
        else if (p === 'upcoming') out.upcoming.push(e);
        else out.past.push(e);
    }
    out.open.sort((a, b) => Date.parse(a.endAt) - Date.parse(b.endAt));
    out.upcoming.sort((a, b) => Date.parse(a.startAt) - Date.parse(b.startAt));
    out.past.sort((a, b) => Date.parse(b.endAt) - Date.parse(a.endAt));
    return out;
}

const EMPTY = {
    open: ['No elections are open', 'When voting opens in an election you’re eligible for, it will appear here.'],
    upcoming: ['Nothing scheduled', 'There are no upcoming elections for your constituency yet.'],
    past: ['No past elections', 'Elections from the last 12 months will appear here once they end.'],
};

export default function VoterElections() {
    const [list, setList] = useState([]);
    const [state, setState] = useState('loading');
    const [tab, setTab] = useState(null);

    async function load() {
        setState('loading');
        try {
            const r = await fetch('/api/elections?includePast=1', { cache: 'no-store', credentials: 'include' });
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

    const grouped = useMemo(() => group(list), [list]);
    const active = tab || (grouped.open.length ? 'open' : grouped.upcoming.length ? 'upcoming' : grouped.past.length ? 'past' : 'open');
    const rows = grouped[active];

    return (
        <>
            <PageHeader title="Elections" description="Elections you’re eligible to vote in, based on your constituency." />

            {state === 'loading' && <Loading label="Loading elections…" />}

            {state === 'error' && (
                <Alert tone="danger" title="We couldn’t load your elections" action={<Button variant="secondary" size="sm" onClick={load}>Try again</Button>}>
                    Check your connection. If you were away for a while, you may need to sign in again.
                </Alert>
            )}

            {state === 'ready' && (
                <>
                    <Segmented
                        label="Filter elections"
                        value={active}
                        onChange={setTab}
                        className="mb-4"
                        options={[
                            { value: 'open', label: 'Open now', count: grouped.open.length },
                            { value: 'upcoming', label: 'Upcoming', count: grouped.upcoming.length },
                            { value: 'past', label: 'Past', count: grouped.past.length },
                        ]}
                    />
                    <Card>
                        {rows.length === 0 ? (
                            <EmptyState icon={Vote} title={EMPTY[active][0]}>{EMPTY[active][1]}</EmptyState>
                        ) : (
                            <ul className="divide-y divide-line">
                                {rows.map((e) => {
                                    const phase = electionPhase(e);
                                    const href = phase === 'ended' ? `/elections/${e._id}/results` : `/elections/${e._id}`;
                                    const action = phase === 'active' ? 'Vote' : phase === 'ended' ? 'See results' : 'Preview ballot';
                                    return (
                                        <li key={e._id}>
                                            <Link href={href} className="group flex items-center gap-4 px-4 py-4 hover:bg-subtle/60 sm:px-6">
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <p className="font-semibold text-ink group-hover:underline">{e.name}</p>
                                                        <StatusBadge status={phase} />
                                                    </div>
                                                    <p className="mt-1 text-sm text-ink-2">
                                                        {phaseLabel(e)} · {titleCase(e.type)} · {titleCase(e.ballotType)} ballot
                                                    </p>
                                                    <p className="mt-0.5 text-sm text-ink-3">
                                                        {formatDateTime(e.startAt)} to {formatDateTime(e.endAt)}
                                                    </p>
                                                </div>
                                                <span className="hidden shrink-0 text-sm font-semibold text-brand sm:inline">{action}</span>
                                                <ChevronRight className="h-5 w-5 shrink-0 text-ink-3" aria-hidden="true" />
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </Card>
                </>
            )}
        </>
    );
}
