'use client';
import { useEffect, useState } from 'react';

export default function CandidateProfile() {
    const [loading, setLoading] = useState(true);
    const [me, setMe] = useState(null);
    const [msg, setMsg] = useState('');

    // form state
    const [basic, setBasic] = useState({ name: '', partyPosition: '', age: '', gender: 'Male', bio: '' });
    const [education, setEducation] = useState([]);
    const [leadership, setLeadership] = useState([]);
    const [eduNew, setEduNew] = useState({ degree: '', institution: '', year: '' });
    const [leadNew, setLeadNew] = useState({ role: '', org: '', period: '' });
    const [futureGoals, setFutureGoals] = useState('');
    const [currentOccupation, setCurrentOccupation] = useState('');
    const [speech50, setSpeech50] = useState('');

    useEffect(() => {
        (async () => {
            const r = await fetch('/api/candidate/me');
            const j = await r.json();
            if (j.ok) {
                setMe(j);
                setBasic({
                    name: j.name || '',
                    partyPosition: j.partyPosition || '',
                    age: j.age || '',
                    gender: j.gender || 'Male',
                    bio: j.bio || ''
                });
                setEducation(j.education || []);
                setLeadership(j.leadership || []);
                setFutureGoals(j.futureGoals || '');
                setCurrentOccupation(j.currentOccupation || '');
                setSpeech50(j.speech50 || '');
            }
            setLoading(false);
        })();
    }, []);

    async function saveBasic() {
        setMsg('');
        const r = await fetch('/api/candidate/profile', {
            method: 'PATCH', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ basic })
        });
        const j = await r.json();
        setMsg(j.ok ? 'Saved' : j.error || 'Failed');
    }

    async function addEducation() {
        if (!eduNew.degree.trim() || !eduNew.institution.trim()) { setMsg('Degree & Institution required'); return; }
        const r = await fetch('/api/candidate/profile', {
            method: 'PATCH', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ addEducation: eduNew })
        });
        const j = await r.json();
        if (j.ok) {
            setEducation(j.candidate.education);
            setEduNew({ degree: '', institution: '', year: '' });
            setMsg('Education added');
        } else setMsg(j.error || 'Failed');
    }
    async function removeEducation(id) {
        const r = await fetch('/api/candidate/profile', {
            method: 'PATCH', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ removeEducationId: id })
        });
        const j = await r.json();
        if (j.ok) { setEducation(j.candidate.education); }
    }

    async function addLeadership() {
        if (!leadNew.role.trim() || !leadNew.org.trim()) { setMsg('Role & Organization required'); return; }
        const r = await fetch('/api/candidate/profile', {
            method: 'PATCH', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ addLeadership: leadNew })
        });
        const j = await r.json();
        if (j.ok) {
            setLeadership(j.candidate.leadership);
            setLeadNew({ role: '', org: '', period: '' });
            setMsg('Leadership added');
        } else setMsg(j.error || 'Failed');
    }
    async function removeLeadership(id) {
        const r = await fetch('/api/candidate/profile', {
            method: 'PATCH', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ removeLeadershipId: id })
        });
        const j = await r.json();
        if (j.ok) { setLeadership(j.candidate.leadership); }
    }

    async function saveOther() {
        // limit ~50 words for speech
        const words = speech50.trim().split(/\s+/).filter(Boolean);
        if (words.length > 50) { setMsg('Speech must be at most 50 words'); return; }

        const r = await fetch('/api/candidate/profile', {
            method: 'PATCH', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ other: { futureGoals, currentOccupation, speech50 } })
        });
        const j = await r.json();
        setMsg(j.ok ? 'Saved' : j.error || 'Failed');
    }

    if (loading) return <div className="text-[#A1A1A1]">Loading...</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-white text-xl font-semibold">Your Profile</h1>

            {/* Basics */}
            <Section title="Basic Information">
                <Grid>
                    <Input label="Full Name" value={basic.name} onChange={v => setBasic(s => ({ ...s, name: v }))} />
                    <Input label="Party Position (if any)" value={basic.partyPosition} onChange={v => setBasic(s => ({ ...s, partyPosition: v }))} />
                    <Input type="number" label="Age" value={basic.age} onChange={v => setBasic(s => ({ ...s, age: v }))} />
                    <Select label="Gender" value={basic.gender} onChange={v => setBasic(s => ({ ...s, gender: v }))} options={['Male', 'Female', 'Other']} />
                    <TextArea rows={4} label="Bio" value={basic.bio} onChange={v => setBasic(s => ({ ...s, bio: v }))} />
                </Grid>
                <Save onClick={saveBasic} />
            </Section>

            {/* Education */}
            <Section title="Education Experience">
                <List items={education} render={e => (
                    <div className="flex items-center justify-between">
                        <div>{e.degree} — {e.institution} {e.year ? `(${e.year})` : ''}</div>
                        <button onClick={() => removeEducation(e._id)} className="text-xs text-red-400">Remove</button>
                    </div>
                )} />
                <Grid>
                    <Input label="Degree" value={eduNew.degree} onChange={v => setEduNew(s => ({ ...s, degree: v }))} />
                    <Input label="Institution" value={eduNew.institution} onChange={v => setEduNew(s => ({ ...s, institution: v }))} />
                    <Input label="Year" value={eduNew.year} onChange={v => setEduNew(s => ({ ...s, year: v }))} />
                </Grid>
                <button onClick={addEducation} className="px-3 py-1 rounded-lg bg-[#1F1F1F] border border-[#2A2A2A] text-white">Add Education</button>
            </Section>

            {/* Leadership */}
            <Section title="Past Leadership Experience">
                <List items={leadership} render={e => (
                    <div className="flex items-center justify-between">
                        <div>{e.role} — {e.org} {e.period ? `(${e.period})` : ''}</div>
                        <button onClick={() => removeLeadership(e._id)} className="text-xs text-red-400">Remove</button>
                    </div>
                )} />
                <Grid>
                    <Input label="Role" value={leadNew.role} onChange={v => setLeadNew(s => ({ ...s, role: v }))} />
                    <Input label="Organization" value={leadNew.org} onChange={v => setLeadNew(s => ({ ...s, org: v }))} />
                    <Input label="Period" value={leadNew.period} onChange={v => setLeadNew(s => ({ ...s, period: v }))} placeholder="e.g., 2019–2022" />
                </Grid>
                <button onClick={addLeadership} className="px-3 py-1 rounded-lg bg-[#1F1F1F] border border-[#2A2A2A] text-white">Add Leadership</button>
            </Section>

            {/* Other */}
            <Section title="Goals & Speech">
                <Grid>
                    <TextArea rows={4} label="Future Goals" value={futureGoals} onChange={setFutureGoals} />
                    <Input label="Current Occupation" value={currentOccupation} onChange={setCurrentOccupation} />
                    <TextArea rows={3} label="50-Word Speech to Voters" value={speech50} onChange={setSpeech50} />
                    <div className="text-xs text-[#6B6B6B]">{speech50.trim().split(/\s+/).filter(Boolean).length} / 50 words</div>
                </Grid>
                <Save onClick={saveOther} />
            </Section>

            {msg && <div className="text-[#9EFF00] text-sm">{msg}</div>}
        </div>
    );
}

/* small UI helpers */
function Section({ title, children }) {
    return (
        <div className="rounded-2xl border border-[#232323] bg-[#171717] p-5 space-y-3">
            <h2 className="text-white font-semibold">{title}</h2>
            {children}
        </div>
    );
}
function Grid({ children }) { return <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{children}</div>; }
function Input({ label, value, onChange, type = 'text', placeholder = '' }) {
    return (
        <label className="flex flex-col gap-1">
            <span className="text-[#A1A1A1] text-sm">{label}</span>
            <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
                className="bg-[#0F0F0F] border border-[#2A2A2A] rounded-xl px-3 py-2 text-[#EDEDED]" />
        </label>
    );
}
function TextArea({ label, value, onChange, rows = 4 }) {
    return (
        <label className="flex flex-col gap-1 md:col-span-2">
            <span className="text-[#A1A1A1] text-sm">{label}</span>
            <textarea rows={rows} value={value} onChange={e => onChange(e.target.value)}
                className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded-xl px-3 py-2 text-[#EDEDED]" />
        </label>
    );
}
function Select({ label, value, onChange, options }) {
    return (
        <label className="flex flex-col gap-1">
            <span className="text-[#A1A1A1] text-sm">{label}</span>
            <select value={value} onChange={e => onChange(e.target.value)}
                className="bg-[#0F0F0F] border border-[#2A2A2A] rounded-xl px-3 py-2 text-[#EDEDED]">
                {options.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
        </label>
    );
}
function List({ items, render }) {
    if (!items || items.length === 0) return <div className="text-[#A1A1A1]">None yet.</div>;
    return (
        <div className="space-y-2">
            {items.map(i => <div key={i._id} className="p-3 rounded-lg bg-[#1F1F1F] border border-[#2A2A2A] text-[#EDEDED]">{render(i)}</div>)}
        </div>
    );
}
function Save({ onClick }) {
    return <button onClick={onClick} className="px-4 py-2 rounded-lg bg-[#C9F300] text-black font-medium">Save</button>;
}
