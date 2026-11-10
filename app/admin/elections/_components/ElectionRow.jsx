'use client';

import { useState } from 'react';
import LiveElectionWidget from '@/app/components/LiveElectionWidget';
import { Td } from './UI';
import { fmtElig, fmtLocation, msToHhmm, timeRemaining } from '../_lib/time';

export default function ElectionRow({ e, expanded, onToggle, actions }) {
    const [csv, setCsv] = useState('');

    const scope = e.eligibility?.scope || 'seat';
    const seats = (e.eligibility?.seats?.length ? e.eligibility.seats : e.seats) || [];
    const isManifestoSeat = e.ballotType === 'manifesto' && scope === 'seat';
    const isCandidate = e.ballotType === 'candidate';
    const isActive = e.status === 'active';
    const isPaused = e.status === 'paused';

    const dur = msToHhmm(new Date(e.endAt) - new Date(e.startAt));
    const rem = timeRemaining(e);

    return (
        <>
            <tr className="border-t border-[#232323]">
                <Td className="w-8">
                    <button
                        onClick={onToggle}
                        className="text-[#9EFF00] hover:underline"
                        aria-label="Toggle details"
                    >
                        {expanded ? '▾' : '▸'}
                    </button>
                </Td>
                <Td className="text-white">{e.name}</Td>
                <Td className="capitalize">{e.type}</Td>
                <Td className="capitalize">{e.voteMode || '-'}</Td>
                <Td className="capitalize">{scope}</Td>
                <Td className="text-[#A1A1A1]">{seats.join(', ')}</Td>
                <Td>{new Date(e.startAt).toLocaleString()}</Td>
                <Td>{new Date(e.endAt).toLocaleString()}</Td>
                <Td>{dur}</Td>
                <Td className={rem.label.includes('Ended') ? 'text-red-400' : 'text-[#C9F300]'}>{rem.label}</Td>
                <Td className="capitalize">{e.status}</Td>
                <Td>{e.ballot?.length || 0}</Td>
                <Td>
                    <div className="flex flex-wrap gap-2">
                        {isManifestoSeat && (
                            <button
                                onClick={() => actions.rebuildBallot(e._id)}
                                className="px-3 py-1 rounded-lg text-xs bg-[#1F1F1F] border border-[#2A2A2A] text-white hover:bg-[#2A2A2A]"
                            >
                                Rebuild Ballot
                            </button>
                        )}
                        {isCandidate && (
                            <div className="flex items-center gap-2">
                                <input
                                    value={csv}
                                    onChange={(ev) => setCsv(ev.target.value)}
                                    placeholder="Candidate IDs (CSV)"
                                    className="bg-[#0F0F0F] border border-[#2A2A2A] rounded-lg px-2 py-1 text-[#EDEDED] text-xs"
                                />
                                <button
                                    onClick={() => actions.addCandidates(e._id, csv).then(() => setCsv('')).catch(err => alert(err.message))}
                                    className="px-3 py-1 rounded-lg text-xs bg-[#1F1F1F] border border-[#2A2A2A] text-white hover:bg-[#2A2A2A]"
                                >
                                    Add
                                </button>
                            </div>
                        )}

                        {e.status === 'scheduled' && (
                            <button
                                onClick={() => actions.setStatusRow(e._id, 'active')}
                                className="px-3 py-1 rounded-lg text-xs bg-green-600 text-white hover:bg-green-700"
                            >
                                Set Active
                            </button>
                        )}

                        {isActive && (
                            <>
                                <button
                                    onClick={() => {
                                        const reason = window.prompt('Reason for pausing (optional, max 500 chars):') || '';
                                        actions.pause(e._id, reason).catch(err => alert(err.message));
                                    }}
                                    className="px-3 py-1 rounded-lg text-xs bg-yellow-600 text-white hover:bg-yellow-700"
                                >
                                    Pause
                                </button>
                                <button
                                    onClick={() => actions.setStatusRow(e._id, 'completed').catch(err => alert(err.message))}
                                    className="px-3 py-1 rounded-lg text-xs bg-orange-600 text-white hover:bg-orange-700"
                                >
                                    Complete
                                </button>
                            </>
                        )}

                        {isPaused && (
                            <button
                                onClick={() => actions.resume(e._id).catch(err => alert(err.message))}
                                className="px-3 py-1 rounded-lg text-xs bg-blue-600 text-white hover:bg-blue-700"
                            >
                                Resume
                            </button>
                        )}
                    </div>
                </Td>
            </tr>

            {/* Expanded row */}
            <tr className={expanded ? 'table-row' : 'hidden'}>
                <td colSpan={13} className="px-4 py-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="rounded-xl border border-[#2A2A2A] p-3">
                            <div className="text-white font-medium mb-2">Details</div>
                            <div className="text-[#A1A1A1] text-sm space-y-1">
                                <div><b>Ballot Type:</b> {e.ballotType}</div>
                                <div><b>Multi-Select:</b> {e.multiSelect ? 'Yes' : 'No'}</div>
                                <div><b>Level:</b> {e.level || '-'}</div>
                                <div><b>Location:</b> {fmtLocation(e.location)}</div>
                                <div><b>Eligibility:</b> {fmtElig(e.eligibility)}</div>
                                {e.status === 'paused' && (
                                    <>
                                        <div><b>Paused At:</b> {e.pausedAt ? new Date(e.pausedAt).toLocaleString() : '-'}</div>
                                        {e.pauseReason && <div><b>Reason:</b> {e.pauseReason}</div>}
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="rounded-xl border border-[#2A2A2A] p-3">
                            <div className="text-white font-medium mb-2">Live Votes</div>
                            {e.status === 'active' ? (
                                <LiveElectionWidget electionId={e._id} />
                            ) : (
                                <div className="text-[#A1A1A1] text-sm">
                                    {e.status === 'paused' ? 'Election is paused.' : 'Live counts available when election is active.'}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-4 rounded-xl border border-[#2A2A2A] p-3">
                        <div className="text-white font-medium mb-2">Ballot Items</div>
                        {(!e.ballot || e.ballot.length === 0) ? (
                            <div className="text-[#A1A1A1] text-sm">No items.</div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {e.ballot.map((b) => (
                                    <div key={b._id} className="rounded-lg border border-[#2A2A2A] p-2">
                                        {e.ballotType === 'proposal' ? (
                                            <>
                                                <div className="text-white font-medium">{b.proposal?.title}</div>
                                                {b.proposal?.reason && <div className="text-xs text-[#A1A1A1]">Reason: {b.proposal?.reason}</div>}
                                                {b.proposal?.impact && <div className="text-xs text-[#A1A1A1]">Impact: {b.proposal?.impact}</div>}
                                                {b.proposal?.costOrTime && <div className="text-xs text-[#A1A1A1]">Cost/Time: {b.proposal?.costOrTime}</div>}
                                                <div className="mt-1 text-xs text-[#A1A1A1]">
                                                    Options: {(b.proposal?.options || []).map(o => o.label).join(', ')}
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="text-white font-medium">{b.title}</div>
                                                {b.seat && <div className="text-xs text-[#A1A1A1]">Seat: {b.seat}</div>}
                                                {b.candidateId && <div className="text-xs text-[#A1A1A1]">Candidate: {String(b.candidateId)}</div>}
                                                {b.manifestoId && <div className="text-xs text-[#A1A1A1]">Manifesto: {String(b.manifestoId)}</div>}
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </td>
            </tr>
        </>
    );
}
