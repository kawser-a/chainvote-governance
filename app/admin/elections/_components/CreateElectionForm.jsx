'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Building2, Check, Flag, Landmark, MapPinned, MessageSquareQuote, Plus, Scale, Trash2, X } from 'lucide-react';
import { Alert, Button, Card, CardBody, CardHeader, Checkbox, Field, Input, Select, Textarea, cx } from '../../../components/ui/primitives';
import { ConfirmDialog } from '../../../components/ui/interactive';
import { formatDateTime } from '../../../components/ui/format';

const TYPES = [
    { value: 'national', label: 'National', icon: Landmark, help: 'Parliamentary seats. Voters back candidates’ manifestos.' },
    { value: 'local', label: 'Local', icon: Building2, help: 'Councillor, chairman or mayor. Voters pick one candidate.' },
    { value: 'presidential', label: 'Presidential', icon: Flag, help: 'Chosen by all voters, or by MPs only.' },
    { value: 'decision', label: 'Decision', icon: Scale, help: 'A question put to everyone eligible.' },
    { value: 'policy', label: 'Policy', icon: MessageSquareQuote, help: 'A policy voters agree or disagree with.' },
    { value: 'constituent', label: 'Constituent', icon: MapPinned, help: 'A proposal for one constituency.' },
];
const BALLOTS = [
    { value: 'manifesto', label: 'Manifestos', help: 'Voters tick the commitments they support.' },
    { value: 'candidate', label: 'Candidates', help: 'Voters pick one candidate.' },
    { value: 'proposal', label: 'Proposals', help: 'Voters answer each proposal: agree, agree with conditions, or disagree.' },
];
const LOCAL_LEVELS = ['councillor', 'chairman', 'mayor'];
const SCOPES = [
    ['seat', 'Voters in the chosen seats'],
    ['location', 'Voters in the location below'],
    ['country', 'Every voter in the country'],
    ['role', 'Only voters with a role (e.g. MP)'],
    ['all', 'Everyone enrolled'],
];
const DURATIONS = [
    ['2 hours', 2 * 3600e3],
    ['1 day', 86400e3],
    ['3 days', 3 * 86400e3],
    ['1 week', 7 * 86400e3],
];

// <input type="datetime-local"> wants local time as YYYY-MM-DDTHH:mm.
function toLocalInput(d) {
    const p = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

function describeSpan(ms) {
    if (!(ms > 0)) return null;
    const h = Math.round(ms / 3600e3);
    if (h < 1) return `${Math.round(ms / 60000)} minutes`;
    if (h < 48) return `${h} hour${h === 1 ? '' : 's'}`;
    const d = Math.round(h / 24);
    return `${d} day${d === 1 ? '' : 's'}`;
}

function Section({ n, title, description, children }) {
    return (
        <section className="grid gap-4 border-t border-line pt-6 first:border-0 first:pt-0 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-8">
            <div>
                <p className="flex items-center gap-2 font-semibold text-ink">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-soft text-xs font-semibold text-accent-ink">{n}</span>
                    {title}
                </p>
                {description && <p className="mt-1 text-sm text-ink-3">{description}</p>}
            </div>
            <div className="min-w-0 space-y-5">{children}</div>
        </section>
    );
}

function Chip({ active, onClick, children }) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={active}
            className={cx(
                'inline-flex min-h-9 pointer-coarse:min-h-11 items-center gap-1.5 rounded-full border px-3 text-sm font-medium transition-colors active:scale-[0.97]',
                active ? 'border-brand bg-brand-soft text-brand-ink' : 'border-line-strong text-ink-2 hover:border-ink-3 hover:text-ink'
            )}
        >
            {active && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
            {children}
        </button>
    );
}

/* Pick seats from the voter roll (with how many voters each has) or type a new one. */
function SeatPicker({ known, value, onChange, error }) {
    const [draft, setDraft] = useState('');
    const add = (s) => {
        const v = s.trim();
        if (v && !value.includes(v)) onChange([...value, v]);
        setDraft('');
    };
    const toggle = (s) => onChange(value.includes(s) ? value.filter((x) => x !== s) : [...value, s]);
    const custom = value.filter((s) => !known.some((k) => k.seat === s));

    return (
        <Field id="el-seat-add" label="Seats" hint="Pick from the voter roll, or type a seat and press Enter." error={error}>
            {known.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2" role="group" aria-label="Seats on the voter roll">
                    {known.map((k) => (
                        <Chip key={k.seat} active={value.includes(k.seat)} onClick={() => toggle(k.seat)}>
                            {k.seat}
                            <span className="text-xs font-normal text-ink-3">{k.registered} enrolled</span>
                        </Chip>
                    ))}
                </div>
            )}
            <div className="flex gap-2">
                <Input
                    id="el-seat-add"
                    hint
                    error={error}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ',') {
                            e.preventDefault();
                            add(draft);
                        }
                    }}
                    placeholder="e.g. Khulna-1"
                />
                <Button variant="secondary" onClick={() => add(draft)} disabled={!draft.trim()}>Add</Button>
            </div>
            {custom.length > 0 && (
                <ul className="mt-3 flex flex-wrap gap-2">
                    {custom.map((s) => (
                        <li key={s}>
                            <span className="inline-flex items-center gap-1 rounded-full border border-line-strong bg-raised py-1 pl-3 pr-1 text-sm text-ink">
                                {s}
                                <button type="button" onClick={() => toggle(s)} className="inline-flex h-6 w-6 items-center justify-center rounded-full text-ink-3 hover:bg-subtle hover:text-ink" aria-label={`Remove ${s}`}>
                                    <X className="h-3.5 w-3.5" aria-hidden="true" />
                                </button>
                            </span>
                        </li>
                    ))}
                </ul>
            )}
            {custom.length > 0 && <p className="mt-2 text-sm text-accent-ink">No voters are registered in {custom.join(', ')} yet.</p>}
        </Field>
    );
}

export default function CreateElectionForm({ createElection, onDone, onCancel }) {
    const [name, setName] = useState('');
    const [type, setType] = useState('national');
    const [voteMode, setVoteMode] = useState('direct');
    const [level, setLevel] = useState('councillor');
    const [ballotType, setBallotType] = useState('manifesto');
    const [multiSelect, setMultiSelect] = useState(true);
    const [startAt, setStartAt] = useState('');
    const [endAt, setEndAt] = useState('');
    const [seats, setSeats] = useState([]);
    const [knownSeats, setKnownSeats] = useState([]);
    const [ballotCount, setBallotCount] = useState(null);
    const [location, setLocation] = useState({ division: '', district: '', upazila: '', union: '', ward: '', city: '' });
    const [advOpen, setAdvOpen] = useState(false);
    const [eligScope, setEligScope] = useState('seat');
    const [eligRoles, setEligRoles] = useState('');
    const [eligRequireEnrolled, setEligRequireEnrolled] = useState(true);
    const [eligCanVoteOnly, setEligCanVoteOnly] = useState(true);
    const [eligMinAge, setEligMinAge] = useState('18');
    const [proposals, setProposals] = useState([]);
    const [autoBuildBallot, setAutoBuildBallot] = useState(true);
    const [errors, setErrors] = useState({});
    const [formError, setFormError] = useState('');
    const [confirming, setConfirming] = useState(false);
    const [saving, setSaving] = useState(false);
    const formRef = useRef(null);

    useEffect(() => {
        fetch('/api/admin/stats', { cache: 'no-store' })
            .then((r) => r.json())
            .then((j) => j?.ok && setKnownSeats((j.seats || []).filter((s) => s.seat).sort((a, b) => a.seat.localeCompare(b.seat))))
            .catch(() => {});
    }, []);

    // Sensible defaults for each kind of election; everything stays editable.
    useEffect(() => {
        if (type === 'national') { setBallotType('manifesto'); setMultiSelect(true); setEligScope('seat'); setVoteMode('direct'); }
        else if (type === 'presidential') { setBallotType('candidate'); setMultiSelect(false); setVoteMode('indirect'); setEligScope('role'); setEligRoles('MP'); }
        else if (type === 'local') { setBallotType('candidate'); setMultiSelect(false); setEligScope('location'); }
        else { setBallotType('proposal'); setMultiSelect(false); setEligScope('all'); setVoteMode('direct'); }
    }, [type]);

    useEffect(() => {
        if (ballotType === 'manifesto') setMultiSelect(true);
        if (ballotType === 'candidate') setMultiSelect(false);
        if (ballotType === 'proposal') setProposals((ps) => (ps.length ? ps : [{ title: '', reason: '', impact: '', costOrTime: '', options: [] }]));
    }, [ballotType]);

    // Tell the official how full the ballot will be before they create it.
    useEffect(() => {
        if (ballotType !== 'manifesto' || !autoBuildBallot || seats.length === 0) {
            setBallotCount(null);
            return;
        }
        let alive = true;
        Promise.all(
            seats.map((s) =>
                fetch(`/api/admin/manifestos?status=approved&limit=5&seat=${encodeURIComponent(s)}`, { cache: 'no-store' })
                    .then((r) => r.json())
                    .then((j) => (j.ok ? j.total || 0 : 0))
                    .catch(() => 0)
            )
        ).then((counts) => alive && setBallotCount(counts.reduce((a, b) => a + b, 0)));
        return () => { alive = false; };
    }, [seats, ballotType, autoBuildBallot]);

    function eligibility() {
        if (!advOpen) {
            if (type === 'national') return { scope: 'seat', seats, roles: [], requireEnrolled: true, canVoteOnly: true, minAge: 18 };
            if (type === 'presidential') {
                return voteMode === 'indirect'
                    ? { scope: 'role', roles: ['MP'], requireEnrolled: true, canVoteOnly: true, minAge: 18 }
                    : { scope: 'country', roles: [], requireEnrolled: true, canVoteOnly: true, minAge: 18 };
            }
            if (type === 'local') return { scope: 'location', roles: [], requireEnrolled: true, canVoteOnly: true, minAge: 18 };
            return { scope: 'all', roles: [], requireEnrolled: true, canVoteOnly: true, minAge: 18 };
        }
        return {
            scope: eligScope,
            seats: eligScope === 'seat' ? seats : [],
            roles: eligRoles.split(',').map((s) => s.trim()).filter(Boolean),
            requireEnrolled: !!eligRequireEnrolled,
            canVoteOnly: !!eligCanVoteOnly,
            minAge: Number(eligMinAge) || 18,
        };
    }

    function validate() {
        const e = {};
        if (name.trim().length < 3) e.name = 'Give the election a name voters will recognise.';
        if (!startAt) e.startAt = 'Choose when voting opens.';
        if (!endAt) e.endAt = 'Choose when voting closes.';
        if (startAt && endAt && new Date(endAt) <= new Date(startAt)) e.endAt = 'Voting must close after it opens.';
        if (startAt && new Date(startAt) < new Date(Date.now() - 5 * 60000)) e.startAt = 'That time has already passed. Choose now or later.';
        const scope = advOpen ? eligScope : eligibility().scope;
        if (scope === 'seat' && seats.length === 0) e.seats = 'Choose at least one seat.';
        if (ballotType === 'proposal') {
            if (proposals.length === 0) e.proposals = 'Add at least one proposal for voters to answer.';
            else if (proposals.some((p) => !p.title.trim())) e.proposals = 'Every proposal needs a title.';
        }
        return e;
    }

    function review(ev) {
        ev.preventDefault();
        setFormError('');
        const e = validate();
        setErrors(e);
        if (Object.keys(e).length) {
            setTimeout(() => formRef.current?.querySelector('[aria-invalid="true"], [data-error]')?.focus(), 0);
            return;
        }
        setConfirming(true);
    }

    async function create() {
        setSaving(true);
        try {
            await createElection({
                name: name.trim(),
                type,
                voteMode,
                level: type === 'local' ? level || null : null,
                seats,
                location: type === 'local' ? location : {},
                eligibility: eligibility(),
                ballotType,
                multiSelect,
                startAt,
                endAt,
                status: 'scheduled',
                proposals: ballotType === 'proposal' ? proposals : [],
                autoBuildBallot: ballotType === 'manifesto' ? autoBuildBallot : false,
            });
            setConfirming(false);
            onDone?.(name.trim());
        } catch (err) {
            setConfirming(false);
            setFormError(err.message || 'The election wasn’t created. Please try again.');
        } finally {
            setSaving(false);
        }
    }

    const setStartPreset = (d) => {
        setStartAt(toLocalInput(d));
        if (endAt && new Date(endAt) <= d) setEndAt('');
    };
    const setDuration = (ms) => {
        const base = startAt ? new Date(startAt) : new Date();
        if (!startAt) setStartAt(toLocalInput(base));
        setEndAt(toLocalInput(new Date(base.getTime() + ms)));
    };
    const tomorrow9 = (() => {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        d.setHours(9, 0, 0, 0);
        return d;
    })();

    const updateProposal = (i, patch) => setProposals((ps) => ps.map((p, j) => (j === i ? { ...p, ...patch } : p)));
    const typeInfo = TYPES.find((t) => t.value === type);
    const showSeats = (advOpen ? eligScope : eligibility().scope) === 'seat';
    const span = startAt && endAt ? describeSpan(new Date(endAt) - new Date(startAt)) : null;
    const eligibleVoters = useMemo(
        () => knownSeats.filter((k) => seats.includes(k.seat)).reduce((a, k) => a + (k.registered || 0), 0),
        [knownSeats, seats]
    );

    return (
        <Card className="mb-8 animate-rise">
            <CardHeader title="New election" description="It’s saved as Upcoming. Voters can read the ballot, and voting opens at the time you set." />
            <CardBody>
                <form ref={formRef} noValidate onSubmit={review} className="space-y-6">
                    {formError && <Alert tone="danger">{formError}</Alert>}

                    <Section n="1" title="What kind" description="This sets sensible defaults below. You can change any of them.">
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3" role="radiogroup" aria-label="Kind of election">
                            {TYPES.map((t) => {
                                const active = t.value === type;
                                return (
                                    <label
                                        key={t.value}
                                        className={cx(
                                            'relative flex cursor-pointer flex-col gap-1 rounded-xl border p-3 transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus',
                                            active ? 'border-brand bg-brand-soft' : 'border-line bg-raised hover:border-line-strong hover:bg-subtle'
                                        )}
                                    >
                                        <input type="radio" name="el-type" value={t.value} checked={active} onChange={() => setType(t.value)} className="sr-only" />
                                        <t.icon className={cx('h-5 w-5', active ? 'text-brand' : 'text-ink-3')} aria-hidden="true" />
                                        <span className="text-sm font-semibold text-ink">{t.label}</span>
                                        <span className="text-xs leading-snug text-ink-3">{t.help}</span>
                                    </label>
                                );
                            })}
                        </div>
                        <Field id="el-name" label="Election name" hint="Voters see this exactly as you write it." error={errors.name}>
                            <Input id="el-name" hint error={errors.name} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Dhaka-10 Ward Councillor Election 2026" />
                        </Field>
                        {(type === 'presidential' || type === 'local') && (
                            <div className="grid gap-5 sm:grid-cols-2">
                                {type === 'presidential' && (
                                    <Field id="el-mode" label="Who votes">
                                        <Select id="el-mode" value={voteMode} onChange={(e) => setVoteMode(e.target.value)}>
                                            <option value="direct">All voters (direct)</option>
                                            <option value="indirect">MPs only (indirect)</option>
                                        </Select>
                                    </Field>
                                )}
                                {type === 'local' && (
                                    <Field id="el-level" label="Position">
                                        <Select id="el-level" value={level} onChange={(e) => setLevel(e.target.value)}>
                                            {LOCAL_LEVELS.map((l) => <option key={l} value={l}>{l[0].toUpperCase() + l.slice(1)}</option>)}
                                        </Select>
                                    </Field>
                                )}
                            </div>
                        )}
                    </Section>

                    <Section n="2" title="Who votes" description={showSeats && seats.length > 0 ? `${eligibleVoters} enrolled voter${eligibleVoters === 1 ? '' : 's'} in the chosen seats.` : undefined}>
                        {showSeats && <SeatPicker known={knownSeats} value={seats} onChange={setSeats} error={errors.seats} />}
                        {!showSeats && !advOpen && (
                            <p className="text-[15px] text-ink-2">
                                {eligibility().scope === 'role' && 'Only voters with the MP role.'}
                                {eligibility().scope === 'country' && 'Every enrolled voter in the country.'}
                                {eligibility().scope === 'location' && 'Enrolled voters in the location below.'}
                                {eligibility().scope === 'all' && 'Everyone who has enrolled.'}
                            </p>
                        )}

                        {type === 'local' && (
                            <fieldset>
                                <legend className="text-sm font-semibold text-ink">Location</legend>
                                <div className="mt-2 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {Object.keys(location).map((k) => (
                                        <Field key={k} id={`loc-${k}`} label={k[0].toUpperCase() + k.slice(1)} optional>
                                            <Input id={`loc-${k}`} value={location[k]} onChange={(e) => setLocation((l) => ({ ...l, [k]: e.target.value }))} />
                                        </Field>
                                    ))}
                                </div>
                            </fieldset>
                        )}

                        <div className="rounded-xl border border-line">
                            <button
                                type="button"
                                onClick={() => setAdvOpen((o) => !o)}
                                aria-expanded={advOpen}
                                className="flex min-h-11 w-full items-center justify-between rounded-xl px-4 text-left text-sm font-semibold text-ink transition-colors hover:bg-subtle"
                            >
                                More eligibility rules
                                <span className="text-ink-3">{advOpen ? 'Hide' : 'Show'}</span>
                            </button>
                            {advOpen && (
                                <div className="grid animate-fade gap-4 border-t border-line p-4 sm:grid-cols-2">
                                    <Field id="el-scope" label="Eligible voters">
                                        <Select id="el-scope" value={eligScope} onChange={(e) => setEligScope(e.target.value)}>
                                            {SCOPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                                        </Select>
                                    </Field>
                                    {eligScope === 'role' && (
                                        <Field id="el-roles" label="Roles" hint="Separate with commas.">
                                            <Input id="el-roles" hint value={eligRoles} onChange={(e) => setEligRoles(e.target.value)} />
                                        </Field>
                                    )}
                                    <Field id="el-minage" label="Minimum age">
                                        <Input id="el-minage" inputMode="numeric" value={eligMinAge} onChange={(e) => setEligMinAge(e.target.value.replace(/\D/g, ''))} className="max-w-[8rem]" />
                                    </Field>
                                    <Checkbox id="el-req" label="Voters must be enrolled" checked={eligRequireEnrolled} onChange={(e) => setEligRequireEnrolled(e.target.checked)} />
                                    <Checkbox id="el-canvote" label="Exclude voters who are banned or have voting disabled" checked={eligCanVoteOnly} onChange={(e) => setEligCanVoteOnly(e.target.checked)} />
                                </div>
                            )}
                        </div>
                    </Section>

                    <Section n="3" title="When" description={span ? `Voting stays open for ${span}.` : 'Use a shortcut or pick exact times.'}>
                        <div className="grid gap-5 sm:grid-cols-2">
                            <div>
                                <Field id="el-start" label="Voting opens" error={errors.startAt}>
                                    <Input id="el-start" type="datetime-local" error={errors.startAt} value={startAt} onChange={(e) => setStartAt(e.target.value)} />
                                </Field>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    <Chip onClick={() => setStartPreset(new Date(Date.now() + 60000))}>In a minute</Chip>
                                    <Chip onClick={() => setStartPreset(new Date(Date.now() + 3600e3))}>In an hour</Chip>
                                    <Chip onClick={() => setStartPreset(tomorrow9)}>Tomorrow 9 am</Chip>
                                </div>
                            </div>
                            <div>
                                <Field id="el-end" label="Voting closes" error={errors.endAt}>
                                    <Input id="el-end" type="datetime-local" error={errors.endAt} value={endAt} min={startAt || undefined} onChange={(e) => setEndAt(e.target.value)} />
                                </Field>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {DURATIONS.map(([l, ms]) => (
                                        <Chip key={l} active={startAt && endAt && Math.abs(new Date(endAt) - new Date(startAt) - ms) < 60000} onClick={() => setDuration(ms)}>
                                            {l}
                                        </Chip>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </Section>

                    <Section n="4" title="Ballot" description={BALLOTS.find((b) => b.value === ballotType)?.help}>
                        <div className="flex flex-wrap gap-2" role="group" aria-label="Ballot type">
                            {BALLOTS.map((b) => (
                                <Chip key={b.value} active={ballotType === b.value} onClick={() => setBallotType(b.value)}>{b.label}</Chip>
                            ))}
                        </div>
                        <Checkbox
                            id="el-multi"
                            label="Let voters choose more than one"
                            description={ballotType === 'manifesto' ? 'Usual for manifesto ballots, where voters back several commitments.' : 'Usually off, so each voter picks one.'}
                            checked={multiSelect}
                            onChange={(e) => setMultiSelect(e.target.checked)}
                        />
                        {ballotType === 'manifesto' && (
                            <div>
                                <Checkbox
                                    id="el-auto"
                                    label="Fill the ballot automatically"
                                    description="Adds every approved manifesto from candidates in the chosen seats. You can rebuild it later."
                                    checked={autoBuildBallot}
                                    onChange={(e) => setAutoBuildBallot(e.target.checked)}
                                />
                                {ballotCount !== null && (
                                    <p className={cx('ml-8 mt-1 text-sm', ballotCount ? 'text-brand-ink' : 'text-accent-ink')}>
                                        {ballotCount
                                            ? `${ballotCount} approved manifesto${ballotCount === 1 ? '' : 's'} will be added.`
                                            : 'No approved manifestos in these seats yet. The ballot will start empty.'}
                                    </p>
                                )}
                            </div>
                        )}

                        {ballotType === 'proposal' && (
                            <fieldset data-error={errors.proposals ? true : undefined} tabIndex={errors.proposals ? -1 : undefined}>
                                <legend className="sr-only">Proposals</legend>
                                {errors.proposals && <p className="mb-2 text-sm font-medium text-danger">{errors.proposals}</p>}
                                <div className="space-y-4">
                                    {proposals.map((p, i) => (
                                        <div key={i} className="animate-rise rounded-xl border border-line bg-raised p-4">
                                            <div className="mb-3 flex items-center justify-between">
                                                <p className="text-sm font-semibold text-ink">Proposal {i + 1}</p>
                                                {proposals.length > 1 && (
                                                    <Button variant="ghost" size="sm" onClick={() => setProposals((ps) => ps.filter((_, j) => j !== i))}>
                                                        <Trash2 className="h-4 w-4" aria-hidden="true" /> Remove
                                                    </Button>
                                                )}
                                            </div>
                                            <div className="grid gap-4 sm:grid-cols-2">
                                                <Field id={`p-${i}-title`} label="Question or title"><Input id={`p-${i}-title`} value={p.title} onChange={(e) => updateProposal(i, { title: e.target.value })} placeholder="e.g. Renovate the ward park" /></Field>
                                                <Field id={`p-${i}-cost`} label="Cost and time" optional><Input id={`p-${i}-cost`} value={p.costOrTime} onChange={(e) => updateProposal(i, { costOrTime: e.target.value })} /></Field>
                                                <Field id={`p-${i}-reason`} label="Why it’s needed" optional><Textarea id={`p-${i}-reason`} rows={3} value={p.reason} onChange={(e) => updateProposal(i, { reason: e.target.value })} /></Field>
                                                <Field id={`p-${i}-impact`} label="Expected impact" optional><Textarea id={`p-${i}-impact`} rows={3} value={p.impact} onChange={(e) => updateProposal(i, { impact: e.target.value })} /></Field>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <Button variant="secondary" size="sm" className="mt-3" onClick={() => setProposals((p) => [...p, { title: '', reason: '', impact: '', costOrTime: '', options: [] }])}>
                                    <Plus className="h-4 w-4" aria-hidden="true" /> Add another proposal
                                </Button>
                            </fieldset>
                        )}
                    </Section>

                    <div className="flex flex-col-reverse gap-2 border-t border-line pt-5 sm:flex-row sm:justify-end">
                        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
                        <Button type="submit">Review and create</Button>
                    </div>
                </form>
            </CardBody>

            <ConfirmDialog
                open={confirming}
                onCancel={() => setConfirming(false)}
                onConfirm={create}
                loading={saving}
                title="Create this election?"
                description="Check the details. You can still pause, rebuild the ballot or end it early later."
                confirmLabel="Create election"
                cancelLabel="Keep editing"
            >
                <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                    {[
                        ['Name', name.trim()],
                        ['Kind', typeInfo?.label],
                        ['Ballot', `${BALLOTS.find((b) => b.value === ballotType)?.label}${multiSelect ? ', several choices allowed' : ', one choice'}`],
                        ['Voting opens', startAt ? formatDateTime(startAt) : '—'],
                        ['Voting closes', endAt ? `${formatDateTime(endAt)}${span ? ` (${span})` : ''}` : '—'],
                        showSeats ? ['Seats', `${seats.join(', ')} · ${eligibleVoters} enrolled`] : null,
                        ballotType === 'manifesto' && ballotCount !== null ? ['On the ballot', `${ballotCount} manifesto${ballotCount === 1 ? '' : 's'}`] : null,
                        ballotType === 'proposal' ? ['Proposals', String(proposals.length)] : null,
                    ].filter(Boolean).map(([k, v]) => (
                        <div key={k}>
                            <dt className="text-xs font-semibold uppercase tracking-wide text-ink-3">{k}</dt>
                            <dd className="mt-0.5 text-ink break-words">{v}</dd>
                        </div>
                    ))}
                </dl>
                {ballotType === 'manifesto' && ballotCount === 0 && (
                    <Alert tone="warning" className="mt-4">The ballot will be empty until manifestos are approved and you rebuild it.</Alert>
                )}
            </ConfirmDialog>
        </Card>
    );
}
