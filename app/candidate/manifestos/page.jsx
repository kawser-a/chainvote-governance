'use client';
import { useEffect, useRef, useState } from 'react';
import { FileText, Plus } from 'lucide-react';
import {
    Alert, Button, Card, CardBody, CardHeader, EmptyState, Field, Input, Loading, PageHeader, StatusBadge, Textarea,
} from '../../components/ui/primitives';
import { ConfirmDialog, DataTable, useToast } from '../../components/ui/interactive';
import { formatDate } from '../../components/ui/format';

const LIMITS = { titleMin: 5, titleMax: 120, summaryMin: 10, summaryMax: 1200 };

function dueDate(m) {
    if (!m.createdAt) return null;
    const d = new Date(m.createdAt);
    if (m.targetWindowMinutes) d.setMinutes(d.getMinutes() + m.targetWindowMinutes);
    else if (m.targetWindowMonths) d.setMonth(d.getMonth() + m.targetWindowMonths);
    else return null;
    return d;
}

function windowLabel(m) {
    if (m.targetWindowMinutes) return `${m.targetWindowMinutes} minute${m.targetWindowMinutes === 1 ? '' : 's'} (test)`;
    if (m.targetWindowMonths) return `${m.targetWindowMonths} month${m.targetWindowMonths === 1 ? '' : 's'}`;
    return '—';
}

function Counter({ value, max }) {
    return <span className={value > max ? 'text-danger' : 'text-ink-3'}>{value}/{max}</span>;
}

export default function CandidateManifestos() {
    const { notify } = useToast();
    const [list, setList] = useState([]);
    const [state, setState] = useState('loading');

    const [title, setTitle] = useState('');
    const [summary, setSummary] = useState('');
    const [unit, setUnit] = useState('months');
    const [months, setMonths] = useState('');
    const [minutes, setMinutes] = useState('');
    const [errors, setErrors] = useState({});
    const [formError, setFormError] = useState('');
    const [confirming, setConfirming] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const formRef = useRef(null);
    const titleRef = useRef(null);

    async function load() {
        setState('loading');
        try {
            const r = await fetch('/api/candidate/manifestos', { cache: 'no-store', credentials: 'include' });
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

    function validate() {
        const e = {};
        const t = title.trim();
        const s = summary.trim();
        if (t.length < LIMITS.titleMin) e.title = `Write a title of at least ${LIMITS.titleMin} characters.`;
        else if (t.length > LIMITS.titleMax) e.title = `Keep the title under ${LIMITS.titleMax} characters.`;
        if (s.length < LIMITS.summaryMin) e.summary = `Describe the plan in at least ${LIMITS.summaryMin} characters.`;
        else if (s.length > LIMITS.summaryMax) e.summary = `Keep the description under ${LIMITS.summaryMax} characters.`;
        if (unit === 'months') {
            const n = Number(months);
            if (!Number.isInteger(n) || n < 1 || n > 60) e.months = 'Enter a whole number of months between 1 and 60.';
        } else {
            const n = Number(minutes);
            if (!Number.isInteger(n) || n < 1 || n > 43200) e.minutes = 'Enter a whole number of minutes between 1 and 43,200.';
        }
        return e;
    }

    function review(ev) {
        ev.preventDefault();
        setFormError('');
        const e = validate();
        setErrors(e);
        if (Object.keys(e).length) {
            formRef.current?.querySelector('[aria-invalid="true"]')?.focus();
            return;
        }
        setConfirming(true);
    }

    async function submit() {
        setSubmitting(true);
        setFormError('');
        const body = { title: title.trim(), summary: summary.trim(), durationUnit: unit };
        if (unit === 'months') body.targetWindowMonths = Number(months);
        else body.targetWindowMinutes = Number(minutes);
        try {
            const r = await fetch('/api/candidate/manifestos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(body),
            });
            const j = await r.json();
            if (!j.ok) {
                setFormError(j.error || 'Your manifesto wasn’t submitted. Please try again.');
                setConfirming(false);
                return;
            }
            setConfirming(false);
            setTitle('');
            setSummary('');
            setMonths('');
            setMinutes('');
            setUnit('months');
            notify('Manifesto submitted. The election office will review it.');
            load();
        } catch {
            setFormError('We couldn’t reach the server. Please try again.');
            setConfirming(false);
        } finally {
            setSubmitting(false);
        }
    }

    const counts = list.reduce((acc, m) => ({ ...acc, [m.status]: (acc[m.status] || 0) + 1 }), {});

    return (
        <>
            <PageHeader
                title="Manifestos"
                description="Your written commitments. Each one is reviewed by the election office before voters can see it."
                actions={
                    <Button onClick={() => { formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); titleRef.current?.focus({ preventScroll: true }); }}>
                        <Plus className="h-4 w-4" aria-hidden="true" /> Write a manifesto
                    </Button>
                }
            />

            <Card className="mb-8">
                <CardHeader
                    title="Your manifestos"
                    description={list.length ? `${counts.approved || 0} approved · ${counts.pending || 0} awaiting review · ${counts.rejected || 0} rejected` : undefined}
                />
                {state === 'loading' && <CardBody><Loading rows={2} label="Loading manifestos…" /></CardBody>}
                {state === 'error' && (
                    <CardBody>
                        <Alert tone="danger" action={<Button variant="secondary" size="sm" onClick={load}>Try again</Button>}>We couldn’t load your manifestos.</Alert>
                    </CardBody>
                )}
                {state === 'ready' && (
                    <DataTable
                        caption="Your manifestos"
                        rows={list}
                        empty={<EmptyState icon={FileText} title="You haven’t written any manifestos yet">Use the form below to write your first commitment.</EmptyState>}
                        columns={[
                            {
                                key: 'title', header: 'Manifesto', primary: true,
                                cell: (m) => (
                                    <div className="min-w-0 max-w-xl">
                                        <p className="font-medium text-ink">{m.title}</p>
                                        {m.summary && <p className="mt-0.5 line-clamp-2 text-sm font-normal text-ink-3">{m.summary}</p>}
                                    </div>
                                ),
                            },
                            { key: 'status', header: 'Status', cell: (m) => <StatusBadge status={m.status} /> },
                            { key: 'window', header: 'Deadline', nowrap: true, cell: (m) => windowLabel(m) },
                            { key: 'due', header: 'Due by', nowrap: true, cell: (m) => (dueDate(m) ? formatDate(dueDate(m)) : '—') },
                            { key: 'created', header: 'Submitted', nowrap: true, cell: (m) => formatDate(m.createdAt) },
                        ]}
                    />
                )}
            </Card>

            <Card className="scroll-mt-24" id="new-manifesto">
                <CardHeader title="Write a manifesto" description="Be specific: what you’ll do, where, and how voters will know it’s done." />
                <CardBody>
                    <form ref={formRef} noValidate onSubmit={review} className="max-w-2xl space-y-5">
                        {formError && <Alert tone="danger">{formError}</Alert>}

                        <Field id="m-title" label="Title" hint="A short promise voters can remember." error={errors.title}>
                            <Input ref={titleRef} id="m-title" hint error={errors.title} value={title} maxLength={LIMITS.titleMax + 20} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Clean drinking water for every household" />
                            <p className="mt-1 text-right text-xs"><Counter value={title.trim().length} max={LIMITS.titleMax} /></p>
                        </Field>

                        <Field id="m-summary" label="What you’ll do and why" hint="The problem, your plan, and the benefit to residents." error={errors.summary}>
                            <Textarea id="m-summary" hint error={errors.summary} value={summary} rows={6} onChange={(e) => setSummary(e.target.value)} />
                            <p className="mt-1 text-right text-xs"><Counter value={summary.trim().length} max={LIMITS.summaryMax} /></p>
                        </Field>

                        {unit === 'months' ? (
                            <Field id="m-months" label="Deadline" hint="Months after taking office by which this will be delivered." error={errors.months}>
                                <div className="flex items-center gap-3">
                                    <Input id="m-months" hint error={errors.months} type="number" inputMode="numeric" min={1} max={60} value={months} onChange={(e) => setMonths(e.target.value)} className="max-w-[8rem]" />
                                    <span className="text-ink-2">months</span>
                                </div>
                            </Field>
                        ) : (
                            <Field id="m-minutes" label="Deadline (test)" hint="Minutes from submission. Only for demonstrating petitions." error={errors.minutes}>
                                <div className="flex items-center gap-3">
                                    <Input id="m-minutes" hint error={errors.minutes} type="number" inputMode="numeric" min={1} value={minutes} onChange={(e) => setMinutes(e.target.value)} className="max-w-[8rem]" />
                                    <span className="text-ink-2">minutes</span>
                                </div>
                            </Field>
                        )}

                        <details className="rounded-md border border-line bg-canvas px-4 py-2" open={unit === 'minutes'}>
                            <summary className="min-h-9 pointer-coarse:min-h-11 cursor-pointer py-1 text-sm font-semibold text-ink-2">Testing options</summary>
                            <label className="flex min-h-11 cursor-pointer items-center gap-3 py-2 text-sm text-ink">
                                <input type="checkbox" className="h-5 w-5" checked={unit === 'minutes'} onChange={(e) => setUnit(e.target.checked ? 'minutes' : 'months')} />
                                Set the deadline in minutes, so petitions can be tried out without waiting months
                            </label>
                        </details>

                        <div className="flex flex-col gap-3 border-t border-line pt-5 sm:flex-row sm:items-center">
                            <Button type="submit" size="lg">Review and submit</Button>
                            <p className="text-sm text-ink-3">You can’t edit a manifesto after submitting it, so you’ll see a preview first.</p>
                        </div>
                    </form>
                </CardBody>
            </Card>

            <ConfirmDialog
                open={confirming}
                onCancel={() => setConfirming(false)}
                onConfirm={submit}
                loading={submitting}
                title="Submit this manifesto?"
                description="It goes to the election office for review. You won’t be able to edit it afterwards."
                confirmLabel="Submit for review"
                cancelLabel="Keep editing"
            >
                <div className="rounded-md border border-line bg-canvas p-4">
                    <p className="font-semibold text-ink">{title.trim()}</p>
                    <p className="mt-2 whitespace-pre-wrap text-[15px] text-ink-2">{summary.trim()}</p>
                    <p className="mt-3 text-sm text-ink-3">
                        Deadline: {unit === 'months' ? `${months} month${Number(months) === 1 ? '' : 's'} after taking office` : `${minutes} minutes (test)`}
                    </p>
                </div>
            </ConfirmDialog>
        </>
    );
}
