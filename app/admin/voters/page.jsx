'use client';
import { useEffect, useState } from 'react';

export default function ManageVotersPage() {
    const [data, setData] = useState([]);
    const [page, setPage] = useState(1);
    const [limit] = useState(20);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState('seat');
    const [sortOrder, setSortOrder] = useState('asc');
    const [seat, setSeat] = useState('');
    const [loading, setLoading] = useState(false);
    const [flags, setFlags] = useState({ registered: '', banned: '', canVote: '' });
    const [seats, setSeats] = useState([]);

    // Construct query string
    const query = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        sortBy,
        sortOrder,
        ...(search ? { search } : {}),
        ...(seat ? { seat } : {}),
        ...(flags.registered !== '' ? { registered: flags.registered } : {}),
        ...(flags.banned !== '' ? { banned: flags.banned } : {}),
        ...(flags.canVote !== '' ? { canVote: flags.canVote } : {}),
    }).toString();

    // Fetch voters data
    useEffect(() => {
        let isMounted = true;
        setLoading(true);
        fetch(`/api/admin/voters?${query}`, { cache: 'no-store' })
            .then(res => res.json())
            .then(json => {
                if (isMounted && json?.ok) {
                    setData(json.data);
                    setTotal(json.total);
                    setTotalPages(json.totalPages);
                }
            })
            .catch(() => { if (isMounted) setData([]); })
            .finally(() => { if (isMounted) setLoading(false); });
        return () => { isMounted = false; };
    }, [query]);

    // Fetch seats list
    useEffect(() => {
        let isMounted = true;
        fetch("/api/admin/stats", { cache: 'no-store' })
            .then(res => res.json())
            .then(json => {
                if (isMounted && json?.ok) {
                    setSeats(json.seats.map(s => s.seat));
                }
            });
        return () => { isMounted = false; };
    }, []);

    // Toggle fields (registered, banned, canVote)
    async function toggleStatus(nid, patch) {
        await fetch(`/api/admin/voters/${nid}/status`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(patch),
        });
        // Refresh data after update
        setLoading(true);
        const res = await fetch(`/api/admin/voters?${query}`, { cache: "no-store" });
        const json = await res.json();
        if (json?.ok) {
            setData(json.data);
            setTotal(json.total);
            setTotalPages(json.totalPages);
        }
        setLoading(false);
    }

    return (
        <section className="px-8 py-6 space-y-6 max-w-full overflow-x-auto text-gray-100">
            <h1 className="text-3xl font-extrabold tracking-tight">Manage Voters</h1>

            {/* Filter bar */}
            {/* <form className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-8 gap-4 mb-4 text-gray-300">
                <input
                    type="search"
                    placeholder="Search by name, NID, seat..."
                    className="bg-[#121212] border border-[#333] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-lime-500 text-gray-200"
                    value={search}
                    onChange={e => { setPage(1); setSearch(e.target.value); }}
                />
                <select
                    className="bg-[#121212] border border-[#333] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-lime-500 text-gray-200"
                    value={seat}
                    onChange={e => { setPage(1); setSeat(e.target.value); }}
                >
                    <option value="">All Seats</option>
                    {seats.map((s) => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </select>
                <select
                    className="bg-[#121212] border border-[#333] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-lime-500 text-gray-200"
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                >
                    <option value="seat">Seat</option>
                    <option value="name">Name</option>
                    <option value="nid">NID</option>
                    <option value="registered">Registered</option>
                    <option value="isBanned">Banned</option>
                    <option value="canVote">Can Vote</option>
                </select>
                <select
                    className="bg-[#121212] border border-[#333] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-lime-500 text-gray-200"
                    value={sortOrder}
                    onChange={e => setSortOrder(e.target.value)}
                >
                    <option value="asc">Asc</option>
                    <option value="desc">Desc</option>
                </select>
                <select
                    className="bg-[#121212] border border-[#333] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-lime-500 text-gray-200"
                    value={flags.registered}
                    onChange={e => { setPage(1); setFlags(f => ({ ...f, registered: e.target.value })); }}
                >
                    <option value="">All</option>
                    <option value="true">Registered</option>
                    <option value="false">Not Registered</option>
                </select>
                <select
                    className="bg-[#121212] border border-[#333] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-lime-500 text-gray-200"
                    value={flags.banned}
                    onChange={e => { setPage(1); setFlags(f => ({ ...f, banned: e.target.value })); }}
                >
                    <option value="">All</option>
                    <option value="true">Banned</option>
                    <option value="false">Not Banned</option>
                </select>
                <select
                    className="bg-[#121212] border border-[#333] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-lime-500 text-gray-200"
                    value={flags.canVote}
                    onChange={e => { setPage(1); setFlags(f => ({ ...f, canVote: e.target.value })); }}
                >
                    <option value="">All</option>
                    <option value="true">Can Vote</option>
                    <option value="false">Cannot Vote</option>
                </select>
            </form> */}
            <form className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-8 gap-4 mb-4 text-gray-300" aria-label="Filter and Sort Voter List">
                <div className="flex flex-col">
                    <label htmlFor="search" className="mb-1 text-xs font-semibold text-gray-400 select-none">Search</label>
                    <input
                        id="search"
                        type="search"
                        placeholder="Search by name, NID, seat..."
                        className="bg-[#121212] border border-[#333] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-lime-500 text-gray-200"
                        value={search}
                        onChange={e => { setPage(1); setSearch(e.target.value); }}
                    />
                </div>

                <div className="flex flex-col">
                    <label htmlFor="seat-filter" className="mb-1 text-xs font-semibold text-gray-400 select-none">Seat</label>
                    <select
                        id="seat-filter"
                        className="bg-[#121212] border border-[#333] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-lime-500 text-gray-200"
                        value={seat}
                        onChange={e => { setPage(1); setSeat(e.target.value); }}
                    >
                        <option value="">All Seats</option>
                        {seats.map((s) => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                </div>

                <div className="flex flex-col">
                    <label htmlFor="sort-by" className="mb-1 text-xs font-semibold text-gray-400 select-none">Sort by</label>
                    <select
                        id="sort-by"
                        className="bg-[#121212] border border-[#333] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-lime-500 text-gray-200"
                        value={sortBy}
                        onChange={e => setSortBy(e.target.value)}
                    >
                        <option value="seat">Seat</option>
                        <option value="name">Name</option>
                        <option value="nid">NID</option>
                        <option value="registered">Registered</option>
                        <option value="isBanned">Banned</option>
                        <option value="canVote">Can Vote</option>
                    </select>
                </div>

                <div className="flex flex-col">
                    <label htmlFor="sort-order" className="mb-1 text-xs font-semibold text-gray-400 select-none">Sort order</label>
                    <select
                        id="sort-order"
                        className="bg-[#121212] border border-[#333] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-lime-500 text-gray-200"
                        value={sortOrder}
                        onChange={e => setSortOrder(e.target.value)}
                    >
                        <option value="asc">Ascending</option>
                        <option value="desc">Descending</option>
                    </select>
                </div>

                <div className="flex flex-col">
                    <label htmlFor="registered-filter" className="mb-1 text-xs font-semibold text-gray-400 select-none">Registered</label>
                    <select
                        id="registered-filter"
                        className="bg-[#121212] border border-[#333] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-lime-500 text-gray-200"
                        value={flags.registered}
                        onChange={e => { setPage(1); setFlags(f => ({ ...f, registered: e.target.value })); }}
                    >
                        <option value="">All</option>
                        <option value="true">Registered</option>
                        <option value="false">Not Registered</option>
                    </select>
                </div>

                <div className="flex flex-col">
                    <label htmlFor="banned-filter" className="mb-1 text-xs font-semibold text-gray-400 select-none">Banned</label>
                    <select
                        id="banned-filter"
                        className="bg-[#121212] border border-[#333] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-lime-500 text-gray-200"
                        value={flags.banned}
                        onChange={e => { setPage(1); setFlags(f => ({ ...f, banned: e.target.value })); }}
                    >
                        <option value="">All</option>
                        <option value="true">Banned</option>
                        <option value="false">Not Banned</option>
                    </select>
                </div>

                <div className="flex flex-col">
                    <label htmlFor="can-vote-filter" className="mb-1 text-xs font-semibold text-gray-400 select-none">Can Vote</label>
                    <select
                        id="can-vote-filter"
                        className="bg-[#121212] border border-[#333] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-lime-500 text-gray-200"
                        value={flags.canVote}
                        onChange={e => { setPage(1); setFlags(f => ({ ...f, canVote: e.target.value })); }}
                    >
                        <option value="">All</option>
                        <option value="true">Can Vote</option>
                        <option value="false">Cannot Vote</option>
                    </select>
                </div>
            </form>


            {/* Table */}
            <div className="overflow-x-auto rounded-xl bg-gradient-to-b from-[#171717] to-[#141414] border border-[#232323] shadow-sm">
                <table className="min-w-full text-sm border-collapse">
                    <thead className="bg-[#1b1b1b] text-gray-400 text-xs uppercase tracking-wider select-none">
                        <tr>
                            <TableHeader>Seat</TableHeader>
                            <TableHeader>Name</TableHeader>
                            <TableHeader>NID</TableHeader>
                            <TableHeader>SIMs</TableHeader>
                            <TableHeader>Registered</TableHeader>
                            <TableHeader>Can Vote</TableHeader>
                            <TableHeader>Banned</TableHeader>
                            <TableHeader>Actions</TableHeader>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={8} className="py-12 text-center text-gray-500">
                                    Loading...
                                </td>
                            </tr>
                        ) : data.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="py-12 text-center text-gray-500">
                                    No voters found.
                                </td>
                            </tr>
                        ) : (
                            data.map((v) => (
                                <tr key={v.nid} className="border-t border-[#292929] hover:bg-[#222]">
                                    <TableCell>{v.seat}</TableCell>
                                    <TableCell className="text-white font-medium">{v.name}</TableCell>
                                    <TableCell className="text-[#9EFF00] font-mono">{v.nid}</TableCell>
                                    <TableCell>{(v.sims ?? []).join(", ")}</TableCell>
                                    <TableCell>{v.registered ? "Yes" : "No"}</TableCell>
                                    <TableCell>{v.canVoteEffective ? "Yes" : "No"}</TableCell>
                                    <TableCell>{v.isBanned ? "Yes" : "No"}</TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <button
                                                disabled={loading}
                                                onClick={() => toggleStatus(v.nid, { canVote: !v.canVote })}
                                                className="px-3 py-1 text-xs rounded bg-gray-800 border border-gray-600 text-gray-200 hover:bg-gray-700 transition"
                                            >
                                                {v.canVote ? "Disable" : "Enable"}
                                            </button>
                                            <button
                                                disabled={loading}
                                                onClick={() => toggleStatus(v.nid, { isBanned: !v.isBanned })}
                                                className={`px-3 py-1 text-xs rounded text-white transition ${v.isBanned
                                                    ? "bg-green-700 border-green-800 hover:bg-green-600"
                                                    : "bg-red-600 border-red-700 hover:bg-red-500"
                                                    }`}
                                            >
                                                {v.isBanned ? "Unban" : "Ban"}
                                            </button>
                                        </div>
                                    </TableCell>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4 text-gray-300 select-none">
                <span>Total voters: {total.toLocaleString()}</span>
                <div className="flex items-center gap-2">
                    <button
                        disabled={page <= 1 || loading}
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        className="px-3 py-1 rounded border border-gray-600 hover:bg-gray-700 disabled:opacity-40"
                    >
                        Prev
                    </button>
                    <span>
                        Page {page} of {totalPages}
                    </span>
                    <button
                        disabled={page >= totalPages || loading}
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        className="px-3 py-1 rounded border border-gray-600 hover:bg-gray-700 disabled:opacity-40"
                    >
                        Next
                    </button>
                </div>
            </div>
        </section>
    );
}

function TableHeader({ children }) {
    return (
        <th className="px-4 py-3 text-left font-semibold">{children}</th>
    );
}

function TableCell({ children, className = "" }) {
    return (
        <td className={`px-4 py-2 whitespace-nowrap text-sm ${className}`}>{children}</td>
    );
}
