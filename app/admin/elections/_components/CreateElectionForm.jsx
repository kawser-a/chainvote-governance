'use client';

import { useEffect, useState } from 'react';
import { SectionTitle, SectionSubTitle, Label, Input, TextArea, Select, Toggle } from './UI';

const TYPES = ['national', 'local', 'presidential', 'constituent', 'decision', 'policy'];
const LOCAL_LEVELS = ['councillor', 'chairman', 'mayor'];
const BALLOT_TYPES = ['manifesto', 'candidate', 'proposal'];
const VOTE_MODES = ['direct', 'indirect']; // for presidential

export default function CreateElectionForm({ onCreated, createElection }) {
    // form state
    const [name, setName] = useState('');
    const [type, setType] = useState('national');
    const [voteMode, setVoteMode] = useState('direct');
    const [level, setLevel] = useState('');
    const [ballotType, setBallotType] = useState('manifesto');
    const [multiSelect, setMultiSelect] = useState(true);
    const [startAt, setStartAt] = useState('');
    const [endAt, setEndAt] = useState('');
    const [seatsInput, setSeatsInput] = useState('');
    const [location, setLocation] = useState({
        division: '', district: '', upazila: '', union: '', ward: '', city: ''
    });

    const [advOpen, setAdvOpen] = useState(false);
    const [eligScope, setEligScope] = useState('seat');
    const [eligRoles, setEligRoles] = useState('');
    const [eligRequireEnrolled, setEligRequireEnrolled] = useState(true);
    const [eligCanVoteOnly, setEligCanVoteOnly] = useState(true);
    const [eligMinAge, setEligMinAge] = useState(18);

    const [proposals, setProposals] = useState([]);
    const [autoBuildBallot, setAutoBuildBallot] = useState(true);
    const [msg, setMsg] = useState('');

    useEffect(() => {
        if (type === 'national') {
            setBallotType('manifesto'); setMultiSelect(true); setEligScope('seat'); setVoteMode('direct');
        } else if (type === 'presidential') {
            setBallotType('candidate'); setMultiSelect(false); setVoteMode('indirect'); setEligScope('role'); setEligRoles('MP');
        } else if (type === 'local') {
            setBallotType('candidate'); setMultiSelect(false); setEligScope('location');
        } else {
            setBallotType('proposal'); setMultiSelect(false); setEligScope('all'); setVoteMode('direct');
        }
    }, [type]);

    useEffect(() => {
        if (ballotType === 'manifesto') setMultiSelect(true);
        if (ballotType === 'candidate') setMultiSelect(false);
    }, [ballotType]);

    function seatsArray() {
        return seatsInput.split(',').map(s => s.trim()).filter(Boolean);
    }
    function mkEligibility() {
        if (!advOpen) {
            if (type === 'national') return { scope: 'seat', seats: seatsArray(), roles: [], requireEnrolled: true, canVoteOnly: true, minAge: 18 };
            if (type === 'presidential') {
                return (voteMode === 'indirect')
                    ? { scope: 'role', roles: ['MP'], requireEnrolled: true, canVoteOnly: true, minAge: 18 }
                    : { scope: 'country', roles: [], requireEnrolled: true, canVoteOnly: true, minAge: 18 };
            }
            if (type === 'local') return { scope: 'location', roles: [], requireEnrolled: true, canVoteOnly: true, minAge: 18 };
            return { scope: 'all', roles: [], requireEnrolled: true, canVoteOnly: true, minAge: 18 };
        }
        const roles = eligRoles.split(',').map(s => s.trim()).filter(Boolean);
        return {
            scope: eligScope,
            seats: eligScope === 'seat' ? seatsArray() : [],
            roles,
            requireEnrolled: !!eligRequireEnrolled,
            canVoteOnly: !!eligCanVoteOnly,
            minAge: Number(eligMinAge) || 18,
        };
    }

    async function handleCreate() {
        setMsg('');
        if (!name || !startAt || !endAt) {
            setMsg('Name, start and end are required.');
            return;
        }
        try {
            await createElection({
                name, type,
                voteMode,
                level: type === 'local' ? (level || null) : null,
                seats: seatsArray(),
                location: type === 'local' ? location : {},
                eligibility: mkEligibility(),
                ballotType,
                multiSelect,
                startAt,
                endAt,
                status: 'scheduled',
                proposals: ballotType === 'proposal' ? proposals : [],
                autoBuildBallot: ballotType === 'manifesto' ? autoBuildBallot : false,
            });
            setMsg('Election created.');
            // reset
            setName(''); setSeatsInput(''); setStartAt(''); setEndAt(''); setProposals([]);
            onCreated?.();
        } catch (e) {
            setMsg(e.message || 'Create failed');
        }
    }

    return (
        <div className="rounded-2xl border border-[#232323] bg-[#171717] p-5 space-y-4">
            <SectionTitle>Create Election</SectionTitle>

            {/* Basic Fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Input label="Name" value={name} onChange={setName} />
                <Select label="Type" value={type} onChange={setType} options={TYPES} />
                {type === 'presidential' && (
                    <Select label="Vote Mode (President)" value={voteMode} onChange={setVoteMode} options={VOTE_MODES} />
                )}
                {type === 'local' && (
                    <Select label="Local Level" value={level} onChange={setLevel} options={LOCAL_LEVELS} />
                )}
                <Select label="Ballot Type" value={ballotType} onChange={setBallotType} options={BALLOT_TYPES} />
                <Toggle label="Allow Multi-Select" checked={multiSelect} onChange={setMultiSelect} />
                <Input type="datetime-local" label="Start At" value={startAt} onChange={setStartAt} />
                <Input type="datetime-local" label="End At" value={endAt} onChange={setEndAt} />
            </div>

            {/* Seats / Location */}
            {type === 'national' && (
                <div className="space-y-2">
                    <Label>Seats (comma separated)</Label>
                    <textarea
                        value={seatsInput}
                        onChange={(e) => setSeatsInput(e.target.value)}
                        rows={2}
                        placeholder="Dhaka-1, Dhaka-2, Khulna-1, ..."
                        className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded-xl px-3 py-2 text-[#EDEDED]"
                    />
                    {ballotType === 'manifesto' && (
                        <div className="flex items-center gap-2 pt-1">
                            <input id="abb" type="checkbox" checked={autoBuildBallot} onChange={e => setAutoBuildBallot(e.target.checked)} />
                            <label htmlFor="abb" className="text-[#EDEDED] text-sm">Auto-build ballot from approved manifestos</label>
                        </div>
                    )}
                </div>
            )}

            {type === 'local' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Input label="Division" value={location.division} onChange={(v) => setLocation({ ...location, division: v })} />
                    <Input label="District" value={location.district} onChange={(v) => setLocation({ ...location, district: v })} />
                    <Input label="Upazila" value={location.upazila} onChange={(v) => setLocation({ ...location, upazila: v })} />
                    <Input label="Union" value={location.union} onChange={(v) => setLocation({ ...location, union: v })} />
                    <Input label="Ward" value={location.ward} onChange={(v) => setLocation({ ...location, ward: v })} />
                    <Input label="City" value={location.city} onChange={(v) => setLocation({ ...location, city: v })} />
                </div>
            )}

            {/* Proposals */}
            {ballotType === 'proposal' && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <SectionSubTitle>Proposals</SectionSubTitle>
                        <button
                            onClick={() => setProposals(p => [...p, { title: '', reason: '', impact: '', costOrTime: '', options: [] }])}
                            className="px-3 py-1 rounded-lg bg-[#1F1F1F] border border-[#2A2A2A] text-white hover:bg-[#2A2A2A]"
                        >
                            + Add proposal
                        </button>
                    </div>
                    {proposals.length === 0 && <div className="text-[#A1A1A1] text-sm">No proposals added.</div>}
                    <div className="space-y-3">
                        {proposals.map((p, idx) => (
                            <div key={idx} className="rounded-2xl border border-[#2A2A2A] p-3 space-y-2">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <Input label="Title (required)" value={p.title} onChange={(v) => updateProposal(idx, { title: v })} />
                                    <Input label="Cost/Time" value={p.costOrTime} onChange={(v) => updateProposal(idx, { costOrTime: v })} />
                                    <TextArea label="Reason" value={p.reason} onChange={(v) => updateProposal(idx, { reason: v })} />
                                    <TextArea label="Impact" value={p.impact} onChange={(v) => updateProposal(idx, { impact: v })} />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label>Options (optional – defaults if empty)</Label>
                                        <button
                                            onClick={() => addOption(idx)}
                                            className="px-2 py-1 rounded-md bg-[#1F1F1F] border border-[#2A2A2A] text-white hover:bg-[#2A2A2A] text-xs"
                                        >
                                            + Add option
                                        </button>
                                    </div>
                                    {(p.options || []).length === 0 ? (
                                        <div className="text-[#A1A1A1] text-xs">Defaults: Agree / Agree with conditions / Disagree</div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                            {p.options.map((o, oi) => (
                                                <div key={oi} className="rounded-lg border border-[#2A2A2A] p-2">
                                                    <Input label="Key (unique)" value={o.key || ''} onChange={(v) => updateOption(idx, oi, { key: v })} />
                                                    <Input label="Label" value={o.label || ''} onChange={(v) => updateOption(idx, oi, { label: v })} />
                                                    <div className="flex justify-end">
                                                        <button
                                                            onClick={() => removeOption(idx, oi)}
                                                            className="mt-1 px-2 py-1 rounded-md bg-red-600 text-white hover:bg-red-700 text-xs"
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-end">
                                    <button
                                        onClick={() => removeProposal(idx)}
                                        className="px-3 py-1 rounded-lg bg-red-600 text-white hover:bg-red-700"
                                    >
                                        Remove Proposal
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Advanced eligibility */}
            <div className="pt-2">
                <button
                    onClick={() => setAdvOpen(o => !o)}
                    className="text-sm text-[#9EFF00] hover:underline"
                >
                    {advOpen ? 'Hide advanced eligibility' : 'Show advanced eligibility'}
                </button>
                {advOpen && (
                    <div className="mt-3 rounded-xl border border-[#2A2A2A] p-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                        <Select label="Scope" value={eligScope} onChange={setEligScope} options={['all', 'country', 'seat', 'location', 'role']} />
                        <Input label="Roles (CSV)" value={eligRoles} onChange={setEligRoles} />
                        <Input type="number" label="Min Age" value={String(eligMinAge)} onChange={(v) => setEligMinAge(Number(v || 18))} />
                        <Toggle label="Require Enrolled" checked={eligRequireEnrolled} onChange={setEligRequireEnrolled} />
                        <Toggle label="Only if canVote & not banned" checked={eligCanVoteOnly} onChange={setEligCanVoteOnly} />
                    </div>
                )}
            </div>

            <div className="flex items-center justify-between">
                <div className="text-sm text-[#A1A1A1]">
                    Tips: National → Manifesto ballot + Seats. Presidential → Candidate ballot (direct or role=MP). Local → Candidate ballot + Location.
                </div>
                <button
                    onClick={handleCreate}
                    className="px-4 py-2 rounded-lg bg-[#C9F300] text-black font-medium hover:opacity-90"
                >
                    Create
                </button>
            </div>

            {!!msg && <div className="text-sm text-[#9EFF00]">{msg}</div>}
        </div>
    );

    // helpers (local)
    function updateProposal(idx, patch) {
        setProposals(prev => prev.map((p, i) => i === idx ? { ...p, ...patch } : p));
    }
    function removeProposal(idx) {
        setProposals(prev => prev.filter((_, i) => i !== idx));
    }
    function addOption(idx) {
        setProposals(prev => prev.map((p, i) => i === idx ? { ...p, options: [...(p.options || []), { key: '', label: '' }] } : p));
    }
    function updateOption(pIdx, oIdx, patch) {
        setProposals(prev => prev.map((p, i) => {
            if (i !== pIdx) return p;
            const opts = [...(p.options || [])];
            opts[oIdx] = { ...opts[oIdx], ...patch };
            return { ...p, options: opts };
        }));
    }
    function removeOption(pIdx, oIdx) {
        setProposals(prev => prev.map((p, i) => {
            if (i !== pIdx) return p;
            const opts = (p.options || []).filter((_, ii) => ii !== oIdx);
            return { ...p, options: opts };
        }));
    }
}
