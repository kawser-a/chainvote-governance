'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { CalendarClock, CheckCircle2, Info } from 'lucide-react';
import {
    Alert, Badge, Button, ButtonLink, Card, EmptyState, Loading, PageHeader, StatusBadge, cx,
} from '../../components/ui/primitives';
import { ConfirmDialog } from '../../components/ui/interactive';
import { electionPhase, formatDateTime, phaseLabel, titleCase } from '../../components/ui/format';

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

/* A large, tappable choice: the whole card is the label for the checkbox or radio. */
function Choice({ type, name, checked, disabled, onChange, children }) {
    return (
        <label
            className={cx(
                'flex gap-3 rounded-md border p-4 transition-colors',
                disabled ? 'cursor-not-allowed opacity-75' : 'cursor-pointer',
                checked ? 'border-brand bg-brand-soft ring-1 ring-brand' : 'border-line-strong bg-surface',
                !checked && !disabled && 'hover:border-ink-3'
            )}
        >
            <input type={type} name={name} checked={checked} disabled={disabled} onChange={onChange} className="mt-0.5 h-5 w-5 shrink-0" />
            <div className="min-w-0 flex-1">{children}</div>
        </label>
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

    const votedIds = useMemo(() => {
        const s = new Set();
        for (const v of myVotes) {
            if (v.manifestoId) s.add(v.manifestoId);
            if (v.candidateId) s.add(v.candidateId);
            if (v.ballotItemId) s.add(v.ballotItemId);
        }
        return s;
    }, [myVotes]);
    // For single-choice ballots one vote closes the ballot; for multi-select manifesto ballots
    // the API still accepts votes for items not yet chosen, but we treat a submitted ballot as final.
    const alreadyVoted = myVotes.length > 0;

    const groups = useMemo(() => {
        if (!election || type !== 'manifesto') return [];
        const map = new Map();
        (election.ballot || []).forEach((b, idx) => {
            const c = b.candidate;
            const cid = c?._id ? String(c._id) : `item-${idx}`;
            if (!map.has(cid)) map.set(cid, { candidate: c, items: [] });
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
    const selectedCount = type === 'proposal' ? Object.keys(proposalPicks).length : picks.size;

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
            }
            setReceipt({ items: summary, at: new Date() });
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
            back={{ href: '/elections', label: 'Elections' }}
            title={election.name}
            description={`${titleCase(election.type)} election · ${titleCase(type)} ballot`}
        />
    );

    /* ── Closure: what was just recorded ── */
    if (receipt) {
        return (
            <>
                {header}
                <Card className="p-5 sm:p-8">
                    <div className="flex items-start gap-3">
                        <CheckCircle2 className="h-8 w-8 shrink-0 text-brand" aria-hidden="true" />
                        <div>
                            <h2 className="text-xl font-bold text-ink" tabIndex={-1}>Your vote has been recorded</h2>
                            <p className="mt-1 text-ink-2">Submitted {formatDateTime(receipt.at)}. You can’t change it now.</p>
                        </div>
                    </div>
                    <h3 className="mt-6 text-sm font-semibold uppercase tracking-wide text-ink-3">You voted for</h3>
                    <ul className="mt-2 divide-y divide-line rounded-md border border-line">
                        {receipt.items.map((it) => (
                            <li key={it.key} className="px-4 py-3">
                                <p className="font-medium text-ink">{it.title}</p>
                                <p className="text-sm text-ink-2">{it.detail}</p>
                            </li>
                        ))}
                    </ul>
                    <p className="mt-4 text-sm text-ink-3">Results are published here when voting closes on {formatDateTime(election.endAt)}.</p>
                    <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                        <ButtonLink href="/elections">Back to elections</ButtonLink>
                        <ButtonLink href="/dashboard" variant="secondary">Go to overview</ButtonLink>
                    </div>
                </Card>
            </>
        );
    }

    const status = (
        <div className="mb-6 flex flex-col gap-3 rounded-[var(--radius-card)] border border-line bg-surface px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div className="flex items-center gap-3">
                <StatusBadge status={phase} />
                <span className="text-sm font-medium text-ink">{phaseLabel(election)}</span>
            </div>
            <p className="flex items-center gap-1.5 text-sm text-ink-2">
                <CalendarClock className="h-4 w-4 shrink-0 text-ink-3" aria-hidden="true" />
                {formatDateTime(election.startAt)} to {formatDateTime(election.endAt)}
            </p>
        </div>
    );

    const ballotEmpty = !(election.ballot || []).length;
    const proposalDone = type === 'proposal' && proposals.length > 0 && pendingProposals.length === 0;
    const closed = (type === 'proposal' ? proposalDone : alreadyVoted);
    const locked = !canVote || closed;

    let banner = null;
    if (closed) {
        banner = (
            <Alert tone="success" title="You’ve already voted in this election" className="mb-6">
                Your vote is recorded{myVotes[0]?.createdAt ? ` (${formatDateTime(myVotes[0].createdAt)})` : ''}. Your choices are marked below.
            </Alert>
        );
    } else if (phase === 'upcoming') {
        banner = (
            <Alert tone="info" title="Voting hasn’t started yet" className="mb-6">
                Voting opens {formatDateTime(election.startAt)}. You can read the ballot now.
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

    const instructions = canVote && !closed && !ballotEmpty && (
        <div className="mb-5 flex gap-3 rounded-md border border-info/25 bg-info-soft px-4 py-3 text-sm text-ink">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-info" aria-hidden="true" />
            <p>
                {type === 'proposal'
                    ? 'Choose an answer for each proposal. You’ll review your answers before they’re submitted.'
                    : multi
                        ? 'Select every commitment you support. You can choose more than one, and you’ll review your choices before submitting.'
                        : `Choose one ${type === 'candidate' ? 'candidate' : 'option'}. You’ll review your choice before submitting.`}
            </p>
        </div>
    );

    return (
        <>
            {header}
            {status}
            {banner}
            {instructions}

            {ballotEmpty && (
                <Card>
                    <EmptyState title="The ballot is empty">The election office hasn’t added anything to this ballot yet.</EmptyState>
                </Card>
            )}

            {/* Manifesto ballot */}
            {type === 'manifesto' && groups.length > 0 && (
                <div className="space-y-5 pb-28">
                    {groups.map(({ candidate: c, items }) => (
                        <fieldset key={c?._id || items[0].id} className="rounded-[var(--radius-card)] border border-line bg-surface p-4 sm:p-5">
                            <legend className="sr-only">{c?.name || 'Candidate'}</legend>
                            <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                                <div className="min-w-0">
                                    <p className="text-lg font-semibold text-ink">{c?.name || 'Candidate'}</p>
                                    <p className="text-sm text-ink-3">
                                        {[c?.gender, c?.age && `${c.age} years`, c?.currentOccupation].filter(Boolean).join(' · ')}
                                    </p>
                                </div>
                                <Badge tone={partyOf(c) === 'Independent' ? 'neutral' : 'info'}>{partyOf(c)}</Badge>
                            </div>
                            {c?.speech50 && <p className="mb-3 border-l-2 border-line-strong pl-3 text-[15px] text-ink-2">“{c.speech50}”</p>}
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
                                            {it.manifesto?.summary && <p className="mt-1 text-[15px] text-ink-2">{it.manifesto.summary}</p>}
                                            {it.target && (
                                                <p className="mt-1.5 inline-flex items-center gap-1 text-sm text-ink-3">
                                                    <CalendarClock className="h-4 w-4" aria-hidden="true" />
                                                    Deadline: within {it.target} month{it.target === 1 ? '' : 's'} of taking office
                                                </p>
                                            )}
                                        </Choice>
                                    );
                                })}
                            </div>
                        </fieldset>
                    ))}
                </div>
            )}

            {/* Candidate ballot */}
            {type === 'candidate' && !ballotEmpty && (
                <fieldset className="space-y-2 pb-28">
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
                                {c?.speech50 && <p className="mt-2 text-[15px] text-ink-2">“{c.speech50}”</p>}
                            </Choice>
                        );
                    })}
                </fieldset>
            )}

            {/* Proposal ballot */}
            {type === 'proposal' && proposals.length > 0 && (
                <div className="space-y-5 pb-28">
                    {proposals.map((b) => {
                        const bid = String(b._id);
                        const mine = myVotes.find((v) => v.ballotItemId === bid);
                        return (
                            <fieldset key={bid} className="rounded-[var(--radius-card)] border border-line bg-surface p-4 sm:p-5">
                                <legend className="sr-only">{b.proposal.title}</legend>
                                <p className="text-lg font-semibold text-ink">{b.proposal.title}</p>
                                <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-3">
                                    {[['Why', b.proposal.reason], ['Expected impact', b.proposal.impact], ['Cost and time', b.proposal.costOrTime]]
                                        .filter(([, v]) => v)
                                        .map(([k, v]) => (
                                            <div key={k} className="rounded-md bg-canvas px-3 py-2">
                                                <dt className="text-xs font-semibold uppercase tracking-wide text-ink-3">{k}</dt>
                                                <dd className="mt-0.5 text-ink">{v}</dd>
                                            </div>
                                        ))}
                                </dl>
                                <p className="mt-4 text-sm font-semibold text-ink">Your answer</p>
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

            {/* Sticky action bar: always shows what's selected and the one next step. */}
            {canVote && !closed && !ballotEmpty && (
                <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-surface/95 backdrop-blur lg:left-64">
                    <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
                        <div className="text-sm" aria-live="polite">
                            {submitError ? (
                                <span className="font-medium text-danger">{submitError}</span>
                            ) : (
                                <span className="text-ink-2">
                                    <span className="font-semibold text-ink">{selectedCount}</span>
                                    {type === 'proposal' ? ` of ${pendingProposals.length} answered` : ` selected${multi ? '' : ' (choose one)'}`}
                                </span>
                            )}
                            {selectedCount > 0 && (
                                <button
                                    type="button"
                                    onClick={() => { setPicks(new Set()); setProposalPicks({}); setSubmitError(''); }}
                                    className="ml-3 min-h-9 pointer-coarse:min-h-11 font-semibold text-brand underline hover:text-brand-hover"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                        <Button
                            size="lg"
                            onClick={() => setReviewing(true)}
                            disabled={selectedCount === 0 || (type === 'proposal' && selectedCount < pendingProposals.length)}
                            className="sm:min-w-48"
                        >
                            Review my vote
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
                <ul className="divide-y divide-line rounded-md border border-line">
                    {summary.map((it) => (
                        <li key={it.key} className="px-4 py-3">
                            <p className="font-medium text-ink">{it.title}</p>
                            <p className="text-sm text-ink-2">{it.detail}</p>
                        </li>
                    ))}
                </ul>
                {submitError && <Alert tone="danger" className="mt-4">{submitError}</Alert>}
                <p className="mt-4 text-sm text-ink-3">
                    Voting in <span className="font-medium text-ink-2">{election.name}</span>. Votes can’t be changed after submission, so every vote is counted exactly once.
                </p>
            </ConfirmDialog>
        </>
    );
}
