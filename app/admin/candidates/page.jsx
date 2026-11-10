'use client';
import { useEffect, useState } from 'react';
import { Plus, Search, Users } from 'lucide-react';
import {
    Alert, Badge, Button, Card, CardBody, CardHeader, Checkbox, EmptyState, Field, Input, Loading, PageHeader, Select, StatusBadge, Textarea,
} from '../../components/ui/primitives';
import { Dialog, DataTable, useToast } from '../../components/ui/interactive';

const EMPTY_FORM = { name: '', gender: 'Male', age: '', seat: '', nid: '', phone: '', email: '', partyName: '', independent: false };

function validate(f) {
    const e = {};
    if (f.name.trim().length < 3) e.name = 'Enter the candidate’s full name.';
    if (!/^\S.*-\d+$/.test(f.seat.trim())) e.seat = 'Use the seat format Area-Number, for example Dhaka-10.';
    if (!/^\d{10,17}$/.test(f.nid)) e.nid = 'A National ID number is 10, 13 or 17 digits.';
    if (!/^01\d{9}$/.test(f.phone)) e.phone = 'Enter an 11-digit mobile number starting with 01.';
    if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) e.email = 'Enter an email address like name@example.com.';
    if (f.age && (Number(f.age) < 18 || Number(f.age) > 120)) e.age = 'Candidates must be at least 18.';
    if (!f.independent && !f.partyName.trim()) e.partyName = 'Enter the party, or tick Independent.';
    return e;
}

export default function AdminCandidates() {
    const { notify } = useToast();
    const [list, setList] = useState([]);
    const [state, setState] = useState('loading');
    const [seat, setSeat] = useState('');
    const [search, setSearch] = useState('');
    const [query, setQuery] = useState({ seat: '', search: '' });

    const [adding, setAdding] = useState(false);
    const [form, setForm] = useState(EMPTY_FORM);
    const [errors, setErrors] = useState({});
    const [formError, setFormError] = useState('');
    const [saving, setSaving] = useState(false);

    const [removing, setRemoving] = useState(null);
    const [reason, setReason] = useState('');
    const [reasonError, setReasonError] = useState('');
    const [busy, setBusy] = useState(false);

    // Wait until typing pauses before searching.
    useEffect(() => {
        const t = setTimeout(() => setQuery({ seat: seat.trim(), search: search.trim() }), 300);
        return () => clearTimeout(t);
    }, [seat, search]);

    async function load(q = query) {
        setState('loading');
        try {
            const p = new URLSearchParams();
            if (q.seat) p.set('seat', q.seat);
            if (q.search) p.set('search', q.search);
            const r = await fetch(`/api/admin/candidates?${p}`, { cache: 'no-store' });
            const j = await r.json();
            if (!j.ok) throw new Error();
            setList(j.data || []);
            setState('ready');
        } catch {
            setState('error');
        }
    }

    useEffect(() => {
        load(query);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query]);

    const set = (k) => (ev) => setForm((f) => ({ ...f, [k]: ev.target.type === 'checkbox' ? ev.target.checked : ev.target.value }));

    async function addCandidate(ev) {
        ev.preventDefault();
        setFormError('');
        const e = validate(form);
        setErrors(e);
        if (Object.keys(e).length) return;
        setSaving(true);
        try {
            const r = await fetch('/api/admin/candidates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...form, name: form.name.trim(), seat: form.seat.trim(), email: form.email.trim(), age: form.age ? Number(form.age) : undefined }),
            });
            const j = await r.json();
            if (!j.ok) {
                setFormError(j.error === 'Create failed' ? 'A candidate with this National ID or email already exists.' : j.error || 'The candidate wasn’t added.');
                return;
            }
            notify(`${form.name.trim()} added. Their sign-in details were sent to ${form.email.trim()}.`);
            setForm(EMPTY_FORM);
            setAdding(false);
            load();
        } catch {
            setFormError('We couldn’t reach the server. Please try again.');
        } finally {
            setSaving(false);
        }
    }

    async function removeCandidate() {
        if (reason.trim().length < 10) {
            setReasonError('Explain why in at least 10 characters. This is kept on record.');
            return;
        }
        setBusy(true);
        try {
            const r = await fetch(`/api/admin/candidates/${removing._id}/remove`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason: reason.trim() }),
            });
            const j = await r.json();
            if (!j.ok) throw new Error(j.error);
            notify(`${removing.name} has been removed from the race.`);
            setRemoving(null);
            load();
        } catch (err) {
            setReasonError(err.message || 'The candidate wasn’t removed.');
        } finally {
            setBusy(false);
        }
    }

    return (
        <>
            <PageHeader
                title="Candidates"
                description="Add candidates once their nomination is accepted. Each gets their own sign-in to publish manifestos."
                actions={!adding && <Button onClick={() => setAdding(true)}><Plus className="h-4 w-4" aria-hidden="true" /> Add candidate</Button>}
            />

            {adding && (
                <Card className="mb-8">
                    <CardHeader title="Add a candidate" description="A temporary password is generated and emailed to them. On this demo server, emails go to the server log." />
                    <CardBody>
                        <form noValidate onSubmit={addCandidate} className="space-y-5">
                            {formError && <Alert tone="danger">{formError}</Alert>}
                            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                                <Field id="c-name" label="Full name" error={errors.name}><Input id="c-name" error={errors.name} value={form.name} onChange={set('name')} /></Field>
                                <Field id="c-seat" label="Seat" hint="For example Dhaka-10." error={errors.seat}><Input id="c-seat" hint error={errors.seat} value={form.seat} onChange={set('seat')} /></Field>
                                <Field id="c-nid" label="National ID number" error={errors.nid}><Input id="c-nid" inputMode="numeric" maxLength={17} error={errors.nid} value={form.nid} onChange={(e) => setForm((f) => ({ ...f, nid: e.target.value.replace(/\D/g, '') }))} /></Field>
                                <Field id="c-email" label="Email" hint="They’ll sign in with this." error={errors.email}><Input id="c-email" type="email" hint error={errors.email} value={form.email} onChange={set('email')} /></Field>
                                <Field id="c-phone" label="Mobile number" error={errors.phone}><Input id="c-phone" inputMode="tel" maxLength={11} error={errors.phone} value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value.replace(/\D/g, '') }))} /></Field>
                                <div className="grid grid-cols-2 gap-4">
                                    <Field id="c-age" label="Age" optional error={errors.age}><Input id="c-age" inputMode="numeric" maxLength={3} error={errors.age} value={form.age} onChange={(e) => setForm((f) => ({ ...f, age: e.target.value.replace(/\D/g, '') }))} /></Field>
                                    <Field id="c-gender" label="Gender"><Select id="c-gender" value={form.gender} onChange={set('gender')}>{['Male', 'Female', 'Other'].map((g) => <option key={g}>{g}</option>)}</Select></Field>
                                </div>
                                <Field id="c-party" label="Party" error={errors.partyName}><Input id="c-party" error={errors.partyName} value={form.partyName} disabled={form.independent} onChange={set('partyName')} /></Field>
                                <Checkbox id="c-ind" label="Independent candidate" description="Not standing for a party." checked={form.independent} onChange={set('independent')} className="sm:pt-7" />
                            </div>
                            <div className="flex flex-col-reverse gap-2 border-t border-line pt-5 sm:flex-row sm:justify-end">
                                <Button variant="secondary" onClick={() => { setAdding(false); setErrors({}); setFormError(''); }}>Cancel</Button>
                                <Button type="submit" loading={saving} loadingText="Adding…">Add candidate</Button>
                            </div>
                        </form>
                    </CardBody>
                </Card>
            )}

            <div className="mb-4 grid gap-3 sm:grid-cols-[1fr_14rem]">
                <div className="relative">
                    <label htmlFor="c-search" className="sr-only">Search candidates</label>
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-3" aria-hidden="true" />
                    <Input id="c-search" type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, email, NID or party" className="pl-10" />
                </div>
                <div>
                    <label htmlFor="c-filter-seat" className="sr-only">Filter by seat</label>
                    <Input id="c-filter-seat" value={seat} onChange={(e) => setSeat(e.target.value)} placeholder="Seat, e.g. Dhaka-10" />
                </div>
            </div>

            <Card>
                {state === 'loading' && <CardBody><Loading rows={3} label="Loading candidates…" /></CardBody>}
                {state === 'error' && <CardBody><Alert tone="danger" action={<Button variant="secondary" size="sm" onClick={() => load()}>Try again</Button>}>We couldn’t load candidates.</Alert></CardBody>}
                {state === 'ready' && (
                    <DataTable
                        caption="Candidates" breakpoint="xl"
                        rows={list}
                        empty={<EmptyState icon={Users} title={query.search || query.seat ? 'No candidates match' : 'No candidates yet'}>{query.search || query.seat ? 'Try a different search or seat.' : 'Add the first candidate once nominations are accepted.'}</EmptyState>}
                        columns={[
                            {
                                key: 'name', header: 'Candidate', primary: true,
                                cell: (c) => (
                                    <div className="min-w-0">
                                        <p className="font-medium text-ink">{c.name}</p>
                                        <p className="text-sm font-normal text-ink-3 break-all">{c.email}</p>
                                    </div>
                                ),
                            },
                            { key: 'seat', header: 'Seat', nowrap: true, cell: (c) => c.seat },
                            { key: 'party', header: 'Party', cell: (c) => (c.independent || !c.partyName ? <Badge>Independent</Badge> : c.partyName) },
                            { key: 'phone', header: 'Mobile', nowrap: true, cell: (c) => <span className="tabular-nums">{c.phone}</span> },
                            { key: 'status', header: 'Status', cell: (c) => (c.removed ? <StatusBadge status="removed" /> : c.active ? <Badge tone="success">Standing</Badge> : <Badge>Inactive</Badge>) },
                        ]}
                        actions={(c) => (!c.removed ? <Button size="sm" variant="danger-outline" onClick={() => { setReason(''); setReasonError(''); setRemoving(c); }}>Remove</Button> : null)}
                    />
                )}
            </Card>

            <Dialog
                open={!!removing}
                onClose={() => !busy && setRemoving(null)}
                title={`Remove ${removing?.name || 'candidate'}?`}
                description="They’ll be taken out of the race and can no longer sign in. Votes already cast are kept."
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setRemoving(null)} disabled={busy}>Keep candidate</Button>
                        <Button variant="danger" onClick={removeCandidate} loading={busy} loadingText="Removing…">Remove candidate</Button>
                    </>
                }
            >
                <Field id="rm-reason" label="Reason for removal" hint="This is recorded with the candidate." error={reasonError}>
                    <Textarea id="rm-reason" hint error={reasonError} rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Removed after accepted petitions about missed deadlines." />
                </Field>
            </Dialog>
        </>
    );
}
