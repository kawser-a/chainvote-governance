'use client';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FileWarning } from 'lucide-react';
import { Alert, Button, Card, CardBody, CardHeader, EmptyState, Loading, PageHeader, StatusBadge } from '../../components/ui/primitives';
import { ConfirmDialog, Pagination, Segmented, useToast } from '../../components/ui/interactive';
import { formatDateTime } from '../../components/ui/format';

const TABS = [
    { value: 'open', label: 'Open' },
    { value: 'under_review', label: 'Under review' },
    { value: 'accepted', label: 'Accepted' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'dismissed', label: 'Dismissed' },
    { value: 'all', label: 'All' },
];

const DECISIONS = {
    accepted: {
        title: 'Accept this petition?',
        body: 'You agree the candidate didn’t keep this commitment. Accepted petitions count towards removing the candidate.',
        label: 'Accept petition',
        tone: 'primary',
        done: 'Petition accepted.',
    },
    rejected: {
        title: 'Reject this petition?',
        body: 'You found the commitment was kept, or the complaint isn’t supported. It won’t count against the candidate.',
        label: 'Reject petition',
        tone: 'danger',
        done: 'Petition rejected.',
    },
    dismissed: {
        title: 'Dismiss this petition?',
        body: 'Close it without a decision, for example because it’s a duplicate or off-topic. It won’t count against the candidate.',
        label: 'Dismiss petition',
        tone: 'danger',
        done: 'Petition dismissed.',
    },
};

const PER_PAGE = 10;
const maskNid = (nid) => (nid ? `•••• ${String(nid).slice(-4)}` : 'unknown');

function Threshold({ rows }) {
    if (!rows.length) return null;
    return (
        <Card className="mb-8">
            <CardHeader
                title="Accepted petitions by candidate"
                description={`A candidate can be removed once accepted petitions reach ${rows[0].thresholdPercent}% of enrolled voters in their seat.`}
            />
            <ul className="divide-y divide-line">
                {rows.map((r) => {
                    const pct = r.thresholdCount ? Math.min(100, Math.round((r.petitionCount / r.thresholdCount) * 100)) : 100;
                    return (
                        <li key={`${r.electionId}-${r.candidate._id}`} className="px-4 py-4 sm:px-6">
                            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                                <p className="font-medium text-ink">
                                    {r.candidate.name} <span className="font-normal text-ink-3">· {r.candidate.seat}</span>
                                </p>
                                <p className="text-sm tabular-nums text-ink-2">
                                    <span className="font-semibold text-ink">{r.petitionCount}</span> of {r.thresholdCount} needed
                                </p>
                            </div>
                            <div className="mt-2 h-2 overflow-hidden rounded-full bg-subtle" aria-hidden="true">
                                <div className={`h-full rounded-full ${r.canRemove ? 'bg-danger' : 'bg-warn'}`} style={{ width: `${pct}%` }} />
                            </div>
                            {r.candidate.removed ? (
                                <p className="mt-2 text-sm text-ink-3">Already removed from the race.</p>
                            ) : r.canRemove ? (
                                <p className="mt-2 text-sm text-ink">
                                    Threshold reached.{' '}
                                    <Link href="/admin/candidates" className="font-semibold text-brand underline hover:text-brand-hover">Review on the Candidates page</Link>
                                </p>
                            ) : null}
                        </li>
                    );
                })}
            </ul>
        </Card>
    );
}

function PetitionCard({ p, busy, onReview, onDecide }) {
    const closed = ['accepted', 'rejected', 'dismissed'].includes(p.status);
    return (
        <Card as="article">
            <CardBody>
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                        <h2 className="text-lg font-semibold text-ink">
                            {p.candidateName || 'Unknown candidate'}
                            {p.seat && <span className="font-normal text-ink-3"> · {p.seat}</span>}
                        </h2>
                        <p className="mt-1 text-sm text-ink-2 [overflow-wrap:anywhere]">
                            About “{p.manifestoTitle || 'a manifesto'}”{p.electionName ? ` · ${p.electionName}` : ''}
                        </p>
                    </div>
                    <StatusBadge status={p.status} />
                </div>

                <blockquote className="mt-4 border-l-4 border-line-strong pl-4 text-[15px] leading-relaxed text-ink whitespace-pre-line [overflow-wrap:anywhere]">
                    {p.reason || <span className="text-ink-3">No reason given.</span>}
                </blockquote>

                <p className="mt-3 text-sm text-ink-3">
                    From voter {maskNid(p.voterNid)} · {formatDateTime(p.createdAt)}
                </p>

                <div className="mt-5 flex flex-col-reverse gap-2 border-t border-line pt-4 sm:flex-row sm:flex-wrap sm:justify-end">
                    {closed ? (
                        <Button variant="secondary" onClick={onReview} loading={busy} loadingText="Reopening…">Reopen for review</Button>
                    ) : (
                        <>
                            <Button variant="ghost" onClick={() => onDecide('dismissed')} disabled={busy}>Dismiss</Button>
                            {p.status === 'open' && (
                                <Button variant="secondary" onClick={onReview} loading={busy} loadingText="Saving…">Mark as under review</Button>
                            )}
                            <Button variant="danger-outline" onClick={() => onDecide('rejected')} disabled={busy}>Reject</Button>
                            <Button onClick={() => onDecide('accepted')} disabled={busy}>Accept</Button>
                        </>
                    )}
                </div>
            </CardBody>
        </Card>
    );
}

export default function AdminPetitionsPage() {
    const { notify } = useToast();
    const [status, setStatus] = useState('open');
    const [rows, setRows] = useState([]);
    const [state, setState] = useState('loading');
    const [summary, setSummary] = useState([]);
    const [page, setPage] = useState(1);
    const [busyId, setBusyId] = useState(null);
    const [deciding, setDeciding] = useState(null); // { p, next }

    const load = useCallback(async () => {
        setState((s) => (s === 'ready' ? 'refreshing' : 'loading'));
        try {
            const q = status === 'all' ? '' : `?status=${status}`;
            const [r, s] = await Promise.all([
                fetch(`/api/admin/petitions${q}`, { cache: 'no-store' }).then((x) => x.json()),
                fetch('/api/admin/petitions/summary', { cache: 'no-store' }).then((x) => x.json()).catch(() => null),
            ]);
            if (!r.ok) throw new Error();
            setRows(r.data || []);
            setSummary(s?.ok ? s.data || [] : []);
            setState('ready');
        } catch {
            setState('error');
        }
    }, [status]);

    useEffect(() => {
        load();
    }, [load]);

    const pages = Math.max(1, Math.ceil(rows.length / PER_PAGE));
    const visible = useMemo(() => rows.slice((page - 1) * PER_PAGE, page * PER_PAGE), [rows, page]);

    async function patch(p, next) {
        const r = await fetch(`/api/admin/petitions/${p._id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: next }),
        });
        const j = await r.json();
        if (!j.ok) throw new Error(j.error || 'The change wasn’t saved.');
    }

    async function moveToReview(p) {
        setBusyId(p._id);
        const prev = p.status;
        try {
            await patch(p, 'under_review');
            notify(prev === 'open' ? 'Moved to Under review.' : 'Petition reopened. It’s in Under review.', {
                duration: 8000,
                action: { label: 'Undo', onClick: () => patch(p, prev).then(load).catch(() => {}) },
            });
            await load();
        } catch (err) {
            notify(err.message, { tone: 'danger' });
        } finally {
            setBusyId(null);
        }
    }

    async function confirmDecision() {
        const { p, next } = deciding;
        setBusyId(p._id);
        try {
            await patch(p, next);
            notify(DECISIONS[next].done);
            setDeciding(null);
            await load();
        } catch (err) {
            notify(err.message, { tone: 'danger' });
        } finally {
            setBusyId(null);
        }
    }

    const d = deciding && DECISIONS[deciding.next];
    const tabLabel = TABS.find((t) => t.value === status).label.toLowerCase();

    return (
        <>
            <PageHeader
                title="Petitions"
                description="Voters raise these when they think a candidate hasn’t kept a promise from their manifesto. Look into each one and record a decision."
            />

            <Threshold rows={summary} />

            <Segmented label="Show" value={status} onChange={(v) => { setPage(1); setStatus(v); }} options={TABS} className="mb-6" />

            {state === 'loading' && <Card><CardBody><Loading rows={3} label="Loading petitions…" /></CardBody></Card>}
            {state === 'error' && (
                <Alert tone="danger" action={<Button variant="secondary" size="sm" onClick={load}>Try again</Button>}>We couldn’t load petitions.</Alert>
            )}
            {(state === 'ready' || state === 'refreshing') && (
                rows.length === 0 ? (
                    <Card>
                        <EmptyState icon={FileWarning} title={status === 'open' ? 'No open petitions' : `No ${status === 'all' ? '' : `${tabLabel} `}petitions`}>
                            {status === 'open' ? 'When a voter raises a petition, it shows up here.' : null}
                        </EmptyState>
                    </Card>
                ) : (
                    <div className="space-y-4" aria-busy={state === 'refreshing'}>
                        {visible.map((p) => (
                            <PetitionCard
                                key={p._id}
                                p={p}
                                busy={busyId === p._id}
                                onReview={() => moveToReview(p)}
                                onDecide={(next) => setDeciding({ p, next })}
                            />
                        ))}
                        <Pagination page={page} pages={pages} total={rows.length} noun="petitions" onChange={setPage} />
                    </div>
                )
            )}

            <ConfirmDialog
                open={!!deciding}
                onCancel={() => setDeciding(null)}
                onConfirm={confirmDecision}
                loading={!!deciding && busyId === deciding.p._id}
                tone={d?.tone}
                title={d?.title}
                description={deciding ? `${deciding.p.candidateName || 'Candidate'} · “${deciding.p.manifestoTitle || 'manifesto'}”` : undefined}
                confirmLabel={d?.label}
            >
                <p className="text-[15px] text-ink-2">{d?.body} You can reopen it later if needed.</p>
            </ConfirmDialog>
        </>
    );
}
