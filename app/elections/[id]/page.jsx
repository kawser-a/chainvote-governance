// 'use client';

// import { useEffect, useMemo, useState } from 'react';
// import Link from 'next/link';

// export default function VoterBallotPage({ params }) {
//     const id = params?.id;
//     const [election, setElection] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [msg, setMsg] = useState('');
//     const [selCandidate, setSelCandidate] = useState(null);

//     useEffect(() => {
//         if (!id) return;
//         (async () => {
//             setLoading(true);
//             setMsg('');
//             try {
//                 const r = await fetch(`/api/elections/${id}`, { cache: 'no-store' });
//                 const j = await r.json();
//                 if (!j.ok) { setMsg(j.error || 'Failed to load election'); setElection(null); }
//                 else setElection(j.election);
//             } catch { setMsg('Network error'); }
//             finally { setLoading(false); }
//         })();
//     }, [id]);

//     const isActiveWindow = useMemo(() => {
//         if (!election) return false;
//         const now = Date.now();
//         const s = Date.parse(election.startAt);
//         const e = Date.parse(election.endAt);
//         return now >= s && now <= e;
//     }, [election]);

//     const isReallyActive = election?.status === 'active' && isActiveWindow;
//     const votingDisabled = !isReallyActive;

//     async function cast(payload) {
//         try {
//             setMsg('');
//             const r = await fetch(`/api/elections/${election._id}/vote`, {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 credentials: 'include',
//                 body: JSON.stringify(payload),
//             });
//             const j = await r.json();
//             if (!j.ok) { setMsg(j.error || 'Vote failed'); return; }
//             setMsg('✅ Vote submitted');
//         } catch { setMsg('Vote failed'); }
//     }

//     const voteManifesto = (manifestoId) => cast({ manifestoId });
//     const voteCandidate = () => selCandidate ? cast({ candidateId: selCandidate }) : setMsg('Please select a candidate');
//     const voteProposal = (ballotItemId, optionKey) => cast({ ballotItemId, optionKey });

//     if (loading) return <div className="text-[#A1A1A1]">Loading...</div>;
//     if (!election) return <div className="text-red-400">{msg || 'Not found'}</div>;

//     return (
//         <div className="space-y-5">
//             {/* Header */}
//             <div className="rounded-2xl border border-[#2A2A2A] bg-[#171717] p-4">
//                 <div className="flex items-center justify-between">
//                     <div>
//                         <div className="text-white text-xl font-semibold">{election.name}</div>
//                         <div className="text-[#A1A1A1] text-sm capitalize">
//                             {election.type} • {election.ballotType} • {election.eligibility?.scope || 'seat'}
//                         </div>
//                         <div className="text-[#A1A1A1] text-xs mt-1">
//                             {new Date(election.startAt).toLocaleString()} — {new Date(election.endAt).toLocaleString()}
//                         </div>
//                     </div>
//                     <Link href="/elections" className="px-3 py-1.5 rounded-lg bg-[#1F1F1F] border border-[#2A2A2A] text-[#EDEDED] hover:bg-[#2A2A2A] text-sm">
//                         ← Back
//                     </Link>
//                 </div>
//                 {!isReallyActive && (
//                     <div className="text-xs text-orange-400 mt-2">
//                         {election.status === 'paused' ? 'Election is paused.' : 'Not active right now.'}
//                     </div>
//                 )}
//             </div>

//             {/* MANIFESTO BALLOT */}
//             {election.ballotType === 'manifesto' && (
//                 <div className="space-y-3">
//                     {(!election.ballot || election.ballot.length === 0) ? (
//                         <div className="rounded-2xl border border-[#2A2A2A] bg-[#171717] p-4 text-[#A1A1A1]">
//                             No manifesto items available.
//                         </div>
//                     ) : (
//                         election.ballot.map(b => {
//                             const c = b.candidate;    // enriched candidate
//                             const m = b.manifesto;    // enriched manifesto
//                             const months = b.targetMonths ?? m?.targetWindowMonths ?? null;

//                             return (
//                                 <div key={b._id} className="rounded-2xl border border-[#2A2A2A] bg-[#171717] p-4">
//                                     {/* Candidate profile */}
//                                     {c && (
//                                         <div className="mb-2">
//                                             <div className="text-white font-semibold">{c.name}</div>
//                                             <div className="text-xs text-[#A1A1A1]">
//                                                 {(c.partyName && !c.independent) ? c.partyName : 'Independent'}
//                                                 {c.seat ? ` • Seat: ${c.seat}` : ''}
//                                                 {c.gender ? ` • ${c.gender}` : ''}
//                                                 {c.age ? ` • ${c.age}y` : ''}
//                                             </div>
//                                             {(c.shortSpeech || c.occupation) && (
//                                                 <div className="text-xs text-[#A1A1A1] mt-1">
//                                                     {c.occupation ? <>Occupation: {c.occupation}</> : null}
//                                                     {c.shortSpeech ? <> {c.occupation ? ' • ' : ''}Message: “{c.shortSpeech}”</> : null}
//                                                 </div>
//                                             )}
//                                         </div>
//                                     )}

//                                     {/* Manifesto details */}
//                                     <div className="text-white font-medium">{m?.title || b.title}</div>
//                                     {m?.summary && (
//                                         <div className="text-sm text-[#EDEDED] mt-1 whitespace-pre-wrap">
//                                             {m.summary}
//                                         </div>
//                                     )}
//                                     <div className="text-xs text-[#A1A1A1] mt-1">
//                                         Target: {months != null ? <>within <span className="text-white">{months}</span> months</> : '—'}
//                                     </div>

//                                     <div className="mt-3">
//                                         <button
//                                             disabled={votingDisabled}
//                                             onClick={() => voteManifesto(b.manifestoId)}
//                                             className="px-3 py-1.5 rounded-lg bg-[#C9F300] text-black font-medium disabled:opacity-50"
//                                         >
//                                             Vote for this Manifesto
//                                         </button>
//                                     </div>
//                                 </div>
//                             );
//                         })
//                     )}
//                 </div>
//             )}

//             {/* CANDIDATE BALLOT */}
//             {election.ballotType === 'candidate' && (
//                 <div className="space-y-3">
//                     {(!election.ballot || election.ballot.length === 0) ? (
//                         <div className="rounded-2xl border border-[#2A2A2A] bg-[#171717] p-4 text-[#A1A1A1]">
//                             No candidates available.
//                         </div>
//                     ) : (
//                         <>
//                             {election.ballot.map(b => {
//                                 const c = b.candidate;
//                                 return (
//                                     <label key={b._id} className="block rounded-2xl border border-[#2A2A2A] bg-[#171717] p-4 cursor-pointer">
//                                         <div className="flex items-start gap-3">
//                                             <input
//                                                 type="radio"
//                                                 name="candidate"
//                                                 className="mt-1"
//                                                 checked={selCandidate === String(b.candidateId)}
//                                                 onChange={() => setSelCandidate(String(b.candidateId))}
//                                                 disabled={votingDisabled}
//                                             />
//                                             <div className="flex-1">
//                                                 <div className="text-white font-semibold">{c?.name || b.title}</div>
//                                                 <div className="text-xs text-[#A1A1A1]">
//                                                     {(c?.partyName && !c?.independent) ? c.partyName : 'Independent'}
//                                                     {c?.seat ? ` • Seat: ${c.seat}` : ''}
//                                                     {c?.gender ? ` • ${c.gender}` : ''}
//                                                     {c?.age ? ` • ${c.age}y` : ''}
//                                                 </div>
//                                                 {c?.shortSpeech && (
//                                                     <div className="text-xs text-[#A1A1A1] mt-1">“{c.shortSpeech}”</div>
//                                                 )}
//                                             </div>
//                                         </div>
//                                     </label>
//                                 );
//                             })}
//                             <button
//                                 onClick={voteCandidate}
//                                 disabled={votingDisabled || !selCandidate}
//                                 className="px-4 py-2 rounded-lg bg-[#C9F300] text-black font-medium disabled:opacity-50"
//                             >
//                                 Submit Vote
//                             </button>
//                         </>
//                     )}
//                 </div>
//             )}

//             {/* PROPOSAL BALLOT */}
//             {election.ballotType === 'proposal' && (
//                 <div className="space-y-3">
//                     {(!election.ballot || election.ballot.length === 0) ? (
//                         <div className="rounded-2xl border border-[#2A2A2A] bg-[#171717] p-4 text-[#A1A1A1]">
//                             No proposals available.
//                         </div>
//                     ) : election.ballot.map(b => (
//                         <div key={b._id} className="rounded-2xl border border-[#2A2A2A] bg-[#171717] p-4">
//                             <div className="text-white font-semibold">{b.proposal?.title}</div>
//                             {(b.proposal?.reason || b.proposal?.impact || b.proposal?.costOrTime) && (
//                                 <div className="text-xs text-[#A1A1A1] mt-1 space-y-0.5">
//                                     {b.proposal?.reason && <div><b>Reason:</b> {b.proposal.reason}</div>}
//                                     {b.proposal?.impact && <div><b>Impact:</b> {b.proposal.impact}</div>}
//                                     {b.proposal?.costOrTime && <div><b>Cost/Time:</b> {b.proposal.costOrTime}</div>}
//                                 </div>
//                             )}
//                             <div className="mt-2 flex flex-wrap gap-2">
//                                 {(b.proposal?.options || []).map(o => (
//                                     <button
//                                         key={o.key}
//                                         disabled={votingDisabled}
//                                         onClick={() => voteProposal(b._id, o.key)}
//                                         className="px-3 py-1 rounded-lg bg-[#1F1F1F] border border-[#2A2A2A] text-white hover:bg-[#2A2A2A] disabled:opacity-50"
//                                     >
//                                         {o.label}
//                                     </button>
//                                 ))}
//                             </div>
//                         </div>
//                     ))}
//                 </div>
//             )}

//             {!!msg && <div className="text-sm text-[#9EFF00]">{msg}</div>}
//         </div>
//     );
// }

// /app/elections/[id]/page.jsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

export default function VoterBallotPage({ params }) {
    const id = params?.id;
    const [election, setElection] = useState(null);
    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState('');

    // multi-select state
    const [selSet, setSelSet] = useState(() => new Set()); // manifestoIds (strings)
    const [confirmOpen, setConfirmOpen] = useState(false);

    useEffect(() => {
        if (!id) return;
        (async () => {
            setLoading(true);
            setMsg('');
            try {
                const r = await fetch(`/api/elections/${id}`, { cache: 'no-store' });
                const j = await r.json();
                if (!j.ok) { setMsg(j.error || 'Failed to load election'); setElection(null); }
                else {
                    setElection(j.election);
                    setSelSet(new Set()); // reset
                }
            } catch {
                setMsg('Network error');
            } finally {
                setLoading(false);
            }
        })();
    }, [id]);

    const isActiveWindow = useMemo(() => {
        if (!election) return false;
        const now = Date.now();
        const s = Date.parse(election.startAt);
        const e = Date.parse(election.endAt);
        return now >= s && now <= e;
    }, [election]);

    const isReallyActive = election?.status === 'active' && isActiveWindow;
    const votingDisabled = !isReallyActive;

    // group manifesto ballot by candidate
    const grouped = useMemo(() => {
        if (!election || election.ballotType !== 'manifesto') return {};
        const map = new Map(); // candidateId -> { candidate, items: [{manifestoId, manifesto, label, seat, index}] }
        (election.ballot || []).forEach((b, idx) => {
            const m = b.manifesto;
            const c = b.candidate;
            const cid = c?._id ? String(c._id) : 'unknown';
            if (!map.has(cid)) map.set(cid, { candidate: c, items: [] });
            map.get(cid).items.push({
                index: idx, // keep original index to preserve ascending order per candidate
                manifestoId: String(b.manifestoId),
                manifesto: m,
                seat: b.seat || c?.seat || '',
            });
        });
        // sort each candidate's items by index (ascending)
        for (const k of map.keys()) {
            map.get(k).items.sort((a, b) => a.index - b.index);
        }
        return Object.fromEntries(map);
    }, [election]);

    function togglePick(mid) {
        setSelSet(prev => {
            const s = new Set(prev);
            if (s.has(mid)) s.delete(mid);
            else s.add(mid);
            return s;
        });
    }

    async function submitSelected() {
        try {
            setMsg('');
            const manifestoIds = Array.from(selSet);
            if (!manifestoIds.length) {
                setMsg('Please select at least one manifesto');
                return;
            }
            const r = await fetch(`/api/elections/${election._id}/vote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ manifestoIds }),
            });
            const j = await r.json();
            if (!j.ok) { setMsg(j.error || 'Vote failed'); return; }
            setMsg(`✅ Vote submitted for ${manifestoIds.length} manifesto(s).`);
            setConfirmOpen(false);
            setSelSet(new Set()); // clear after success (optional)
        } catch {
            setMsg('Vote failed');
        }
    }

    function pickedSummary() {
        if (!election || election.ballotType !== 'manifesto') return [];
        const items = (election.ballot || []);
        const rows = [];
        for (const b of items) {
            const mid = String(b.manifestoId);
            if (!selSet.has(mid)) continue;
            rows.push({
                manifestoTitle: b.manifesto?.title || b.title || 'Manifesto',
                candidateName: b.candidate?.name || '—',
                seat: b.seat || b.candidate?.seat || '—',
                target: (b.targetMonths ?? b.manifesto?.targetWindowMonths) || null,
            });
        }
        return rows;
    }

    if (loading) return <div className="text-[#A1A1A1]">Loading...</div>;
    if (!election) return <div className="text-red-400">{msg || 'Not found'}</div>;

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="rounded-2xl border border-[#2A2A2A] bg-[#171717] p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-white text-xl font-semibold">{election.name}</div>
                        <div className="text-[#A1A1A1] text-sm capitalize">
                            {election.type} • {election.ballotType} • {election.eligibility?.scope || 'seat'}
                        </div>
                        <div className="text-[#A1A1A1] text-xs mt-1">
                            {new Date(election.startAt).toLocaleString()} — {new Date(election.endAt).toLocaleString()}
                        </div>
                    </div>
                    <Link href="/elections" className="px-3 py-1.5 rounded-lg bg-[#1F1F1F] border border-[#2A2A2A] text-[#EDEDED] hover:bg-[#2A2A2A] text-sm">
                        ← Back
                    </Link>
                </div>
                {!isReallyActive && (
                    <div className="text-xs text-orange-400 mt-2">
                        {election.status === 'paused' ? 'Election is paused.' : 'Not active right now.'}
                    </div>
                )}
            </div>

            {/* ── MANIFESTO BALLOT ─────────────────────────────────────── */}
            {election.ballotType === 'manifesto' && (
                <div className="space-y-4">
                    {Object.keys(grouped).length === 0 ? (
                        <div className="rounded-2xl border border-[#2A2A2A] bg-[#171717] p-4 text-[#A1A1A1]">
                            No manifesto items available.
                        </div>
                    ) : (
                        <>
                            {Object.entries(grouped).map(([cid, grp]) => {
                                const c = grp.candidate;
                                return (
                                    <div key={cid} className="rounded-2xl border border-[#2A2A2A] bg-[#171717] p-4">
                                        {/* Candidate profile w/ hover info */}
                                        <CandidateHeader candidate={c} />

                                        {/* Manifestos sorted ascending */}
                                        <div className="mt-3 space-y-2">
                                            {grp.items.map((it, i) => {
                                                const m = it.manifesto;
                                                const mid = it.manifestoId;
                                                const checked = selSet.has(mid);
                                                const target = it.manifesto?.targetWindowMonths ?? null;

                                                return (
                                                    <label key={mid} className="flex items-start gap-2 rounded-xl border border-[#2A2A2A] p-3 cursor-pointer">
                                                        <input type="checkbox" checked={checked} onChange={() => togglePick(mid)} disabled={votingDisabled} />
                                                        <div className="flex-1">
                                                            <div className="text-white font-semibold">{m?.title || `Manifesto #${i + 1}`}</div>
                                                            {m?.summary && <div className="text-sm text-[#EDEDED] mt-1 whitespace-pre-wrap">{m.summary}</div>}
                                                            <div className="text-xs text-[#A1A1A1] mt-1">
                                                                {it.seat ? `Seat: ${it.seat}` : null} {target ? <> • Target: within <b className="text-white">{target}</b> months</> : null}
                                                            </div>
                                                        </div>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Submit / confirm */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setConfirmOpen(true)}
                                    disabled={votingDisabled || selSet.size === 0}
                                    className="px-4 py-2 rounded-lg bg-[#C9F300] text-black font-medium disabled:opacity-50"
                                >
                                    Submit Selected
                                </button>
                                <span className="text-[#A1A1A1] text-sm">Selected: {selSet.size}</span>
                            </div>

                            {/* Confirm modal */}
                            {confirmOpen && (
                                <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
                                    <div className="w-full max-w-lg rounded-xl border border-[#2A2A2A] bg-[#171717] p-5">
                                        <div className="text-white font-semibold text-lg mb-2">Confirm Your Selections</div>
                                        <div className="text-[#A1A1A1] text-sm mb-2">
                                            Please confirm you want to vote for the following manifesto(s):
                                        </div>
                                        <div className="max-h-64 overflow-auto rounded-md border border-[#2A2A2A] p-3 bg-[#141414]">
                                            {pickedSummary().map((row, idx) => (
                                                <div key={idx} className="text-sm text-[#EDEDED] mb-2">
                                                    <div className="font-medium">{row.manifestoTitle}</div>
                                                    <div className="text-xs text-[#A1A1A1]">
                                                        Candidate: {row.candidateName} • Seat: {row.seat} {row.target ? <> • Target: {row.target} months</> : null}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="pt-3 flex items-center justify-end gap-2">
                                            <button onClick={() => setConfirmOpen(false)} className="px-3 py-1 rounded-lg bg-[#1F1F1F] border border-[#2A2A2A] text-white">
                                                Cancel
                                            </button>
                                            <button onClick={submitSelected} className="px-3 py-1 rounded-lg bg-[#C9F300] text-black">
                                                Confirm & Submit
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                    {!!msg && <div className="text-sm text-[#9EFF00]">{msg}</div>}
                </div>
            )}

            {/* Candidate ballot / Proposal ballot remain same as earlier version (provided above) */}
                  {election.ballotType === 'candidate' && (
                <div className="space-y-3">
                    {(!election.ballot || election.ballot.length === 0) ? (
                        <div className="rounded-2xl border border-[#2A2A2A] bg-[#171717] p-4 text-[#A1A1A1]">
                            No candidates available.
                        </div>
                    ) : (
                        <>
                            {election.ballot.map(b => {
                                const c = b.candidate;
                                return (
                                    <label key={b._id} className="block rounded-2xl border border-[#2A2A2A] bg-[#171717] p-4 cursor-pointer">
                                        <div className="flex items-start gap-3">
                                            <input
                                                type="radio"
                                                name="candidate"
                                                className="mt-1"
                                                checked={selCandidate === String(b.candidateId)}
                                                onChange={() => setSelCandidate(String(b.candidateId))}
                                                disabled={votingDisabled}
                                            />
                                            <div className="flex-1">
                                                <div className="text-white font-semibold">{c?.name || b.title}</div>
                                                <div className="text-xs text-[#A1A1A1]">
                                                    {(c?.partyName && !c?.independent) ? c.partyName : 'Independent'}
                                                    {c?.seat ? ` • Seat: ${c.seat}` : ''}
                                                    {c?.gender ? ` • ${c.gender}` : ''}
                                                    {c?.age ? ` • ${c.age}y` : ''}
                                                </div>
                                                {c?.shortSpeech && (
                                                    <div className="text-xs text-[#A1A1A1] mt-1">“{c.shortSpeech}”</div>
                                                )}
                                            </div>
                                        </div>
                                    </label>
                                );
                            })}
                            <button
                                onClick={voteCandidate}
                                disabled={votingDisabled || !selCandidate}
                                className="px-4 py-2 rounded-lg bg-[#C9F300] text-black font-medium disabled:opacity-50"
                            >
                                Submit Vote
                            </button>
                        </>
                    )}
                </div>
            )}

//             {/* PROPOSAL BALLOT */}
             {election.ballotType === 'proposal' && (
                <div className="space-y-3">
                    {(!election.ballot || election.ballot.length === 0) ? (
                        <div className="rounded-2xl border border-[#2A2A2A] bg-[#171717] p-4 text-[#A1A1A1]">
                            No proposals available.
                        </div>
                    ) : election.ballot.map(b => (
                        <div key={b._id} className="rounded-2xl border border-[#2A2A2A] bg-[#171717] p-4">
                            <div className="text-white font-semibold">{b.proposal?.title}</div>
                            {(b.proposal?.reason || b.proposal?.impact || b.proposal?.costOrTime) && (
                                <div className="text-xs text-[#A1A1A1] mt-1 space-y-0.5">
                                    {b.proposal?.reason && <div><b>Reason:</b> {b.proposal.reason}</div>}
                                    {b.proposal?.impact && <div><b>Impact:</b> {b.proposal.impact}</div>}
                                    {b.proposal?.costOrTime && <div><b>Cost/Time:</b> {b.proposal.costOrTime}</div>}
                                </div>
                            )}
                            <div className="mt-2 flex flex-wrap gap-2">
                                {(b.proposal?.options || []).map(o => (
                                    <button
                                        key={o.key}
                                        disabled={votingDisabled}
                                        onClick={() => voteProposal(b._id, o.key)}
                                        className="px-3 py-1 rounded-lg bg-[#1F1F1F] border border-[#2A2A2A] text-white hover:bg-[#2A2A2A] disabled:opacity-50"
                                    >
                                        {o.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

        </div>
    );
}

function CandidateHeader({ candidate }) {
    if (!candidate) return null;
    return (
        <div className="mb-2">
            <div className="text-white font-semibold">{candidate.name}</div>
            <div className="text-xs text-[#A1A1A1]">
                {(candidate.partyName && !candidate.independent) ? candidate.partyName : 'Independent'}
                {candidate.seat ? ` • Seat: ${candidate.seat}` : ''}
                {candidate.gender ? ` • ${candidate.gender}` : ''}
                {candidate.age ? ` • ${candidate.age}y` : ''}
            </div>
            {(candidate.shortSpeech || candidate.occupation) && (
                <div className="text-xs text-[#A1A1A1] mt-1">
                    {candidate.occupation ? <>Occupation: {candidate.occupation}</> : null}
                    {candidate.shortSpeech ? <> {candidate.occupation ? ' • ' : ''}Message: “{candidate.shortSpeech}”</> : null}
                </div>
            )}
        </div>
    );
}
