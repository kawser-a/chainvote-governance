'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Award, CalendarClock, Trophy } from 'lucide-react';
import {
    Alert, Badge, Button, Card, CardBody, CardHeader, EmptyState, Field, Loading, Meter, PageHeader, Stat, StatusBadge, Textarea, cx,
} from '../ui/primitives';
import { Dialog, useToast } from '../ui/interactive';
import { electionPhase, formatDate, formatDateTime, titleCase } from '../ui/format';

function pct(n, total) {
    return total ? Math.round((n / total) * 1000) / 10 : 0;
}

/* A labelled horizontal bar: the number is always written out, the bar only reinforces it. */
function ResultBar({ label, sub, votes, total, max, highlight, rank }) {
    return (
        <li className="flex gap-3 py-3.5">
            <span
                className={cx(
                    'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold tabular-nums',
                    highlight ? 'bg-accent text-on-accent' : 'bg-subtle text-ink-3'
                )}
                aria-hidden="true"
            >
                {highlight ? <Trophy className="h-3.5 w-3.5" /> : rank}
            </span>
            <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-3">
                    <div className="min-w-0">
                        <p className="font-medium text-ink break-words">{label}</p>
                        {sub && <p className="text-sm text-ink-3">{sub}</p>}
                    </div>
                    <p className="shrink-0 text-right text-sm tabular-nums">
                        <span className="font-semibold text-ink">{votes.toLocaleString()}</span>
                        <span className="text-ink-3"> · {pct(votes, total)}%</span>
                    </p>
                </div>
                <Meter value={votes} max={max || 1} tone={highlight ? 'accent' : 'muted'} label={`${label}: ${votes} votes`} className="mt-2 h-2.5" delay={rank * 80} />
            </div>
        </li>
    );
}

// Shared by the voter and election office results pages so both read exactly the same.
export default function ElectionResults({ id, back, allowPetitions = false }) {
    const { notify } = useToast();
    const [data, setData] = useState(null);
    const [winners, setWinners] = useState([]);
    const [petitions, setPetitions] = useState([]);
    const [state, setState] = useState('loading');

    const [target, setTarget] = useState(null);
    const [reason, setReason] = useState('');
    const [reasonError, setReasonError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');

    const loadPetitions = useCallback(async () => {
        try {
            const r = await fetch(`/api/petitions?electionId=${id}`, { cache: 'no-store', credentials: 'include' });
            const j = await r.json();
            setPetitions(j.ok ? j.data || [] : []);
        } catch {
            setPetitions([]);
        }
    }, [id]);

    const load = useCallback(async () => {
        if (!id) return;
        setState('loading');
        try {
            const [r1, r2] = await Promise.all([
                fetch(`/api/elections/${id}/results`, { cache: 'no-store', credentials: 'include' }),
                fetch(`/api/elections/${id}/winners`, { cache: 'no-store', credentials: 'include' }),
            ]);
            const j1 = await r1.json();
            const j2 = await r2.json().catch(() => ({}));
            if (!j1.ok) throw new Error();
            setData(j1);
            setWinners(j2.ok ? j2.winners || [] : []);
            setState('ready');
        } catch {
            setState('error');
        }
        if (allowPetitions) loadPetitions();
    }, [id, loadPetitions, allowPetitions]);

    useEffect(() => {
        load();
    }, [load]);

    const filed = useMemo(() => new Set(petitions.map((p) => String(p.manifestoId))), [petitions]);

    function openPetition(winner, m) {
        setTarget({ title: m.title, candidate: winner.candidate?.name, electionId: data?.election?._id, candidateId: winner.candidate?._id, manifestoId: m._id });
        setReason('');
        setReasonError('');
        setSubmitError('');
    }

    async function submitPetition() {
        if (reason.trim().length < 10) {
            setReasonError('Tell us briefly what hasn’t been delivered (at least 10 characters).');
            return;
        }
        setSubmitting(true);
        setSubmitError('');
        try {
            const r = await fetch('/api/petitions', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ electionId: target.electionId, candidateId: target.candidateId, manifestoId: target.manifestoId, reason: reason.trim() }),
            });
            if (r.status === 401) {
                window.location.href = `/login?next=${encodeURIComponent(window.location.pathname)}`;
                return;
            }
            const j = await r.json();
            if (!j.ok) {
                setSubmitError(j.error || 'Your petition wasn’t filed. Please try again.');
                return;
            }
            setTarget(null);
            notify('Petition filed. You can follow it under My petitions.');
            loadPetitions();
        } catch {
            setSubmitError('We couldn’t reach the server. Please try again.');
        } finally {
            setSubmitting(false);
        }
    }

    if (state === 'loading') return <Loading label="Loading results…" rows={4} />;
    if (state === 'error') {
        return (
            <>
                <PageHeader back={back} title="Results unavailable" />
                <Alert tone="danger" action={<Button variant="secondary" size="sm" onClick={load}>Try again</Button>}>
                    We couldn’t load the results for this election.
                </Alert>
            </>
        );
    }

    const e = data.election || {};
    const phase = electionPhase(e);
    const total = data.totalVotes || 0;
    const byManifesto = [...(data.byManifesto || [])].sort((a, b) => b.votes - a.votes);
    const maxM = byManifesto[0]?.votes || 0;
    const byParty = [...(data.byParty || [])].sort((a, b) => b.votes - a.votes);
    const maxP = byParty[0]?.votes || 0;
    const seats = new Set(byManifesto.map((m) => m.seat).filter(Boolean)).size || (data.seatWise || []).length;

    return (
        <>
            <PageHeader
                back={back}
                eyebrow="Results"
                title={e.name}
                description={`${titleCase(e.type)} election · ${titleCase(e.ballotType)} ballot · ${formatDate(e.startAt)} to ${formatDate(e.endAt)}`}
            />

            {phase !== 'ended' && (
                <Alert tone="info" title="These results are provisional" className="mb-6">
                    Voting is still open until {formatDateTime(e.endAt)}, so these numbers will change.
                </Alert>
            )}

            <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-3">
                <Stat label="Votes counted" value={total.toLocaleString()} />
                <Stat label="Seats" value={seats || '—'} />
                <div className="col-span-2 rounded-[var(--radius-card)] border border-line bg-surface p-4 sm:p-5 lg:col-span-1">
                    <p className="text-sm font-medium text-ink-2">Status</p>
                    <div className="mt-3"><StatusBadge status={phase} /></div>
                </div>
            </div>

            {e.ballotType === 'manifesto' && (
                <Card className="mb-8">
                    <CardHeader title="Votes by commitment" description="Each vote supports one written commitment. Highest first." />
                    <CardBody className="py-1 sm:py-2">
                        {byManifesto.length === 0 ? (
                            <EmptyState title="No votes yet" className="py-6" />
                        ) : (
                            <ol className="divide-y divide-line">
                                {byManifesto.map((m, i) => (
                                    <ResultBar
                                        key={m.manifestoId || i}
                                        label={m.title}
                                        sub={`${m.candidateName} · ${m.partyName || 'Independent'}${m.seat ? ` · ${m.seat}` : ''}`}
                                        votes={m.votes}
                                        total={total}
                                        max={maxM}
                                        highlight={m.votes > 0 && m.votes === maxM}
                                        rank={i + 1}
                                    />
                                ))}
                            </ol>
                        )}
                    </CardBody>
                </Card>
            )}

            <section aria-labelledby="elected-heading" className="mb-8">
                <h2 id="elected-heading" className="font-display text-2xl font-semibold text-ink">{phase === 'ended' ? 'Elected' : 'Currently leading'}</h2>
                <p className="mb-4 text-sm text-ink-2">
                    The candidate with the most votes in each seat, and progress on what they committed to.
                </p>
                {winners.length === 0 ? (
                    <Card><EmptyState icon={Award} title="No winner yet">A winner appears once votes have been counted.</EmptyState></Card>
                ) : (
                    <div className="space-y-4">
                        {winners.map((w, idx) => {
                            const party = w.candidate?.partyName && w.candidate.partyName !== 'Independent' ? w.candidate.partyName : 'Independent';
                            return (
                                <Card key={idx} className="animate-rise">
                                    <div className="flex flex-col gap-2 border-b border-line px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                                        <div className="flex items-center gap-3">
                                            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent"><Award className="h-5 w-5" aria-hidden="true" /></span>
                                            <div>
                                                <p className="text-lg font-semibold text-ink">{w.candidate?.name}</p>
                                                <p className="text-sm text-ink-3">{w.seat} · {party}</p>
                                            </div>
                                        </div>
                                        <p className="text-sm text-ink-2"><span className="font-semibold text-ink tabular-nums">{(w.totalVotes || 0).toLocaleString()}</span> votes</p>
                                    </div>
                                    {(!w.manifestos || w.manifestos.length === 0) ? (
                                        <CardBody><p className="text-sm text-ink-3">No commitments on record.</p></CardBody>
                                    ) : (
                                        <ul className="divide-y divide-line">
                                            {w.manifestos.map((m) => {
                                                const isFiled = filed.has(String(m._id));
                                                const overdue = !!m.isOverdue;
                                                return (
                                                    <li key={m._id} className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-6">
                                                        <div className="min-w-0">
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                <p className="font-medium text-ink">{m.title}</p>
                                                                {isFiled ? <Badge tone="info">You petitioned</Badge> : overdue ? <Badge tone="danger">Deadline passed</Badge> : <Badge tone="success">Within deadline</Badge>}
                                                            </div>
                                                            {m.summary && <p className="mt-1 text-sm text-ink-2">{m.summary}</p>}
                                                            <p className="mt-1 inline-flex items-center gap-1 text-sm text-ink-3">
                                                                <CalendarClock className="h-4 w-4" aria-hidden="true" />
                                                                {m.dueDate ? `${overdue ? 'Was due' : 'Due'} ${formatDate(m.dueDate)}` : 'No deadline set'}
                                                            </p>
                                                        </div>
                                                        <div className="shrink-0 sm:pl-4">
                                                            {allowPetitions && overdue && !isFiled && (
                                                                <Button variant="danger-outline" size="sm" onClick={() => openPetition(w, m)}>File a petition</Button>
                                                            )}
                                                            {allowPetitions && !overdue && !isFiled && m.dueDate && (
                                                                <p className="text-sm text-ink-3 sm:max-w-[14rem] sm:text-right">You can petition if it isn’t delivered by {formatDate(m.dueDate)}.</p>
                                                            )}
                                                        </div>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    )}
                                </Card>
                            );
                        })}
                    </div>
                )}
            </section>

            {byParty.length > 0 && (
                <Card>
                    <CardHeader title="Votes by party" />
                    <CardBody className="py-1 sm:py-2">
                        <ol className="divide-y divide-line">
                            {byParty.map((p, i) => (
                                <ResultBar key={p.partyName || i} label={p.partyName || 'Independent'} votes={p.votes} total={total} max={maxP} highlight={p.votes > 0 && p.votes === maxP} rank={i + 1} />
                            ))}
                        </ol>
                    </CardBody>
                </Card>
            )}

            <Dialog
                open={!!target}
                onClose={() => !submitting && setTarget(null)}
                title="File a petition"
                description="Petitions are reviewed by the election office. If enough voters petition, the candidate can be removed."
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setTarget(null)} disabled={submitting}>Cancel</Button>
                        <Button onClick={submitPetition} loading={submitting} loadingText="Filing…" disabled={reason.trim().length < 10}>File petition</Button>
                    </>
                }
            >
                {target && (
                    <div className="space-y-4">
                        <div className="rounded-xl border border-line bg-canvas px-4 py-3">
                            <p className="text-xs font-semibold uppercase tracking-wide text-ink-3">Commitment</p>
                            <p className="mt-0.5 font-medium text-ink">{target.title}</p>
                            <p className="text-sm text-ink-2">{target.candidate}</p>
                        </div>
                        <Field id="petition-reason" label="What hasn’t been delivered?" hint="Be specific: what, where and since when." error={reasonError}>
                            <Textarea id="petition-reason" hint error={reasonError} value={reason} onChange={(ev) => { setReason(ev.target.value); setReasonError(''); }} rows={4} maxLength={1000} placeholder="e.g. The water line on Road 4 still isn’t connected, six months after the deadline." />
                            <p className="mt-1.5 flex justify-between gap-3 text-xs text-ink-3" aria-live="polite">
                                <span>{reason.trim().length < 10 ? `${10 - reason.trim().length} more character${10 - reason.trim().length === 1 ? '' : 's'} needed` : 'Looks good.'}</span>
                                <span className="tabular-nums">{reason.length}/1000</span>
                            </p>
                        </Field>
                        <ol className="space-y-1.5 rounded-xl border border-line bg-raised px-4 py-3 text-sm text-ink-2">
                            <li><span className="font-semibold text-ink">1.</span> The election office reads your petition.</li>
                            <li><span className="font-semibold text-ink">2.</span> They accept, reject or dismiss it. You’ll see the decision under My petitions.</li>
                            <li><span className="font-semibold text-ink">3.</span> Enough accepted petitions and the candidate can be removed.</li>
                        </ol>
                        {submitError && <Alert tone="danger">{submitError}</Alert>}
                    </div>
                )}
            </Dialog>
        </>
    );
}
