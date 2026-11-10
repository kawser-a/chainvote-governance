'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Alert, Button, Card, CardBody, CardHeader, Checkbox, Field, Input, Select, Textarea, cx } from '../../../components/ui/primitives';
import { ConfirmDialog } from '../../../components/ui/interactive';
import { formatDateTime } from '../../../components/ui/format';

const TYPES = [
    { value: 'national', label: 'National', help: 'Parliamentary seats. Voters choose between candidates’ manifestos for their seat.' },
    { value: 'local', label: 'Local', help: 'Councillor, chairman or mayor for an area. Voters choose one candidate.' },
    { value: 'presidential', label: 'Presidential', help: 'Chosen directly by voters, or indirectly by MPs.' },
    { value: 'decision', label: 'Decision', help: 'A yes/no style question put to everyone eligible.' },
    { value: 'policy', label: 'Policy', help: 'A policy proposal voters agree or disagree with.' },
    { value: 'constituent', label: 'Constituent', help: 'A proposal for a constituency, answered by its voters.' },
];
const BALLOTS = [
    { value: 'manifesto', label: 'Manifesto ballot', help: 'Voters pick the commitments they support.' },
    { value: 'candidate', label: 'Candidate ballot', help: 'Voters pick one candidate.' },
    { value: 'proposal', label: 'Proposal ballot', help: 'Voters answer each proposal (agree, agree with conditions, disagree).' },
];
const LOCAL_LEVELS = ['councillor', 'chairman', 'mayor'];
const SCOPES = [
    ['seat', 'Voters in the listed seats'],
    ['location', 'Voters in the location below'],
    ['country', 'Every voter in the country'],
    ['role', 'Only voters with a role (e.g. MP)'],
    ['all', 'Everyone enrolled'],
];

export default function CreateElectionForm({ createElection, onDone, onCancel }) {
    const [name, setName] = useState('');
    const [type, setType] = useState('national');
    const [voteMode, setVoteMode] = useState('direct');
    const [level, setLevel] = useState('councillor');
    const [ballotType, setBallotType] = useState('manifesto');
    const [multiSelect, setMultiSelect] = useState(true);
    const [startAt, setStartAt] = useState('');
    const [endAt, setEndAt] = useState('');
    const [seatsInput, setSeatsInput] = useState('');
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
    }, [ballotType]);

    const seats = useMemo(() => seatsInput.split(',').map((s) => s.trim()).filter(Boolean), [seatsInput]);

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
        const scope = advOpen ? eligScope : eligibility().scope;
        if (scope === 'seat' && seats.length === 0) e.seats = 'List at least one seat, for example Dhaka-10.';
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

    const updateProposal = (i, patch) => setProposals((ps) => ps.map((p, j) => (j === i ? { ...p, ...patch } : p)));
    const typeInfo = TYPES.find((t) => t.value === type);
    const showSeats = (advOpen ? eligScope : eligibility().scope) === 'seat';

    return (
        <Card className="mb-8">
            <CardHeader title="New election" description="It’s created as Upcoming. Voters can see it, and voting opens at the start time you set." />
            <CardBody>
                <form ref={formRef} noValidate onSubmit={review} className="space-y-6">
                    {formError && <Alert tone="danger">{formError}</Alert>}

                    <div className="grid gap-5 md:grid-cols-2">
                        <Field id="el-name" label="Election name" error={errors.name} className="md:col-span-2">
                            <Input id="el-name" error={errors.name} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Dhaka-10 Ward Councillor Election 2026" />
                        </Field>
                        <Field id="el-type" label="Kind of election" hint={typeInfo?.help}>
                            <Select id="el-type" hint value={type} onChange={(e) => setType(e.target.value)}>
                                {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                            </Select>
                        </Field>
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
                        <Field id="el-ballot" label="Ballot" hint={BALLOTS.find((b) => b.value === ballotType)?.help}>
                            <Select id="el-ballot" hint value={ballotType} onChange={(e) => setBallotType(e.target.value)}>
                                {BALLOTS.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
                            </Select>
                        </Field>
                        <Field id="el-start" label="Voting opens" error={errors.startAt}>
                            <Input id="el-start" type="datetime-local" error={errors.startAt} value={startAt} onChange={(e) => setStartAt(e.target.value)} />
                        </Field>
                        <Field id="el-end" label="Voting closes" error={errors.endAt}>
                            <Input id="el-end" type="datetime-local" error={errors.endAt} value={endAt} min={startAt || undefined} onChange={(e) => setEndAt(e.target.value)} />
                        </Field>
                        <Checkbox
                            id="el-multi"
                            className="md:col-span-2"
                            label="Let voters choose more than one option"
                            description={ballotType === 'manifesto' ? 'Usual for manifesto ballots, where voters back several commitments.' : 'Usually off, so each voter picks one.'}
                            checked={multiSelect}
                            onChange={(e) => setMultiSelect(e.target.checked)}
                        />
                    </div>

                    {showSeats && (
                        <Field id="el-seats" label="Seats" hint="Separate seats with commas." error={errors.seats}>
                            <Textarea id="el-seats" hint error={errors.seats} rows={2} value={seatsInput} onChange={(e) => setSeatsInput(e.target.value)} placeholder="Dhaka-10, Dhaka-11, Khulna-1" />
                            {seats.length > 0 && <p className="mt-1.5 text-sm text-ink-3">{seats.length} seat{seats.length === 1 ? '' : 's'}: {seats.join(', ')}</p>}
                        </Field>
                    )}
                    {ballotType === 'manifesto' && (
                        <Checkbox
                            id="el-auto"
                            label="Fill the ballot automatically"
                            description="Adds every approved manifesto from candidates in these seats. You can rebuild it later."
                            checked={autoBuildBallot}
                            onChange={(e) => setAutoBuildBallot(e.target.checked)}
                        />
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

                    {ballotType === 'proposal' && (
                        <fieldset data-error={errors.proposals ? true : undefined} tabIndex={errors.proposals ? -1 : undefined}>
                            <div className="flex items-center justify-between gap-3">
                                <legend className="text-sm font-semibold text-ink">Proposals</legend>
                                <Button variant="secondary" size="sm" onClick={() => setProposals((p) => [...p, { title: '', reason: '', impact: '', costOrTime: '', options: [] }])}>
                                    <Plus className="h-4 w-4" aria-hidden="true" /> Add proposal
                                </Button>
                            </div>
                            {errors.proposals && <p className="mt-2 text-sm font-medium text-danger">{errors.proposals}</p>}
                            <p className="mt-1 text-sm text-ink-3">Voters answer each proposal with Agree, Agree with conditions or Disagree.</p>
                            <div className="mt-3 space-y-4">
                                {proposals.map((p, i) => (
                                    <div key={i} className="rounded-md border border-line bg-canvas p-4">
                                        <div className="mb-3 flex items-center justify-between">
                                            <p className="text-sm font-semibold text-ink">Proposal {i + 1}</p>
                                            <Button variant="ghost" size="sm" onClick={() => setProposals((ps) => ps.filter((_, j) => j !== i))}>
                                                <Trash2 className="h-4 w-4" aria-hidden="true" /> Remove
                                            </Button>
                                        </div>
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <Field id={`p-${i}-title`} label="Title"><Input id={`p-${i}-title`} value={p.title} onChange={(e) => updateProposal(i, { title: e.target.value })} /></Field>
                                            <Field id={`p-${i}-cost`} label="Cost and time" optional><Input id={`p-${i}-cost`} value={p.costOrTime} onChange={(e) => updateProposal(i, { costOrTime: e.target.value })} /></Field>
                                            <Field id={`p-${i}-reason`} label="Why it’s needed" optional><Textarea id={`p-${i}-reason`} rows={3} value={p.reason} onChange={(e) => updateProposal(i, { reason: e.target.value })} /></Field>
                                            <Field id={`p-${i}-impact`} label="Expected impact" optional><Textarea id={`p-${i}-impact`} rows={3} value={p.impact} onChange={(e) => updateProposal(i, { impact: e.target.value })} /></Field>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </fieldset>
                    )}

                    <div className="rounded-md border border-line">
                        <button
                            type="button"
                            onClick={() => setAdvOpen((o) => !o)}
                            aria-expanded={advOpen}
                            className="flex min-h-11 w-full items-center justify-between px-4 text-left text-sm font-semibold text-ink hover:bg-subtle"
                        >
                            Who can vote (advanced)
                            <span className="text-ink-3">{advOpen ? 'Hide' : 'Show'}</span>
                        </button>
                        {advOpen && (
                            <div className="grid gap-4 border-t border-line p-4 sm:grid-cols-2">
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
                confirmLabel="Create election"
                cancelLabel="Keep editing"
            >
                <dl className={cx('grid grid-cols-1 gap-3 text-sm sm:grid-cols-2')}>
                    {[
                        ['Name', name.trim()],
                        ['Kind', typeInfo?.label],
                        ['Ballot', `${BALLOTS.find((b) => b.value === ballotType)?.label}${multiSelect ? ', several choices allowed' : ', one choice'}`],
                        ['Voting opens', startAt ? formatDateTime(startAt) : '—'],
                        ['Voting closes', endAt ? formatDateTime(endAt) : '—'],
                        showSeats ? ['Seats', seats.join(', ')] : null,
                        ballotType === 'proposal' ? ['Proposals', String(proposals.length)] : null,
                    ].filter(Boolean).map(([k, v]) => (
                        <div key={k}>
                            <dt className="text-xs font-semibold uppercase tracking-wide text-ink-3">{k}</dt>
                            <dd className="mt-0.5 text-ink break-words">{v}</dd>
                        </div>
                    ))}
                </dl>
            </ConfirmDialog>
        </Card>
    );
}
