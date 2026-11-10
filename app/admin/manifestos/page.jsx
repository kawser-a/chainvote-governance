'use client';
import { useCallback, useEffect, useState } from 'react';
import { FileText, Search } from 'lucide-react';
import { Alert, Badge, Button, Card, CardBody, EmptyState, Input, Loading, PageHeader, Select, StatusBadge } from '../../components/ui/primitives';
import { ConfirmDialog, Pagination, Segmented, useToast } from '../../components/ui/interactive';
import { formatDate, formatDateTime } from '../../components/ui/format';

const TABS = [
    { value: 'pending', label: 'Awaiting review' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'all', label: 'All' },
];

function deadline(m) {
    if (!m.createdAt) return null;
    const d = new Date(m.createdAt);
    if (m.targetWindowMinutes) return { date: new Date(d.getTime() + m.targetWindowMinutes * 60000), label: `${m.targetWindowMinutes} minute${m.targetWindowMinutes === 1 ? '' : 's'} (test window)`, precise: true };
    if (m.targetWindowMonths) {
        d.setMonth(d.getMonth() + m.targetWindowMonths);
        return { date: d, label: `${m.targetWindowMonths} month${m.targetWindowMonths === 1 ? '' : 's'}`, precise: false };
    }
    return null;
}

function ManifestoCard({ m, busy, onApprove, onReject }) {
    const party = m.candidate?.independent || !m.candidate?.partyName ? 'Independent' : m.candidate.partyName;
    const due = deadline(m);
    return (
        <Card as="article">
            <CardBody>
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                        <h2 className="text-lg font-semibold text-ink [overflow-wrap:anywhere]">{m.title}</h2>
                        <p className="mt-1 text-sm text-ink-2">
                            {m.candidate?.name} · {party} · {m.seat}
                        </p>
                    </div>
                    <StatusBadge status={m.status} />
                </div>

                <p className="mt-4 whitespace-pre-line text-[15px] leading-relaxed text-ink [overflow-wrap:anywhere]">
                    {m.summary || <span className="text-ink-3">No summary was given.</span>}
                </p>

                <dl className="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
                    <div>
                        <dt className="text-ink-3">Submitted</dt>
                        <dd className="text-ink">{formatDateTime(m.createdAt)}</dd>
                    </div>
                    {due && (
                        <div>
                            <dt className="text-ink-3">Promised within</dt>
                            <dd className="text-ink">{due.label} · by {due.precise ? formatDateTime(due.date) : formatDate(due.date)}</dd>
                        </div>
                    )}
                </dl>

                <div className="mt-5 flex flex-col-reverse gap-2 border-t border-line pt-4 sm:flex-row sm:justify-end">
                    {m.status !== 'rejected' && (
                        <Button variant="danger-outline" onClick={onReject} disabled={busy}>
                            {m.status === 'approved' ? 'Withdraw approval' : 'Reject'}
                        </Button>
                    )}
                    {m.status !== 'approved' && (
                        <Button onClick={onApprove} loading={busy} loadingText="Approving…">
                            {m.status === 'rejected' ? 'Approve instead' : 'Approve and publish'}
                        </Button>
                    )}
                </div>
            </CardBody>
        </Card>
    );
}

export default function AdminManifestos() {
    const { notify } = useToast();
    const [rows, setRows] = useState([]);
    const [state, setState] = useState('loading');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [status, setStatus] = useState('pending');
    const [seat, setSeat] = useState('');
    const [seats, setSeats] = useState([]);
    const [searchInput, setSearchInput] = useState('');
    const [search, setSearch] = useState('');
    const [sortOrder, setSortOrder] = useState('asc');
    const [busyId, setBusyId] = useState(null);
    const [rejecting, setRejecting] = useState(null);

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
        const q = new URLSearchParams({ page: String(page), limit: '10', status, sortBy: 'createdAt', sortOrder });
        if (seat) q.set('seat', seat);
        if (search) q.set('search', search);
        try {
            const r = await fetch(`/api/admin/manifestos?${q}`, { cache: 'no-store' });
            const j = await r.json();
            if (!j.ok) throw new Error();
            setRows(j.data || []);
            setTotal(j.total || 0);
            setTotalPages(j.totalPages || 1);
            setState('ready');
        } catch {
            setState('error');
        }
    }, [page, status, seat, search, sortOrder]);

    useEffect(() => {
        load();
    }, [load]);

    async function setDecision(m, next) {
        setBusyId(m._id);
        try {
            const r = await fetch(`/api/admin/manifestos/${m._id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: next }),
            });
            const j = await r.json();
            if (!j.ok) throw new Error(j.error || 'The decision wasn’t saved.');
            notify(
                next === 'approved'
                    ? `“${m.title}” is approved and now visible to voters in ${m.seat}.`
                    : `“${m.title}” was rejected. Voters won’t see it.`,
            );
            setRejecting(null);
            await load();
        } catch (err) {
            notify(err.message, { tone: 'danger' });
        } finally {
            setBusyId(null);
        }
    }

    const emptyText = {
        pending: ['You’re all caught up', 'New manifestos from candidates will appear here for review.'],
        approved: ['No approved manifestos', 'Approved manifestos are shown to voters and can be petitioned.'],
        rejected: ['No rejected manifestos', null],
        all: ['No manifestos yet', 'Candidates haven’t submitted any manifestos.'],
    }[status];
    const filtered = search || seat;

    return (
        <>
            <PageHeader
                title="Manifestos"
                description="Candidates’ promises wait here until you approve them. Approved manifestos are shown to voters in that seat."
            />

            <Segmented label="Show" value={status} onChange={(v) => { setPage(1); setStatus(v); }} options={TABS} className="mb-4" />

            <div className="mb-6 grid gap-3 md:grid-cols-[1fr_12rem_12rem]">
                <div className="relative">
                    <label htmlFor="m-search" className="sr-only">Search by title</label>
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-3" aria-hidden="true" />
                    <Input id="m-search" type="search" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Search by title" className="pl-10" />
                </div>
                <div>
                    <label htmlFor="m-seat" className="sr-only">Seat</label>
                    <Select id="m-seat" value={seat} onChange={(e) => { setPage(1); setSeat(e.target.value); }}>
                        <option value="">All seats</option>
                        {seats.map((s) => <option key={s} value={s}>{s}</option>)}
                    </Select>
                </div>
                <div>
                    <label htmlFor="m-sort" className="sr-only">Order</label>
                    <Select id="m-sort" value={sortOrder} onChange={(e) => { setPage(1); setSortOrder(e.target.value); }}>
                        <option value="asc">Oldest first</option>
                        <option value="desc">Newest first</option>
                    </Select>
                </div>
            </div>

            {state === 'loading' && <Card><CardBody><Loading rows={3} label="Loading manifestos…" /></CardBody></Card>}
            {state === 'error' && (
                <Alert tone="danger" action={<Button variant="secondary" size="sm" onClick={load}>Try again</Button>}>We couldn’t load manifestos.</Alert>
            )}
            {(state === 'ready' || state === 'refreshing') && (
                rows.length === 0 ? (
                    <Card>
                        <EmptyState icon={FileText} title={filtered ? 'Nothing matches' : emptyText[0]}>
                            {filtered ? 'Try a different title or seat.' : emptyText[1]}
                        </EmptyState>
                    </Card>
                ) : (
                    <div className="space-y-4" aria-busy={state === 'refreshing'}>
                        {status === 'pending' && (
                            <p className="text-sm text-ink-2">
                                <Badge tone="warning">{total}</Badge> waiting for review. The oldest are shown first.
                            </p>
                        )}
                        {rows.map((m) => (
                            <ManifestoCard
                                key={m._id}
                                m={m}
                                busy={busyId === m._id}
                                onApprove={() => setDecision(m, 'approved')}
                                onReject={() => setRejecting(m)}
                            />
                        ))}
                        <Pagination page={page} pages={totalPages} total={total} noun="manifestos" onChange={setPage} />
                    </div>
                )
            )}

            <ConfirmDialog
                open={!!rejecting}
                onCancel={() => setRejecting(null)}
                onConfirm={() => setDecision(rejecting, 'rejected')}
                loading={!!rejecting && busyId === rejecting._id}
                tone="danger"
                title={rejecting?.status === 'approved' ? 'Withdraw approval?' : 'Reject this manifesto?'}
                description={rejecting ? `“${rejecting.title}” by ${rejecting.candidate?.name}` : undefined}
                confirmLabel={rejecting?.status === 'approved' ? 'Withdraw approval' : 'Reject manifesto'}
            >
                <p className="text-[15px] text-ink-2">
                    Voters won’t see it any more. You can approve it again later from the Rejected tab.
                </p>
            </ConfirmDialog>
        </>
    );
}
