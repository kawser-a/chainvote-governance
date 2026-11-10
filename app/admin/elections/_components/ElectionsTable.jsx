'use client';

import { useState } from 'react';
import { Th, Td } from './UI';
import ElectionRow from './ElectionRow';

export default function ElectionsTable({
    list, loading, page, totalPages,
    onPrev, onNext, actions
}) {
    const [expanded, setExpanded] = useState(null);

    return (
        <>
            <div className="rounded-2xl border border-[#232323] bg-[#171717] overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead className="bg-[#1b1b1b] text-[#A1A1A1]">
                        <tr>
                            <Th text="" />
                            <Th text="Name" />
                            <Th text="Type" />
                            <Th text="Mode" />
                            <Th text="Scope" />
                            <Th text="Seats" />
                            <Th text="Start" />
                            <Th text="End" />
                            <Th text="Duration" />
                            <Th text="Time Remaining" />
                            <Th text="Status" />
                            <Th text="Ballot Items" />
                            <Th text="Actions" />
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={13} className="p-6 text-center text-[#A1A1A1]">Loading...</td></tr>
                        ) : list.length === 0 ? (
                            <tr><td colSpan={13} className="p-6 text-center text-[#A1A1A1]">No elections</td></tr>
                        ) : list.map(e => (
                            <ElectionRow
                                key={e._id}
                                e={e}
                                expanded={expanded === e._id}
                                onToggle={() => setExpanded(expanded === e._id ? null : e._id)}
                                actions={actions}
                            />
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-end gap-2 mt-2">
                <button
                    onClick={onPrev}
                    disabled={page === 1}
                    className="px-3 py-1 rounded-lg bg-[#1F1F1F] border border-[#2A2A2A] text-white disabled:opacity-50"
                >
                    Prev
                </button>
                <span className="text-[#A1A1A1] text-sm">Page {page} / {totalPages}</span>
                <button
                    onClick={onNext}
                    disabled={page === totalPages}
                    className="px-3 py-1 rounded-lg bg-[#1F1F1F] border border-[#2A2A2A] text-white disabled:opacity-50"
                >
                    Next
                </button>
            </div>
        </>
    );
}
