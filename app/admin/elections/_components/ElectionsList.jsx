'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Check, ChevronDown, Vote } from 'lucide-react';
import { Alert, Badge, Button, Checkbox, DetailList, EmptyState, Field, Loading, Meter, StatusBadge, Textarea, cx } from '../../../components/ui/primitives';
import { ConfirmDialog, Dialog, Pagination, useToast } from '../../../components/ui/interactive';
import { electionPhase, formatDateTime, phaseLabel, titleCase } from '../../../components/ui/format';
import LiveElectionWidget from '../../../components/LiveElectionWidget';
import Countdown from '../../../components/motion/Countdown';
import { fmtElig, fmtLocation } from '../_lib/time';

/* Every state change is spelled out before it happens. */
const CONFIRM = {
    start: {
        title: 'Open voting now?',
        body: 'Voting opens immediately, before the scheduled start time. Eligible voters can start voting straight away.',
        label: 'Open voting',
        tone: 'primary',
        run: (a, e) => a.setStatusRow(e._id, 'active'),
        done: 'Voting is now open.',
    },
    complete: {
        title: 'End this election?',
        body: 'Voting closes immediately and results are final. This can’t be undone.',
        label: 'End election',
        tone: 'danger',
        run: (a, e) => a.setStatusRow(e._id, 'completed'),
        done: 'Election ended. Results are final.',
    },
    resume: {
        title: 'Resume voting?',
        body: 'Voters will be able to vote again straight away.',
        label: 'Resume voting',
        tone: 'primary',
        run: (a, e) => a.resume(e._id),
        done: 'Voting has resumed.',
    },
    rebuild: {
        title: 'Rebuild the ballot?',
        body: 'The ballot is replaced with every currently approved manifesto for these seats. Votes already cast are kept.',
        label: 'Rebuild ballot',
        tone: 'primary',
        run: (a, e) => a.rebuildBallot(e._id),
        done: 'Ballot rebuilt from approved manifestos.',
    },
};

const PAUSE_REASONS = [
    'Checking a problem with the voter roll.',
    'Fixing an error on the ballot.',
    'Technical issue, back shortly.',
];

/* Upcoming → Voting open → Ended, with the current stage highlighted. */
function Lifecycle({ e }) {
    const phase = electionPhase(e);
    const idx = phase === 'upcoming' ? 0 : phase === 'ended' ? 2 : 1;
    const stages = ['Upcoming', phase === 'paused' ? 'Paused' : 'Voting open', 'Ended'];
    return (
        <ol className="flex items-center gap-1.5 text-xs" aria-label="Election stage">
            {stages.map((s, i) => (
                <li key={s} className="flex items-center gap-1.5" aria-current={i === idx ? 'step' : undefined}>
                    <span
                        className={cx(
                            'flex h-5 w-5 items-center justify-center rounded-full border',
                            i < idx && 'border-brand bg-brand text-on-brand',
                            i === idx && (phase === 'paused' ? 'border-warn bg-warn-soft' : 'border-brand bg-brand-soft'),
                            i > idx && 'border-line-strong'
                        )}
                    >
                        {i < idx ? <Check className="h-3 w-3" strokeWidth={3} aria-hidden="true" /> : i === idx && <span className={cx('h-1.5 w-1.5 rounded-full', phase === 'paused' ? 'bg-warn' : 'bg-brand', phase === 'active' && 'animate-pulse-ring')} />}
                    </span>
                    <span className={cx(i === idx ? 'font-semibold text-ink' : 'text-ink-3')}>{s}</span>
                    {i < 2 && <span className={cx('h-px w-4 sm:w-6', i < idx ? 'bg-brand' : 'bg-line-strong')} aria-hidden="true" />}
                </li>
            ))}
        </ol>
    );
}

function ElectionItem({ e, onAsk, onPause, onAddCandidates }) {
    const [open, setOpen] = useState(false);
    const phase = electionPhase(e);
    const scope = e.eligibility?.scope || 'seat';
    const seats = (e.eligibility?.seats?.length ? e.eligibility.seats : e.seats) || [];
    const items = e.ballot?.length || 0;
    const start = Date.parse(e.startAt);
    const end = Date.parse(e.endAt);
    const elapsed = phase === 'active' || phase === 'paused' ? Math.min(100, Math.max(0, ((Date.now() - start) / (end - start)) * 100)) : 0;

    return (
        <li className="px-4 py-5 transition-colors hover:bg-raised/50 sm:px-6">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <p className="text-[17px] font-semibold text-ink">{e.name}</p>
                        <StatusBadge status={e.status === 'draft' || e.status === 'archived' ? e.status : phase} />
                        {items === 0 && <Badge tone="warning">Empty ballot</Badge>}
                    </div>
                    <div className="mt-2.5"><Lifecycle e={e} /></div>
                    <p className="mt-1 text-sm text-ink-2">
                        {phase === 'active' || phase === 'upcoming' ? '' : `${phaseLabel(e)} · `}{titleCase(e.type)} · {titleCase(e.ballotType)} ballot · {items} item{items === 1 ? '' : 's'}
                        {seats.length > 0 && <> · {seats.join(', ')}</>}
                    </p>
                    <p className="mt-0.5 text-sm text-ink-3">{formatDateTime(e.startAt)} to {formatDateTime(e.endAt)}</p>
                    {e.status === 'paused' && e.pauseReason && <p className="mt-1 text-sm text-accent-ink">Paused: {e.pauseReason}</p>}
                    {phase === 'active' && (
                        <div className="mt-3 max-w-md">
                            <Meter value={elapsed} max={100} tone="accent" label="Share of the voting window used" className="h-1.5" />
                            <Countdown to={e.endAt} className="mt-1.5 block text-xs" />
                        </div>
                    )}
                    {phase === 'upcoming' && <Countdown to={e.startAt} prefix="Opens in" endedText="Opening now" className="mt-2 block text-xs" />}
                </div>

                <div className="flex shrink-0 flex-wrap gap-2">
                    {e.status === 'scheduled' && <Button size="sm" onClick={() => onAsk('start', e)}>Open voting now</Button>}
                    {e.status === 'active' && (
                        <>
                            <Button size="sm" variant="secondary" onClick={() => onPause(e)}>Pause</Button>
                            <Button size="sm" variant="danger-outline" onClick={() => onAsk('complete', e)}>End election</Button>
                        </>
                    )}
                    {e.status === 'paused' && <Button size="sm" onClick={() => onAsk('resume', e)}>Resume</Button>}
                    {e.status === 'completed' && (
                        <Link href={`/admin/elections/${e._id}/results`} className="inline-flex min-h-9 pointer-coarse:min-h-11 items-center rounded-lg border border-line-strong bg-raised px-3 text-sm font-semibold text-ink transition-colors hover:bg-subtle">
                            See results
                        </Link>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
                        Details <ChevronDown className={cx('h-4 w-4 transition-transform', open && 'rotate-180')} aria-hidden="true" />
                    </Button>
                </div>
            </div>

            {open && (
                <div className="mt-4 grid animate-fade gap-4 lg:grid-cols-2">
                    <div className="rounded-xl border border-line bg-canvas p-4">
                        <p className="mb-3 text-sm font-semibold text-ink">Settings</p>
                        <DetailList
                            items={[
                                ['Choices per voter', e.multiSelect ? 'Several' : 'One'],
                                ['Who can vote', fmtElig(e.eligibility)],
                                ['Position', e.level ? titleCase(e.level) : null],
                                ['Location', fmtLocation(e.location)],
                                ['Scope', titleCase(scope)],
                                e.status === 'paused' ? ['Paused at', formatDateTime(e.pausedAt)] : null,
                            ].filter((x) => x && x[1])}
                        />
                        <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-4">
                            {e.ballotType === 'manifesto' && scope === 'seat' && (
                                <Button size="sm" variant="secondary" onClick={() => onAsk('rebuild', e)}>Rebuild ballot</Button>
                            )}
                            {e.ballotType === 'candidate' && (
                                <Button size="sm" variant="secondary" onClick={() => onAddCandidates(e)}>Add candidates</Button>
                            )}
                        </div>
                    </div>
                    <div className="rounded-xl border border-line bg-canvas p-4">
                        <p className="mb-3 text-sm font-semibold text-ink">Live count</p>
                        {e.status === 'active' ? (
                            <LiveElectionWidget electionId={e._id} />
                        ) : (
                            <p className="text-sm text-ink-3">{e.status === 'paused' ? 'Voting is paused.' : 'Shown while voting is open.'}</p>
                        )}
                    </div>
                    <div className="rounded-xl border border-line bg-canvas p-4 lg:col-span-2">
                        <p className="mb-3 text-sm font-semibold text-ink">On the ballot</p>
                        {items === 0 ? (
                            <p className="text-sm text-ink-3">Nothing yet.</p>
                        ) : (
                            <ul className="grid gap-2 sm:grid-cols-2">
                                {e.ballot.map((b) => (
                                    <li key={b._id} className="rounded-lg border border-line bg-surface px-3 py-2 text-sm">
                                        <p className="font-medium text-ink">{b.proposal?.title || b.title || 'Ballot item'}</p>
                                        {b.seat && <p className="text-ink-3">{b.seat}</p>}
                                        {b.proposal?.options?.length > 0 && <p className="text-ink-3">{b.proposal.options.map((o) => o.label).join(' · ')}</p>}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            )}
        </li>
    );
}

export default function ElectionsList({ list, loading, page, totalPages, onPage, actions }) {
    const { notify } = useToast();
    const [ask, setAsk] = useState(null);             // { kind, e }
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [pausing, setPausing] = useState(null);
    const [reason, setReason] = useState('');
    const [adding, setAdding] = useState(null);
    const [candidates, setCandidates] = useState([]);
    const [picked, setPicked] = useState(new Set());

    useEffect(() => {
        if (!adding) return;
        setPicked(new Set());
        const seats = (adding.eligibility?.seats?.length ? adding.eligibility.seats : adding.seats) || [];
        fetch('/api/admin/candidates', { credentials: 'include', cache: 'no-store' })
            .then((r) => r.json())
            .then((j) => {
                const onBallot = new Set((adding.ballot || []).map((b) => String(b.candidateId)));
                const all = (j.data || []).filter((c) => c.approved && !c.removed && !onBallot.has(String(c._id)));
                setCandidates(seats.length ? all.filter((c) => seats.map((s) => s.toLowerCase()).includes(String(c.seat).toLowerCase())) : all);
            })
            .catch(() => setCandidates([]));
    }, [adding]);

    async function run(fn, done) {
        setBusy(true);
        setError('');
        try {
            await fn();
            notify(done);
            return true;
        } catch (err) {
            setError(err.message || 'That didn’t work. Please try again.');
            return false;
        } finally {
            setBusy(false);
        }
    }

    const cfg = ask && CONFIRM[ask.kind];

    if (loading) return <div className="p-4 sm:p-6"><Loading label="Loading elections…" /></div>;

    return (
        <>
            {list.length === 0 ? (
                <EmptyState icon={Vote} title="No elections here">Try another filter, or set up a new election.</EmptyState>
            ) : (
                <ul className="divide-y divide-line">
                    {list.map((e) => (
                        <ElectionItem
                            key={e._id}
                            e={e}
                            onAsk={(kind, el) => { setError(''); setAsk({ kind, e: el }); }}
                            onPause={(el) => { setError(''); setReason(''); setPausing(el); }}
                            onAddCandidates={(el) => { setError(''); setAdding(el); }}
                        />
                    ))}
                </ul>
            )}
            {totalPages > 1 && (
                <div className="border-t border-line px-4 py-4 sm:px-6">
                    <Pagination page={page} pages={totalPages} onChange={onPage} noun="elections" />
                </div>
            )}

            <ConfirmDialog
                open={!!ask}
                onCancel={() => setAsk(null)}
                onConfirm={async () => { if (await run(() => cfg.run(actions, ask.e), cfg.done)) setAsk(null); }}
                loading={busy}
                title={cfg?.title}
                description={ask?.e?.name}
                confirmLabel={cfg?.label}
                tone={cfg?.tone}
            >
                <p className="text-[15px] text-ink-2">{cfg?.body}</p>
                {ask?.kind === 'start' && !(ask.e.ballot?.length) && (
                    <Alert tone="warning" className="mt-4" title="This ballot is empty">
                        Voters will have nothing to choose. Add candidates or rebuild the ballot first.
                    </Alert>
                )}
                {error && <Alert tone="danger" className="mt-4">{error}</Alert>}
            </ConfirmDialog>

            <Dialog
                open={!!pausing}
                onClose={() => !busy && setPausing(null)}
                title="Pause voting?"
                description={pausing?.name}
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setPausing(null)} disabled={busy}>Cancel</Button>
                        <Button onClick={async () => { if (await run(() => actions.pause(pausing._id, reason.trim()), 'Voting paused. Voters see your reason.')) setPausing(null); }} loading={busy}>
                            Pause voting
                        </Button>
                    </>
                }
            >
                <p className="mb-4 text-[15px] text-ink-2">Voters can’t vote until you resume. Votes already cast are kept.</p>
                <Field id="pause-reason" label="Reason shown to voters" optional hint="Pick one or write your own.">
                    <div className="mb-2 flex flex-wrap gap-2">
                        {PAUSE_REASONS.map((r) => (
                            <button
                                key={r}
                                type="button"
                                onClick={() => setReason(r)}
                                className={cx(
                                    'min-h-9 pointer-coarse:min-h-11 rounded-full border px-3 text-left text-sm transition-colors',
                                    reason === r ? 'border-brand bg-brand-soft text-brand-ink' : 'border-line-strong text-ink-2 hover:text-ink'
                                )}
                            >
                                {r}
                            </button>
                        ))}
                    </div>
                    <Textarea id="pause-reason" hint rows={3} maxLength={500} value={reason} onChange={(ev) => setReason(ev.target.value)} />
                </Field>
                {error && <Alert tone="danger" className="mt-4">{error}</Alert>}
            </Dialog>

            <Dialog
                open={!!adding}
                onClose={() => !busy && setAdding(null)}
                title="Add candidates to the ballot"
                description={adding?.name}
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setAdding(null)} disabled={busy}>Cancel</Button>
                        <Button
                            disabled={picked.size === 0}
                            loading={busy}
                            onClick={async () => { if (await run(() => actions.addCandidates(adding._id, [...picked].join(',')), `${picked.size} candidate${picked.size === 1 ? '' : 's'} added.`)) setAdding(null); }}
                        >
                            Add {picked.size || ''} to ballot
                        </Button>
                    </>
                }
            >
                {candidates.length === 0 ? (
                    <p className="text-[15px] text-ink-2">No approved candidates are left to add for this election’s seats.</p>
                ) : (
                    <div className="divide-y divide-line rounded-md border border-line">
                        {candidates.map((c) => (
                            <Checkbox
                                key={c._id}
                                id={`add-${c._id}`}
                                className="px-3"
                                label={c.name}
                                description={`${c.seat} · ${c.independent || !c.partyName ? 'Independent' : c.partyName}`}
                                checked={picked.has(String(c._id))}
                                onChange={() => setPicked((s) => { const n = new Set(s); n.has(String(c._id)) ? n.delete(String(c._id)) : n.add(String(c._id)); return n; })}
                            />
                        ))}
                    </div>
                )}
                {error && <Alert tone="danger" className="mt-4">{error}</Alert>}
            </Dialog>
        </>
    );
}
