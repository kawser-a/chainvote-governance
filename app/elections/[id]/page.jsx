'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { CalendarClock, Check, Copy, Info, Printer, X } from 'lucide-react';
import {
    Alert, Badge, Button, ButtonLink, Card, EmptyState, Loading, PageHeader, StatusBadge, cx,
} from '../../components/ui/primitives';
import { ConfirmDialog, useToast } from '../../components/ui/interactive';
import { electionPhase, formatDateTime, phaseLabel, shortHash, titleCase } from '../../components/ui/format';
import Countdown from '../../components/motion/Countdown';

const SERVER_MESSAGES = {
    'Enrollment required': 'You need to finish enrolling before you can vote.',
    'You are banned': 'Voting has been disabled for your account. Contact your election office.',
    'Voting disabled': 'Voting has been disabled for your account. Contact your election office.',
    'Not eligible for this seat': 'This election isn’t for your constituency, so you can’t vote in it.',
    'Election is not active': 'Voting isn’t open for this election right now.',
    'Election is paused': 'Voting is paused for this election. Try again later.',
    'Only one selection allowed': 'You can only choose one option in this election.',
};

function partyOf(c) {
    return c?.partyName && !c?.independent ? c.partyName : 'Independent';
}

/* Where the voter is: choose, review, done. */
function Steps({ current }) {
    const steps = ['Choose', 'Review', 'Done'];
    return (
        <ol className="mb-6 flex flex-wrap items-center gap-x-1.5 gap-y-2 text-sm sm:gap-x-2" aria-label="Voting steps">
            {steps.map((s, i) => {
                const done = i < current;
                const active = i === current;
                return (
                    <li key={s} className="flex items-center gap-2" aria-current={active ? 'step' : undefined}>
                        <span
                            className={cx(
                                'flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold transition-colors duration-300',
                                done && 'border-brand bg-brand text-on-brand',
                                active && 'border-brand bg-brand-soft text-brand-ink',
                                !done && !active && 'border-line-strong text-ink-3'
                            )}
                        >
                            {done ? <Check className="h-4 w-4 animate-pop" aria-hidden="true" /> : i + 1}
                        </span>
                        <span className={cx('font-medium', active ? 'text-ink' : 'text-ink-3')}>{s}</span>
                        {i < steps.length - 1 && <span className={cx('mx-0.5 h-px w-4 sm:mx-1 sm:w-10', done ? 'bg-brand' : 'bg-line-strong')} aria-hidden="true" />}
                    </li>
                );
            })}
        </ol>
    );
}

/* A large, tappable choice: the whole card is the label for the checkbox or radio. */
function Choice({ type, name, checked, disabled, onChange, children }) {
    return (
        <label
            className={cx(
                'group relative flex gap-3.5 rounded-xl border p-4 transition-[border-color,background-color,box-shadow] duration-150',
                'has-[:focus-visible]:outline has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus',
                disabled ? 'cursor-not-allowed' : 'cursor-pointer',
                checked ? 'border-brand bg-brand-soft shadow-[0_0_0_1px_var(--color-brand)]' : 'border-line bg-raised',
                !checked && !disabled && 'hover:border-line-strong hover:bg-subtle active:bg-line',
                disabled && !checked && 'opacity-70'
            )}
        >
            <input type={type} name={name} checked={checked} disabled={disabled} onChange={onChange} className="peer sr-only" />
            <span
                className={cx(
                    'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center border-2 transition-colors duration-150',
                    type === 'radio' ? 'rounded-full' : 'rounded-md',
                    checked ? 'border-brand bg-brand text-on-brand' : 'border-line-strong bg-canvas group-hover:border-ink-3'
                )}
                aria-hidden="true"
            >
                {checked && <Check className="h-4 w-4 animate-pop" strokeWidth={3} />}
            </span>
            <div className="min-w-0 flex-1">{children}</div>
        </label>
    );
}

function ReceiptCodes({ codes }) {
    const { notify } = useToast();
    if (!codes?.length) return null;
    async function copy() {
        try {
            await navigator.clipboard.writeText(codes.join('\n'));
            notify('Receipt codes copied.');
        } catch {
            notify('Couldn’t copy. Select the codes and copy them instead.', { tone: 'danger' });
        }
    }
    return (
        <div className="mt-6 rounded-xl border border-accent/30 bg-accent-soft/50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-accent-ink">Receipt code{codes.length > 1 ? 's' : ''}</p>
                <Button size="sm" variant="ghost" onClick={copy} className="print:hidden">
                    <Copy className="h-4 w-4" aria-hidden="true" /> Copy
                </Button>
            </div>
            <ul className="mt-2 space-y-1 font-mono text-xs text-ink">
                {codes.map((c) => (
                    <li key={c} className="break-all" title={c}>{c}</li>
                ))}
            </ul>
            <p className="mt-2 text-xs text-ink-3">
                Each code is the fingerprint of your vote record on the chain. Keep it if you want to check later that your vote is still there.
            </p>
        </div>
    );
}

export default function BallotPage() {
    const { id } = useParams();
    const [election, setElection] = useState(null);
    const [myVotes, setMyVotes] = useState([]);
    const [state, setState] = useState('loading');
    const [loadError, setLoadError] = useState('');

    const [picks, setPicks] = useState(() => new Set());          // manifesto or candidate ids
    const [proposalPicks, setProposalPicks] = useState({});       // ballotItemId -> optionKey
    const [reviewing, setReviewing] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [receipt, setReceipt] = useState(null);

    const load = useCallback(async () => {
        if (!id) return;
        setState('loading');
        try {
            const r = await fetch(`/api/elections/${id}`, { cache: 'no-store', credentials: 'include' });
            const j = await r.json();
            if (!j.ok) {
                setLoadError(j.error === 'Not found' ? 'This election doesn’t exist or has been removed.' : 'We couldn’t load this election.');
                setState('error');
                return;
            }
            setElection(j.election);
            setMyVotes(j.myVotes || []);
            setState('ready');
        } catch {
            setLoadError('We couldn’t reach the server. Check your connection and try again.');
            setState('error');
        }
    }, [id]);

    useEffect(() => {
        load();
    }, [load]);

    const type = election?.ballotType || 'manifesto';
    const multi = !!election?.multiSelect;
    const phase = election ? electionPhase(election) : null;
    const canVote = phase === 'active';
    const selectedCount = type === 'proposal' ? Object.keys(proposalPicks).length : picks.size;

    // Don't lose a half-finished ballot to a stray tap on Back or a closed tab.
    useEffect(() => {
        if (!selectedCount || receipt) return;
        const warn = (e) => {
            e.preventDefault();
            e.returnValue = '';
        };
        window.addEventListener('beforeunload', warn);
        return () => window.removeEventListener('beforeunload', warn);
    }, [selectedCount, receipt]);

    const votedIds = useMemo(() => {
        const s = new Set();
        for (const v of myVotes) {
            if (v.manifestoId) s.add(v.manifestoId);
            if (v.candidateId) s.add(v.candidateId);
            if (v.ballotItemId) s.add(v.ballotItemId);
        }
        return s;
    }, [myVotes]);
    const alreadyVoted = myVotes.length > 0;

    const groups = useMemo(() => {
        if (!election || type !== 'manifesto') return [];
        const map = new Map();
        (election.ballot || []).forEach((b, idx) => {
            const c = b.candidate;
            const cid = c?._id ? String(c._id) : `item-${idx}`;
            if (!map.has(cid)) map.set(cid, { key: cid, candidate: c, items: [] });
            map.get(cid).items.push({ id: String(b.manifestoId), manifesto: b.manifesto, title: b.title, seat: b.seat || c?.seat, target: b.targetMonths ?? b.manifesto?.targetWindowMonths });
        });
        return [...map.values()];
    }, [election, type]);

    function toggle(itemId) {
        setSubmitError('');
        setPicks((prev) => {
            if (!multi) return new Set(prev.has(itemId) ? [] : [itemId]);
            const s = new Set(prev);
            s.has(itemId) ? s.delete(itemId) : s.add(itemId);
            return s;
        });
    }

    const proposals = useMemo(() => (type === 'proposal' ? (election?.ballot || []).filter((b) => b.proposal) : []), [election, type]);
    const pendingProposals = proposals.filter((b) => !votedIds.has(String(b._id)));

    // Human-readable summary of the current selection, for the review step and the receipt.
    const summary = useMemo(() => {
        if (!election) return [];
        if (type === 'proposal') {
            return proposals
                .filter((b) => proposalPicks[String(b._id)])
                .map((b) => {
                    const opt = (b.proposal.options || []).find((o) => o.key === proposalPicks[String(b._id)]);
                    return { key: String(b._id), title: b.proposal.title, detail: `Your answer: ${opt?.label || proposalPicks[String(b._id)]}` };
                });
        }
        return (election.ballot || [])
            .filter((b) => picks.has(String(type === 'candidate' ? b.candidateId : b.manifestoId)))
            .map((b) =>
                type === 'candidate'
                    ? { key: String(b.candidateId), title: b.candidate?.name || b.title, detail: partyOf(b.candidate) }
                    : { key: String(b.manifestoId), title: b.manifesto?.title || b.title || 'Manifesto', detail: `${b.candidate?.name || '—'} · ${partyOf(b.candidate)}` }
            );
    }, [election, type, proposals, proposalPicks, picks]);

    async function submit() {
        setSubmitting(true);
        setSubmitError('');
        const codes = [];
        try {
            if (type === 'proposal') {
                for (const [ballotItemId, optionKey] of Object.entries(proposalPicks)) {
                    const r = await fetch(`/api/elections/${election._id}/vote`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({ ballotItemId, optionKey }),
                    });
                    const j = await r.json();
                    if (!j.ok) throw new Error(j.error);
                    codes.push(...(j.receipts || []));
                }
            } else {
                const body = type === 'candidate' ? { candidateIds: [...picks] } : { manifestoIds: [...picks] };
                const r = await fetch(`/api/elections/${election._id}/vote`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify(body),
                });
                const j = await r.json();
                if (!j.ok) throw new Error(j.error);
                codes.push(...(j.receipts || []));
            }
            setReceipt({ items: summary, at: new Date(), codes });
            setReviewing(false);
            setPicks(new Set());
            setProposalPicks({});
            window.scrollTo({ top: 0 });
        } catch (err) {
            const raw = err?.message || '';
            if (/already voted/i.test(raw)) {
                setReviewing(false);
                await load();
                return;
            }
            setSubmitError(SERVER_MESSAGES[raw] || raw || 'Your vote wasn’t recorded. Please try again.');
        } finally {
            setSubmitting(false);
        }
    }

    if (state === 'loading') return <Loading label="Loading ballot…" rows={4} />;

    if (state === 'error') {
        return (
            <>
                <PageHeader back={{ href: '/elections', label: 'Elections' }} title="Ballot unavailable" />
                <Alert tone="danger" action={<Button variant="secondary" size="sm" onClick={load}>Try again</Button>}>{loadError}</Alert>
            </>
        );
    }

    const header = (
        <PageHeader
            back={{ href: '/elections', label: 'All elections' }}
            eyebrow={`${titleCase(election.type)} election · ${(election.seats || []).join(', ')}`}
            title={election.name}
        />
    );

    /* ── Closure: what was just recorded ── */
    if (receipt) {
        return (
            <>
                {header}
                <Steps current={3} />
                <Card className="animate-rise overflow-hidden">
                    <div className="border-b border-line bg-brand-soft/60 px-5 py-6 sm:px-8">
                        <div className="flex items-start gap-4">
                            <svg viewBox="0 0 52 52" className="h-12 w-12 shrink-0" aria-hidden="true">
                                <circle cx="26" cy="26" r="24" fill="var(--color-brand)" className="animate-pop" />
                                <path d="M15 27l7 7 15-16" fill="none" stroke="var(--color-on-brand)" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" pathLength="1" strokeDasharray="1" className="animate-draw" />
                            </svg>
                            <div>
                                <h2 className="font-display text-2xl font-semibold text-ink" tabIndex={-1}>Your vote has been recorded</h2>
                                <p className="mt-1 text-ink-2">Submitted {formatDateTime(receipt.at)}. It’s final and can’t be changed.</p>
                            </div>
                        </div>
                    </div>
                    <div className="px-5 py-6 sm:px-8">
                        <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-3">You voted for</h3>
                        <ul className="stagger mt-3 divide-y divide-line rounded-xl border border-line">
                            {receipt.items.map((it, i) => (
                                <li key={it.key} className="flex gap-3 px-4 py-3" style={{ '--i': i + 2 }}>
                                    <Check className="mt-0.5 h-5 w-5 shrink-0 text-brand" aria-hidden="true" />
                                    <div>
                                        <p className="font-medium text-ink">{it.title}</p>
                                        <p className="text-sm text-ink-2">{it.detail}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                        <ReceiptCodes codes={receipt.codes} />
                        <p className="mt-5 text-sm text-ink-3">Results appear on this election’s page when voting closes on {formatDateTime(election.endAt)}.</p>
                        <div className="mt-6 flex flex-col gap-2 sm:flex-row print:hidden">
                            <ButtonLink href="/elections">Back to elections</ButtonLink>
                            <Button variant="secondary" onClick={() => window.print()}>
                                <Printer className="h-4 w-4" aria-hidden="true" /> Print or save receipt
                            </Button>
                        </div>
                    </div>
                </Card>
            </>
        );
    }

    const ballotEmpty = !(election.ballot || []).length;
    const proposalDone = type === 'proposal' && proposals.length > 0 && pendingProposals.length === 0;
    const closed = type === 'proposal' ? proposalDone : alreadyVoted;
    const locked = !canVote || closed;
    const interactive = canVote && !closed && !ballotEmpty;
    const ready = selectedCount > 0 && !(type === 'proposal' && selectedCount < pendingProposals.length);

    const status = (
        <div className="mb-6 flex flex-col gap-3 rounded-[var(--radius-card)] border border-line bg-surface px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div className="flex flex-wrap items-center gap-3">
                <StatusBadge status={phase} />
                {phase === 'active' ? (
                    <Countdown to={election.endAt} className="text-sm" endedText="Voting has just closed" />
                ) : (
                    <span className="text-sm font-medium text-ink">{phaseLabel(election)}</span>
                )}
            </div>
            <p className="flex items-center gap-1.5 text-sm text-ink-2">
                <CalendarClock className="h-4 w-4 shrink-0 text-ink-3" aria-hidden="true" />
                {formatDateTime(election.startAt)} to {formatDateTime(election.endAt)}
            </p>
        </div>
    );

    let banner = null;
    if (closed) {
        banner = (
            <Alert tone="success" title="You’ve already voted in this election" className="mb-6">
                Your vote was recorded{myVotes[0]?.createdAt ? ` on ${formatDateTime(myVotes[0].createdAt)}` : ''}. Your choices are marked below.
                {myVotes.some((v) => v.receipt) && (
                    <span className="mt-1 block font-mono text-xs text-ink-3">
                        Receipt {myVotes.filter((v) => v.receipt).map((v) => shortHash(v.receipt)).join(', ')}
                    </span>
                )}
            </Alert>
        );
    } else if (phase === 'upcoming') {
        banner = (
            <Alert tone="info" title="Voting hasn’t started yet" className="mb-6">
                Voting opens {formatDateTime(election.startAt)}. Read the ballot now so you’re ready.
            </Alert>
        );
    } else if (phase === 'paused') {
        banner = (
            <Alert tone="warning" title="Voting is paused" className="mb-6">
                {election.pauseReason || 'The election office has paused voting. Check back later.'}
            </Alert>
        );
    } else if (phase === 'ended') {
        banner = (
            <Alert tone="info" title="Voting has closed" className="mb-6" action={<ButtonLink href={`/elections/${election._id}/results`} size="sm" variant="secondary">See results</ButtonLink>}>
                This election ended {formatDateTime(election.endAt)}.
            </Alert>
        );
    }

    const instructions = interactive && (
        <div className="mb-5 flex gap-3 rounded-xl border border-info/25 bg-info-soft px-4 py-3 text-sm text-ink">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-info" aria-hidden="true" />
            <p>
                {type === 'proposal'
                    ? 'Choose an answer for each proposal. You’ll check your answers before they’re sent.'
                    : multi
                        ? 'Tick every commitment you support. You can choose more than one, and you’ll check your choices before they’re sent.'
                        : `Choose one ${type === 'candidate' ? 'candidate' : 'option'}. You’ll check your choice before it’s sent.`}
            </p>
        </div>
    );

    const clearAll = () => {
        setPicks(new Set());
        setProposalPicks({});
        setSubmitError('');
    };

    /* Desktop: the selection stays in view beside the ballot so nothing has to be remembered. */
    const sidePanel = interactive && (
        <aside className="hidden lg:block">
            <div className="sticky top-6 rounded-[var(--radius-card)] border border-line bg-surface p-5">
                <div className="flex items-baseline justify-between gap-2">
                    <h2 className="font-semibold text-ink">Your selection</h2>
                    <span className="text-sm tabular-nums text-ink-3">
                        {type === 'proposal' ? `${selectedCount} of ${pendingProposals.length}` : selectedCount}
                    </span>
                </div>
                {summary.length === 0 ? (
                    <p className="mt-3 text-sm text-ink-3">Nothing chosen yet. Your choices will appear here.</p>
                ) : (
                    <ul className="mt-3 space-y-2">
                        {summary.map((it) => (
                            <li key={it.key} className="flex animate-rise items-start gap-2 rounded-lg border border-line bg-raised px-3 py-2">
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-ink">{it.title}</p>
                                    <p className="truncate text-xs text-ink-3">{it.detail}</p>
                                </div>
                                {type !== 'proposal' && (
                                    <button
                                        type="button"
                                        onClick={() => toggle(it.key)}
                                        className="-m-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-ink-3 transition-colors hover:bg-subtle hover:text-ink"
                                        aria-label={`Remove ${it.title}`}
                                    >
                                        <X className="h-4 w-4" aria-hidden="true" />
                                    </button>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
                {submitError && <Alert tone="danger" className="mt-3">{submitError}</Alert>}
                <Button block size="lg" className="mt-4" onClick={() => setReviewing(true)} disabled={!ready}>
                    Review my vote
                </Button>
                {selectedCount > 0 && (
                    <Button block variant="ghost" className="mt-2" onClick={clearAll}>Clear all</Button>
                )}
                <p className="mt-3 text-xs text-ink-3">Nothing is sent until you confirm on the next screen.</p>
            </div>
        </aside>
    );

    return (
        <>
            {header}
            {interactive && <Steps current={reviewing ? 1 : 0} />}
            {status}
            {banner}

            <div className={cx(interactive && 'lg:grid lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start lg:gap-8')}>
                <div className="min-w-0 pb-32 lg:pb-0">
                    {instructions}

                    {ballotEmpty && (
                        <Card>
                            <EmptyState title="The ballot is empty">The election office hasn’t added anything to this ballot yet.</EmptyState>
                        </Card>
                    )}

                    {/* Manifesto ballot */}
                    {type === 'manifesto' && groups.length > 0 && (
                        <>
                            {groups.length > 2 && (
                                <nav aria-label="Jump to candidate" className="-mx-4 mb-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
                                    <ul className="flex min-w-max gap-2">
                                        {groups.map((g) => (
                                            <li key={g.key}>
                                                <a
                                                    href={`#cand-${g.key}`}
                                                    className="inline-flex min-h-9 pointer-coarse:min-h-11 items-center rounded-full border border-line bg-surface px-3 text-sm text-ink-2 transition-colors hover:border-line-strong hover:text-ink"
                                                >
                                                    {g.candidate?.name || 'Candidate'}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </nav>
                            )}
                            <div className="space-y-5">
                                {groups.map(({ key, candidate: c, items }) => {
                                    const chosenHere = items.filter((it) => picks.has(it.id)).length;
                                    return (
                                        <fieldset key={key} id={`cand-${key}`} className="scroll-mt-24 rounded-[var(--radius-card)] border border-line bg-surface p-4 sm:p-5">
                                            <legend className="sr-only">{c?.name || 'Candidate'}</legend>
                                            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                                                <div className="flex min-w-0 items-center gap-3">
                                                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-subtle font-display text-lg font-semibold text-ink-2" aria-hidden="true">
                                                        {(c?.name || '?').trim().charAt(0)}
                                                    </span>
                                                    <div className="min-w-0">
                                                        <p className="text-lg font-semibold text-ink">{c?.name || 'Candidate'}</p>
                                                        <p className="text-sm text-ink-3">
                                                            {[c?.gender, c?.age && `${c.age} years`, c?.currentOccupation].filter(Boolean).join(' · ')}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {chosenHere > 0 && <Badge tone="success">{chosenHere} chosen</Badge>}
                                                    <Badge tone={partyOf(c) === 'Independent' ? 'neutral' : 'info'}>{partyOf(c)}</Badge>
                                                </div>
                                            </div>
                                            {c?.speech50 && <p className="mb-4 border-l-2 border-accent/60 pl-3 text-[15px] italic text-ink-2">“{c.speech50}”</p>}
                                            <div className="space-y-2">
                                                {items.map((it, i) => {
                                                    const voted = votedIds.has(it.id);
                                                    return (
                                                        <Choice
                                                            key={it.id}
                                                            type={multi ? 'checkbox' : 'radio'}
                                                            name="manifesto"
                                                            checked={voted || picks.has(it.id)}
                                                            disabled={locked}
                                                            onChange={() => toggle(it.id)}
                                                        >
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                <p className="font-semibold text-ink">{it.manifesto?.title || it.title || `Commitment ${i + 1}`}</p>
                                                                {voted && <Badge tone="success">Your vote</Badge>}
                                                            </div>
                                                            {it.manifesto?.summary && <p className="mt-1 text-[15px] leading-relaxed text-ink-2">{it.manifesto.summary}</p>}
                                                            {it.target && (
                                                                <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-medium text-accent-ink">
                                                                    <CalendarClock className="h-3.5 w-3.5" aria-hidden="true" />
                                                                    Deadline: within {it.target} month{it.target === 1 ? '' : 's'}
                                                                </p>
                                                            )}
                                                        </Choice>
                                                    );
                                                })}
                                            </div>
                                        </fieldset>
                                    );
                                })}
                            </div>
                        </>
                    )}

                    {/* Candidate ballot */}
                    {type === 'candidate' && !ballotEmpty && (
                        <fieldset className="space-y-2">
                            <legend className="sr-only">Candidates</legend>
                            {election.ballot.map((b) => {
                                const c = b.candidate;
                                const cid = String(b.candidateId);
                                const voted = votedIds.has(cid);
                                return (
                                    <Choice key={cid} type="radio" name="candidate" checked={voted || picks.has(cid)} disabled={locked} onChange={() => toggle(cid)}>
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <p className="text-lg font-semibold text-ink">{c?.name || b.title}</p>
                                            <div className="flex gap-2">
                                                {voted && <Badge tone="success">Your vote</Badge>}
                                                <Badge tone={partyOf(c) === 'Independent' ? 'neutral' : 'info'}>{partyOf(c)}</Badge>
                                            </div>
                                        </div>
                                        <p className="text-sm text-ink-3">
                                            {[c?.seat, c?.gender, c?.age && `${c.age} years`, c?.currentOccupation].filter(Boolean).join(' · ')}
                                        </p>
                                        {c?.speech50 && <p className="mt-2 text-[15px] italic text-ink-2">“{c.speech50}”</p>}
                                    </Choice>
                                );
                            })}
                        </fieldset>
                    )}

                    {/* Proposal ballot */}
                    {type === 'proposal' && proposals.length > 0 && (
                        <div className="space-y-5">
                            {proposals.map((b) => {
                                const bid = String(b._id);
                                const mine = myVotes.find((v) => v.ballotItemId === bid);
                                return (
                                    <fieldset key={bid} className="rounded-[var(--radius-card)] border border-line bg-surface p-4 sm:p-5">
                                        <legend className="sr-only">{b.proposal.title}</legend>
                                        <p className="font-display text-xl font-semibold text-ink">{b.proposal.title}</p>
                                        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                                            {[['Why', b.proposal.reason], ['Expected impact', b.proposal.impact], ['Cost and time', b.proposal.costOrTime]]
                                                .filter(([, v]) => v)
                                                .map(([k, v]) => (
                                                    <div key={k} className="rounded-lg border border-line bg-raised px-3 py-2.5">
                                                        <dt className="text-xs font-semibold uppercase tracking-wide text-ink-3">{k}</dt>
                                                        <dd className="mt-1 text-ink">{v}</dd>
                                                    </div>
                                                ))}
                                        </dl>
                                        <p className="mt-5 text-sm font-semibold text-ink">Your answer</p>
                                        <div className="mt-2 grid gap-2 sm:grid-cols-3">
                                            {(b.proposal.options || []).map((o) => (
                                                <Choice
                                                    key={o.key}
                                                    type="radio"
                                                    name={`proposal-${bid}`}
                                                    checked={mine ? mine.optionKey === o.key : proposalPicks[bid] === o.key}
                                                    disabled={!canVote || !!mine}
                                                    onChange={() => {
                                                        setSubmitError('');
                                                        setProposalPicks((p) => ({ ...p, [bid]: o.key }));
                                                    }}
                                                >
                                                    <span className="font-medium text-ink">{o.label}</span>
                                                    {mine?.optionKey === o.key && <span className="ml-2"><Badge tone="success">Your vote</Badge></span>}
                                                </Choice>
                                            ))}
                                        </div>
                                    </fieldset>
                                );
                            })}
                        </div>
                    )}
                </div>

                {sidePanel}
            </div>

            {/* Phones and tablets: a sticky bar with the count and the one next step. */}
            {interactive && (
                <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden">
                    <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
                        <div className="min-w-0 flex-1 text-sm" aria-live="polite">
                            {submitError ? (
                                <span className="font-medium text-danger">{submitError}</span>
                            ) : (
                                <span className="text-ink-2">
                                    <span key={selectedCount} className="inline-block animate-pop font-semibold text-ink tabular-nums">{selectedCount}</span>
                                    {type === 'proposal' ? ` of ${pendingProposals.length} answered` : ` selected${multi ? '' : ' (choose one)'}`}
                                </span>
                            )}
                            {selectedCount > 0 && (
                                <button
                                    type="button"
                                    onClick={clearAll}
                                    className="ml-3 min-h-9 pointer-coarse:min-h-11 font-semibold text-brand underline hover:text-brand-hover"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                        <Button onClick={() => setReviewing(true)} disabled={!ready} className="shrink-0 px-3 sm:px-4">
                            Review<span className="hidden min-[360px]:inline">&nbsp;my vote</span>
                        </Button>
                    </div>
                </div>
            )}

            <ConfirmDialog
                open={reviewing}
                onCancel={() => setReviewing(false)}
                onConfirm={submit}
                loading={submitting}
                title="Check your vote"
                description="Once you submit, your vote is final and can’t be changed."
                confirmLabel="Submit my vote"
                cancelLabel="Go back and change"
            >
                <ul className="divide-y divide-line rounded-xl border border-line">
                    {summary.map((it) => (
                        <li key={it.key} className="flex gap-3 px-4 py-3">
                            <Check className="mt-0.5 h-5 w-5 shrink-0 text-brand" aria-hidden="true" />
                            <div>
                                <p className="font-medium text-ink">{it.title}</p>
                                <p className="text-sm text-ink-2">{it.detail}</p>
                            </div>
                        </li>
                    ))}
                </ul>
                {submitError && <Alert tone="danger" className="mt-4">{submitError}</Alert>}
                <p className="mt-4 text-sm text-ink-3">
                    Voting in <span className="font-medium text-ink-2">{election.name}</span>. Each vote is counted exactly once, so it can’t be changed afterwards.
                </p>
            </ConfirmDialog>
        </>
    );
}
