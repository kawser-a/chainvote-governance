'use client';
import { useCallback, useEffect, useState } from 'react';
import { IdCard, Search } from 'lucide-react';
import { Alert, Badge, Button, Card, CardBody, EmptyState, Input, Loading, PageHeader, Select } from '../../components/ui/primitives';
import { ConfirmDialog, DataTable, Pagination, Segmented, useToast } from '../../components/ui/interactive';

const FILTERS = [
    { value: 'all', label: 'All', q: {} },
    { value: 'enrolled', label: 'Enrolled', q: { registered: 'true' } },
    { value: 'not_enrolled', label: 'Not enrolled', q: { registered: 'false' } },
    { value: 'disabled', label: 'Voting disabled', q: { canVote: 'false', banned: 'false' } },
    { value: 'banned', label: 'Banned', q: { banned: 'true' } },
];

function VotingBadge({ v }) {
    if (v.isBanned) return <Badge tone="danger">Banned</Badge>;
    if (v.canVote === false) return <Badge tone="warning">Voting disabled</Badge>;
    if (!v.enrollmentDone) return <Badge>Can’t vote until enrolled</Badge>;
    return <Badge tone="success">Can vote</Badge>;
}

export default function ManageVotersPage() {
    const { notify } = useToast();
    const [rows, setRows] = useState([]);
    const [state, setState] = useState('loading');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [searchInput, setSearchInput] = useState('');
    const [search, setSearch] = useState('');
    const [seat, setSeat] = useState('');
    const [seats, setSeats] = useState([]);
    const [filter, setFilter] = useState('all');
    const [sortBy, setSortBy] = useState('seat');
    const [banning, setBanning] = useState(null);
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => { setPage(1); setSearch(searchInput.trim()); }, 300);
        return () => clearTimeout(t);
    }, [searchInput]);

    useEffect(() => {
        fetch('/api/admin/stats', { cache: 'no-store' })
            .then((r) => r.json())
            .then((j) => j?.ok && setSeats((j.seats || []).map((s) => s.seat).filter(Boolean).sort()))
            .catch(() => {});
    }, []);

    const load = useCallback(async () => {
        setState((s) => (s === 'ready' ? 'refreshing' : 'loading'));
        const q = new URLSearchParams({
            page: String(page),
            limit: '20',
            sortBy,
            sortOrder: 'asc',
            ...(search ? { search } : {}),
            ...(seat ? { seat } : {}),
            ...FILTERS.find((f) => f.value === filter).q,
        });
        try {
            const r = await fetch(`/api/admin/voters?${q}`, { cache: 'no-store' });
            const j = await r.json();
            if (!j.ok) throw new Error();
            setRows(j.data || []);
            setTotal(j.total || 0);
            setTotalPages(j.totalPages || 1);
            setState('ready');
        } catch {
            setState('error');
        }
    }, [page, sortBy, search, seat, filter]);

    useEffect(() => {
        load();
    }, [load]);

    async function update(v, patch) {
        const r = await fetch(`/api/admin/voters/${v.nid}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(patch),
        });
        const j = await r.json();
        if (!j.ok) throw new Error(j.error || 'Update failed');
        await load();
    }

    async function toggleVoting(v) {
        const next = !v.canVote;
        try {
            await update(v, { canVote: next });
            notify(next ? `${v.name} can vote again.` : `Voting disabled for ${v.name}.`, {
                duration: 8000,
                action: { label: 'Undo', onClick: () => update(v, { canVote: !next }).catch(() => {}) },
            });
        } catch (err) {
            notify(err.message, { tone: 'danger' });
        }
    }

    async function confirmBan() {
        setBusy(true);
        const v = banning;
        try {
            await update(v, { isBanned: !v.isBanned, ...(v.isBanned ? { canVote: true } : {}) });
            notify(v.isBanned ? `Ban lifted for ${v.name}.` : `${v.name} has been banned from voting.`);
            setBanning(null);
        } catch (err) {
            notify(err.message, { tone: 'danger' });
        } finally {
            setBusy(false);
        }
    }

    const changeFilter = (f) => { setPage(1); setFilter(f); };

    return (
        <>
            <PageHeader title="Voters" description="Everyone on the voter roll, whether they’ve enrolled, and whether they can vote." />

            <div className="mb-4 grid gap-3 md:grid-cols-[1fr_12rem_10rem]">
                <div className="relative">
                    <label htmlFor="v-search" className="sr-only">Search voters</label>
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-3" aria-hidden="true" />
                    <Input id="v-search" type="search" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Search by name or NID" className="pl-10" />
                </div>
                <div>
                    <label htmlFor="v-seat" className="sr-only">Seat</label>
                    <Select id="v-seat" value={seat} onChange={(e) => { setPage(1); setSeat(e.target.value); }}>
                        <option value="">All seats</option>
                        {seats.map((s) => <option key={s} value={s}>{s}</option>)}
                    </Select>
                </div>
                <div>
                    <label htmlFor="v-sort" className="sr-only">Sort by</label>
                    <Select id="v-sort" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                        <option value="seat">Sort by seat</option>
                        <option value="name">Sort by name</option>
                        <option value="nid">Sort by NID</option>
                    </Select>
                </div>
            </div>
            <Segmented label="Filter by status" value={filter} onChange={changeFilter} options={FILTERS} className="mb-4" />

            <Card aria-busy={state === 'refreshing'}>
                {state === 'loading' && <CardBody><Loading rows={4} label="Loading voters…" /></CardBody>}
                {state === 'error' && <CardBody><Alert tone="danger" action={<Button variant="secondary" size="sm" onClick={load}>Try again</Button>}>We couldn’t load the voter roll.</Alert></CardBody>}
                {(state === 'ready' || state === 'refreshing') && (
                    <>
                        <DataTable
                            caption="Voters" breakpoint="xl"
                            rows={rows}
                            rowKey={(v) => v.nid}
                            empty={<EmptyState icon={IdCard} title="No voters match">Try a different search, seat or status.</EmptyState>}
                            columns={[
                                {
                                    key: 'name', header: 'Voter', primary: true,
                                    cell: (v) => (
                                        <div>
                                            <p className="font-medium text-ink">{v.name}</p>
                                            <p className="text-sm font-normal tabular-nums text-ink-3">NID {v.nid}</p>
                                        </div>
                                    ),
                                },
                                { key: 'seat', header: 'Seat', nowrap: true, cell: (v) => v.seat || '—' },
                                { key: 'enrolled', header: 'Enrollment', cell: (v) => (v.enrollmentDone ? <Badge tone="success">Enrolled</Badge> : <Badge>Not enrolled</Badge>) },
                                { key: 'voting', header: 'Voting', cell: (v) => <VotingBadge v={v} /> },
                            ]}
                            actions={(v) => (
                                <>
                                    {!v.isBanned && (
                                        <Button size="sm" variant="secondary" onClick={() => toggleVoting(v)}>
                                            {v.canVote ? 'Disable voting' : 'Allow voting'}
                                        </Button>
                                    )}
                                    <Button size="sm" variant={v.isBanned ? 'secondary' : 'danger-outline'} onClick={() => setBanning(v)}>
                                        {v.isBanned ? 'Lift ban' : 'Ban'}
                                    </Button>
                                </>
                            )}
                        />
                        {rows.length > 0 && (
                            <div className="border-t border-line px-4 py-4 sm:px-6">
                                <Pagination page={page} pages={totalPages} total={total} noun="voters" onChange={setPage} />
                            </div>
                        )}
                    </>
                )}
            </Card>

            <ConfirmDialog
                open={!!banning}
                onCancel={() => setBanning(null)}
                onConfirm={confirmBan}
                loading={busy}
                tone={banning?.isBanned ? 'primary' : 'danger'}
                title={banning?.isBanned ? `Lift the ban on ${banning?.name}?` : `Ban ${banning?.name}?`}
                description={banning ? `NID ${banning.nid} · ${banning.seat}` : undefined}
                confirmLabel={banning?.isBanned ? 'Lift ban' : 'Ban voter'}
            >
                <p className="text-[15px] text-ink-2">
                    {banning?.isBanned
                        ? 'They’ll be able to vote again in elections they’re eligible for.'
                        : 'They won’t be able to vote in any election until the ban is lifted. Votes already cast are kept.'}
                </p>
            </ConfirmDialog>
        </>
    );
}
