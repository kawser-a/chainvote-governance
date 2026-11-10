'use client';
import { useEffect, useMemo, useState } from 'react';
import { Trash2 } from 'lucide-react';
import {
    Alert, Badge, Button, Card, CardBody, CardHeader, Field, Input, Loading, PageHeader, Select, Textarea,
} from '../../components/ui/primitives';
import { useToast } from '../../components/ui/interactive';

const words = (s) => s.trim().split(/\s+/).filter(Boolean).length;

async function patch(body) {
    const r = await fetch('/api/candidate/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    const j = await r.json();
    if (!j.ok) throw new Error(j.error || 'Save failed');
    return j.candidate;
}

/* Section card with its own save button, so it’s always clear what a "Save" applies to. */
function Section({ title, description, dirty, saving, onSave, children, error }) {
    return (
        <Card>
            <CardHeader title={title} description={description} action={dirty ? <Badge tone="warning">Unsaved changes</Badge> : null} />
            <CardBody className="space-y-5">
                {error && <Alert tone="danger">{error}</Alert>}
                {children}
                {onSave && (
                    <div className="flex flex-wrap items-center gap-3 border-t border-line pt-4">
                        <Button onClick={onSave} loading={saving} loadingText="Saving…" disabled={!dirty}>Save {title.toLowerCase()}</Button>
                        {!dirty && <span className="text-sm text-ink-3">All changes saved</span>}
                    </div>
                )}
            </CardBody>
        </Card>
    );
}

function EntryList({ items, render, onRemove, empty }) {
    if (!items?.length) return <p className="text-sm text-ink-3">{empty}</p>;
    return (
        <ul className="divide-y divide-line rounded-md border border-line">
            {items.map((it) => (
                <li key={it._id || JSON.stringify(it)} className="flex items-center justify-between gap-3 px-4 py-3">
                    <div className="min-w-0 text-[15px] text-ink">{render(it)}</div>
                    <Button variant="ghost" size="sm" onClick={() => onRemove(it)} aria-label={`Remove ${render(it)}`}>
                        <Trash2 className="h-4 w-4" aria-hidden="true" /> Remove
                    </Button>
                </li>
            ))}
        </ul>
    );
}

export default function CandidateProfile() {
    const { notify } = useToast();
    const [state, setState] = useState('loading');
    const [saved, setSaved] = useState(null); // last saved values, to detect unsaved changes
    const [basic, setBasic] = useState({ name: '', partyPosition: '', age: '', gender: 'Male', bio: '' });
    const [other, setOther] = useState({ currentOccupation: '', futureGoals: '', speech50: '' });
    const [education, setEducation] = useState([]);
    const [leadership, setLeadership] = useState([]);
    const [eduNew, setEduNew] = useState({ degree: '', institution: '', year: '' });
    const [leadNew, setLeadNew] = useState({ role: '', org: '', period: '' });
    const [saving, setSaving] = useState('');
    const [errors, setErrors] = useState({});

    useEffect(() => {
        (async () => {
            try {
                const r = await fetch('/api/candidate/me', { cache: 'no-store' });
                const j = await r.json();
                if (!j.ok) throw new Error();
                const b = { name: j.name || '', partyPosition: j.partyPosition || '', age: j.age ? String(j.age) : '', gender: j.gender || 'Male', bio: j.bio || '' };
                const o = { currentOccupation: j.currentOccupation || '', futureGoals: j.futureGoals || '', speech50: j.speech50 || '' };
                setBasic(b);
                setOther(o);
                setSaved({ basic: b, other: o });
                setEducation(j.education || []);
                setLeadership(j.leadership || []);
                setState('ready');
            } catch {
                setState('error');
            }
        })();
    }, []);

    const basicDirty = useMemo(() => saved && JSON.stringify(basic) !== JSON.stringify(saved.basic), [basic, saved]);
    const otherDirty = useMemo(() => saved && JSON.stringify(other) !== JSON.stringify(saved.other), [other, saved]);

    // Warn before leaving the page with unsaved edits.
    useEffect(() => {
        if (!basicDirty && !otherDirty) return;
        const h = (e) => { e.preventDefault(); e.returnValue = ''; };
        window.addEventListener('beforeunload', h);
        return () => window.removeEventListener('beforeunload', h);
    }, [basicDirty, otherDirty]);

    async function saveBasic() {
        const e = {};
        if (!basic.name.trim()) e.name = 'Enter your full name.';
        if (basic.age && (!/^\d+$/.test(basic.age) || Number(basic.age) < 18 || Number(basic.age) > 120)) e.age = 'Enter an age between 18 and 120.';
        setErrors(e);
        if (Object.keys(e).length) return;
        setSaving('basic');
        try {
            const payload = { ...basic, name: basic.name.trim() };
            if (!payload.age) delete payload.age;
            await patch({ basic: payload });
            setSaved((s) => ({ ...s, basic }));
            notify('Basic details saved.');
        } catch (err) {
            setErrors({ basicForm: err.message });
        } finally {
            setSaving('');
        }
    }

    async function saveOther() {
        if (words(other.speech50) > 50) {
            setErrors({ speech50: `Your message is ${words(other.speech50)} words. Shorten it to 50 or fewer.` });
            return;
        }
        setErrors({});
        setSaving('other');
        try {
            await patch({ other });
            setSaved((s) => ({ ...s, other }));
            notify('Message to voters saved.');
        } catch (err) {
            setErrors({ otherForm: err.message });
        } finally {
            setSaving('');
        }
    }

    async function addEntry(kind) {
        const isEdu = kind === 'education';
        const v = isEdu ? eduNew : leadNew;
        const e = {};
        if (isEdu) {
            if (!v.degree.trim()) e.degree = 'Enter the degree or qualification.';
            if (!v.institution.trim()) e.institution = 'Enter where you studied.';
        } else {
            if (!v.role.trim()) e.role = 'Enter your role.';
            if (!v.org.trim()) e.org = 'Enter the organisation.';
        }
        setErrors(e);
        if (Object.keys(e).length) return;
        setSaving(kind);
        try {
            const c = await patch(isEdu ? { addEducation: v } : { addLeadership: v });
            if (isEdu) { setEducation(c.education); setEduNew({ degree: '', institution: '', year: '' }); }
            else { setLeadership(c.leadership); setLeadNew({ role: '', org: '', period: '' }); }
            notify(isEdu ? 'Education added.' : 'Experience added.');
        } catch (err) {
            setErrors({ [`${kind}Form`]: err.message });
        } finally {
            setSaving('');
        }
    }

    async function removeEntry(kind, item) {
        const isEdu = kind === 'education';
        try {
            const c = await patch(isEdu ? { removeEducationId: item._id } : { removeLeadershipId: item._id });
            isEdu ? setEducation(c.education) : setLeadership(c.leadership);
            const { _id, ...rest } = item;
            notify(isEdu ? 'Education removed.' : 'Experience removed.', {
                duration: 8000,
                action: {
                    label: 'Undo',
                    onClick: async () => {
                        const back = await patch(isEdu ? { addEducation: rest } : { addLeadership: rest });
                        isEdu ? setEducation(back.education) : setLeadership(back.leadership);
                    },
                },
            });
        } catch (err) {
            notify(err.message || 'Couldn’t remove that entry.', { tone: 'danger' });
        }
    }

    if (state === 'loading') return <Loading label="Loading your profile…" rows={4} />;
    if (state === 'error') return <Alert tone="danger" title="We couldn’t load your profile">Refresh the page to try again.</Alert>;

    const speechWords = words(other.speech50);

    return (
        <>
            <PageHeader title="Profile" description="Voters see this next to your manifestos when they decide how to vote." />
            <div className="space-y-6">
                <Section title="Basic details" dirty={basicDirty} saving={saving === 'basic'} onSave={saveBasic} error={errors.basicForm}>
                    <div className="grid gap-5 sm:grid-cols-2">
                        <Field id="p-name" label="Full name" error={errors.name}>
                            <Input id="p-name" autoComplete="name" error={errors.name} value={basic.name} onChange={(e) => setBasic((s) => ({ ...s, name: e.target.value }))} />
                        </Field>
                        <Field id="p-position" label="Position in party" optional>
                            <Input id="p-position" value={basic.partyPosition} onChange={(e) => setBasic((s) => ({ ...s, partyPosition: e.target.value }))} />
                        </Field>
                        <Field id="p-age" label="Age" error={errors.age}>
                            <Input id="p-age" inputMode="numeric" maxLength={3} error={errors.age} value={basic.age} onChange={(e) => setBasic((s) => ({ ...s, age: e.target.value.replace(/\D/g, '') }))} className="max-w-[8rem]" />
                        </Field>
                        <Field id="p-gender" label="Gender">
                            <Select id="p-gender" value={basic.gender} onChange={(e) => setBasic((s) => ({ ...s, gender: e.target.value }))}>
                                {['Male', 'Female', 'Other'].map((g) => <option key={g}>{g}</option>)}
                            </Select>
                        </Field>
                        <Field id="p-bio" label="About you" hint="A few sentences about your background and work in the community." className="sm:col-span-2">
                            <Textarea id="p-bio" hint rows={4} value={basic.bio} onChange={(e) => setBasic((s) => ({ ...s, bio: e.target.value }))} />
                        </Field>
                    </div>
                </Section>

                <Section title="Message to voters" dirty={otherDirty} saving={saving === 'other'} onSave={saveOther} error={errors.otherForm}>
                    <div className="grid gap-5 sm:grid-cols-2">
                        <Field id="p-occupation" label="Current occupation">
                            <Input id="p-occupation" value={other.currentOccupation} onChange={(e) => setOther((s) => ({ ...s, currentOccupation: e.target.value }))} />
                        </Field>
                        <div className="hidden sm:block" />
                        <Field id="p-speech" label="Your message (up to 50 words)" hint="Shown on the ballot under your name." error={errors.speech50} className="sm:col-span-2">
                            <Textarea id="p-speech" hint error={errors.speech50} rows={3} value={other.speech50} onChange={(e) => setOther((s) => ({ ...s, speech50: e.target.value }))} />
                            <p className={`mt-1 text-right text-xs ${speechWords > 50 ? 'font-semibold text-danger' : 'text-ink-3'}`}>{speechWords} / 50 words</p>
                        </Field>
                        <Field id="p-goals" label="Longer-term goals" optional className="sm:col-span-2">
                            <Textarea id="p-goals" rows={4} value={other.futureGoals} onChange={(e) => setOther((s) => ({ ...s, futureGoals: e.target.value }))} />
                        </Field>
                    </div>
                </Section>

                <Section title="Education" description="Each entry is saved as soon as you add or remove it." error={errors.educationForm}>
                    <EntryList
                        items={education}
                        empty="No education added yet."
                        onRemove={(it) => removeEntry('education', it)}
                        render={(e) => `${[e.degree, e.institution].filter(Boolean).join(', ')}${e.year ? ` (${e.year})` : ''}`}
                    />
                    <div className="grid gap-4 sm:grid-cols-[1fr_1fr_8rem_auto] sm:items-end">
                        <Field id="e-degree" label="Degree" error={errors.degree}><Input id="e-degree" error={errors.degree} value={eduNew.degree} onChange={(e) => setEduNew((s) => ({ ...s, degree: e.target.value }))} /></Field>
                        <Field id="e-inst" label="Institution" error={errors.institution}><Input id="e-inst" error={errors.institution} value={eduNew.institution} onChange={(e) => setEduNew((s) => ({ ...s, institution: e.target.value }))} /></Field>
                        <Field id="e-year" label="Year" optional><Input id="e-year" inputMode="numeric" maxLength={4} value={eduNew.year} onChange={(e) => setEduNew((s) => ({ ...s, year: e.target.value.replace(/\D/g, '') }))} /></Field>
                        <Button variant="secondary" onClick={() => addEntry('education')} loading={saving === 'education'} className={errors.degree || errors.institution ? 'sm:mb-7' : ''}>Add</Button>
                    </div>
                </Section>

                <Section title="Experience" description="Roles you’ve held in community, public or professional life." error={errors.leadershipForm}>
                    <EntryList
                        items={leadership}
                        empty="No experience added yet."
                        onRemove={(it) => removeEntry('leadership', it)}
                        render={(l) => `${[l.role, l.org].filter(Boolean).join(', ')}${l.period ? ` (${l.period})` : ''}`}
                    />
                    <div className="grid gap-4 sm:grid-cols-[1fr_1fr_10rem_auto] sm:items-end">
                        <Field id="l-role" label="Role" error={errors.role}><Input id="l-role" error={errors.role} value={leadNew.role} onChange={(e) => setLeadNew((s) => ({ ...s, role: e.target.value }))} /></Field>
                        <Field id="l-org" label="Organisation" error={errors.org}><Input id="l-org" error={errors.org} value={leadNew.org} onChange={(e) => setLeadNew((s) => ({ ...s, org: e.target.value }))} /></Field>
                        <Field id="l-period" label="Period" optional><Input id="l-period" value={leadNew.period} placeholder="e.g. 2019–2022" onChange={(e) => setLeadNew((s) => ({ ...s, period: e.target.value }))} /></Field>
                        <Button variant="secondary" onClick={() => addEntry('leadership')} loading={saving === 'leadership'} className={errors.role || errors.org ? 'sm:mb-7' : ''}>Add</Button>
                    </div>
                </Section>
            </div>
        </>
    );
}
