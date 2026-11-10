'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { FileText, Users, UserRound, Vote, ChevronRight } from 'lucide-react';
import { Alert, Button, ButtonLink, Card, CardHeader, EmptyState, Loading, PageHeader, Stat } from '../../components/ui/primitives';
import { formatDate } from '../../components/ui/format';

export default function CandidateDashboard() {
    const [me, setMe] = useState(null);
    const [stats, setStats] = useState(null);
    const [state, setState] = useState('loading');

    async function load() {
        setState('loading');
        try {
            const r1 = await fetch('/api/candidate/me', { cache: 'no-store' });
            const j1 = await r1.json();
            if (!j1?.ok) throw new Error('session');
            setMe(j1);
            const r2 = await fetch('/api/candidate/stats', { cache: 'no-store' });
            const j2 = await r2.json().catch(() => null);
            setStats(j2?.ok ? j2 : null);
            setState('ready');
        } catch (e) {
            setState(e.message === 'session' ? 'session' : 'error');
        }
    }

    useEffect(() => {
        load();
    }, []);

    const manifestos = useMemo(() => [...(stats?.myManifestos || [])].sort((a, b) => (b.votes || 0) - (a.votes || 0)), [stats]);
    const totalVotes = manifestos.reduce((s, m) => s + (m.votes || 0), 0);
    const maxVotes = manifestos[0]?.votes || 0;

    if (state === 'loading') return <Loading label="Loading your overview…" rows={4} />;
    if (state === 'session') {
        return (
            <Alert tone="warning" title="Your session has ended" action={<ButtonLink href="/candidate/login" size="sm">Sign in again</ButtonLink>}>
                Please sign in again to continue.
            </Alert>
        );
    }
    if (state === 'error') {
        return (
            <Alert tone="danger" title="We couldn’t load your overview" action={<Button variant="secondary" size="sm" onClick={load}>Try again</Button>}>
                Check your connection and try again.
            </Alert>
        );
    }

    const party = me.partyName && !me.independent ? me.partyName : 'Independent';
    const ongoing = stats?.ongoingElections || [];

    return (
        <>
            <PageHeader
                eyebrow={`${me.seat} · ${party}`}
                title={`Hello, ${me.name}`}
                description="How your commitments are doing with voters in your constituency."
                actions={<ButtonLink href="/candidate/manifestos">Add a manifesto</ButtonLink>}
            />

            <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
                <Stat label="Votes for your commitments" value={totalVotes.toLocaleString()} icon={Vote} />
                <Stat label="Approved manifestos" value={manifestos.length} icon={FileText} />
                <Stat label="Enrolled voters in seat" value={(stats?.totalVoters ?? 0).toLocaleString()} icon={Users} />
                <Stat label="Other candidates" value={stats?.oppositionCount ?? 0} icon={UserRound} />
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
                <Card>
                    <CardHeader
                        title="Your approved manifestos"
                        description="Ranked by votes received across all elections."
                        action={<Link href="/candidate/manifestos" className="text-sm font-semibold text-brand underline hover:text-brand-hover">Manage manifestos</Link>}
                    />
                    {manifestos.length === 0 ? (
                        <EmptyState
                            icon={FileText}
                            title="No approved manifestos yet"
                            action={<ButtonLink href="/candidate/manifestos" variant="secondary">Write your first manifesto</ButtonLink>}
                        >
                            Manifestos you submit are reviewed by the election office before voters can see them.
                        </EmptyState>
                    ) : (
                        <ol className="divide-y divide-line">
                            {manifestos.map((m, i) => (
                                <li key={m._id} className="px-4 py-4 sm:px-6">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="font-medium text-ink">{m.title}</p>
                                            {m.createdAt && <p className="text-sm text-ink-3">Added {formatDate(m.createdAt)}</p>}
                                        </div>
                                        <p className="shrink-0 text-sm tabular-nums">
                                            <span className="font-semibold text-ink">{(m.votes || 0).toLocaleString()}</span>
                                            <span className="text-ink-3"> votes</span>
                                        </p>
                                    </div>
                                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-subtle" aria-hidden="true">
                                        <div className={i === 0 ? 'h-full rounded-full bg-brand' : 'h-full rounded-full bg-ink-3/60'} style={{ width: `${maxVotes ? Math.max(2, ((m.votes || 0) / maxVotes) * 100) : 0}%` }} />
                                    </div>
                                </li>
                            ))}
                        </ol>
                    )}
                </Card>

                <div className="space-y-6">
                    <Card>
                        <CardHeader title="Elections in progress" level={2} />
                        {ongoing.length === 0 ? (
                            <p className="px-4 py-4 text-sm text-ink-3 sm:px-6">No election for your seat is open right now.</p>
                        ) : (
                            <ul className="divide-y divide-line">
                                {ongoing.map((e) => (
                                    <li key={e._id} className="px-4 py-3 sm:px-6">
                                        <p className="font-medium text-ink">{e.name}</p>
                                        {e.endAt && <p className="text-sm text-ink-3">Closes {formatDate(e.endAt)}</p>}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </Card>

                    <Card>
                        <CardHeader title="Next steps" level={2} />
                        <ul className="divide-y divide-line">
                            {[
                                ['/candidate/profile', 'Keep your profile up to date', 'Voters see your background next to your manifestos.'],
                                ['/candidate/results', 'See results for your seat', 'Votes per manifesto in finished elections.'],
                                ['/candidate/petitions', 'Check petitions', 'Voters can petition if a deadline passes.'],
                            ].map(([href, t, d]) => (
                                <li key={href}>
                                    <Link href={href} className="group flex items-center gap-3 px-4 py-3 hover:bg-subtle/60 sm:px-6">
                                        <div className="min-w-0 flex-1">
                                            <p className="font-medium text-ink group-hover:underline">{t}</p>
                                            <p className="text-sm text-ink-3">{d}</p>
                                        </div>
                                        <ChevronRight className="h-5 w-5 shrink-0 text-ink-3" aria-hidden="true" />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </Card>
                </div>
            </div>
        </>
    );
}
