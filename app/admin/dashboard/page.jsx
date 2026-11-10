import Link from 'next/link';
import { ChevronRight, FileText, FileWarning, IdCard, Users, Vote } from 'lucide-react';
import { dbConnect } from '@/lib/db';
import Voter from '@/models/Voter';
import Manifesto from '@/models/Manifesto';
import Election from '@/models/Election';
import Petition from '@/models/Petition';
import { ButtonLink, Card, CardHeader, EmptyState, PageHeader, Stat, StatusBadge } from '../../components/ui/primitives';
import { electionPhase, formatDateTime, phaseLabel } from '../../components/ui/format';

export const metadata = { title: 'Overview · Election office' };
export const dynamic = 'force-dynamic';

function pct(a, b) {
    return b ? Math.round((a / b) * 100) : 0;
}

export default async function AdminDashboard() {
    await dbConnect();
    const now = new Date();
    const [voters, enrolled, pendingManifestos, openPetitions, reviewPetitions, current, seatRows] = await Promise.all([
        Voter.countDocuments({}),
        Voter.countDocuments({ enrollmentDone: true }),
        Manifesto.countDocuments({ status: 'pending' }),
        Petition.countDocuments({ status: 'open' }),
        Petition.countDocuments({ status: 'under_review' }),
        Election.find({ status: { $in: ['active', 'scheduled', 'paused'] }, endAt: { $gte: now } }).sort({ startAt: 1 }).limit(6).lean(),
        Voter.aggregate([
            { $group: { _id: '$seat', total: { $sum: 1 }, enrolled: { $sum: { $cond: ['$enrollmentDone', 1, 0] } } } },
            { $sort: { total: -1 } },
            { $limit: 12 },
        ]),
    ]);

    const todo = [
        { href: '/admin/manifestos', icon: FileText, count: pendingManifestos, label: 'manifesto', verb: 'waiting for review' },
        { href: '/admin/petitions', icon: FileWarning, count: openPetitions, label: 'petition', verb: 'not yet looked at' },
    ];
    const outstanding = todo.filter((t) => t.count > 0);

    return (
        <>
            <PageHeader
                title="Overview"
                description="What needs your attention, and how the elections you run are going."
                actions={<ButtonLink href="/admin/elections">Set up an election</ButtonLink>}
            />

            <Card className="mb-8">
                <CardHeader title="Needs your attention" description={outstanding.length ? undefined : 'Nothing is waiting for you right now.'} />
                {outstanding.length > 0 && (
                    <ul className="divide-y divide-line">
                        {outstanding.map(({ href, icon: Icon, count, label, verb }) => (
                            <li key={href}>
                                <Link href={href} className="group flex items-center gap-4 px-4 py-4 hover:bg-subtle/60 sm:px-6">
                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-warn-soft text-warn">
                                        <Icon className="h-5 w-5" aria-hidden="true" />
                                    </span>
                                    <p className="min-w-0 flex-1 text-ink">
                                        <span className="font-semibold tabular-nums">{count}</span> {label}{count === 1 ? '' : 's'} {verb}
                                    </p>
                                    <span className="hidden text-sm font-semibold text-brand group-hover:underline sm:inline">Review</span>
                                    <ChevronRight className="h-5 w-5 shrink-0 text-ink-3" aria-hidden="true" />
                                </Link>
                            </li>
                        ))}
                        {reviewPetitions > 0 && (
                            <li className="px-4 py-3 text-sm text-ink-3 sm:px-6">{reviewPetitions} more petition{reviewPetitions === 1 ? ' is' : 's are'} under review.</li>
                        )}
                    </ul>
                )}
            </Card>

            <div className="mb-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                <Stat label="Voters on the roll" value={voters.toLocaleString()} icon={IdCard} />
                <Stat label="Enrolled" value={enrolled.toLocaleString()} hint={`${pct(enrolled, voters)}% of the roll`} icon={Users} />
                <Stat label="Not yet enrolled" value={(voters - enrolled).toLocaleString()} icon={IdCard} />
                <Stat label="Open petitions" value={openPetitions} icon={FileWarning} />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader
                        title="Current and upcoming elections"
                        action={<Link href="/admin/elections" className="text-sm font-semibold text-brand underline hover:text-brand-hover">All elections</Link>}
                    />
                    {current.length === 0 ? (
                        <EmptyState icon={Vote} title="No elections scheduled" action={<ButtonLink href="/admin/elections" variant="secondary">Set up an election</ButtonLink>} />
                    ) : (
                        <ul className="divide-y divide-line">
                            {current.map((e) => (
                                <li key={String(e._id)} className="px-4 py-3 sm:px-6">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className="font-medium text-ink">{e.name}</p>
                                        <StatusBadge status={electionPhase(e)} />
                                    </div>
                                    <p className="mt-0.5 text-sm text-ink-3">{phaseLabel(e)} · ends {formatDateTime(e.endAt)}</p>
                                </li>
                            ))}
                        </ul>
                    )}
                </Card>

                <Card>
                    <CardHeader title="Enrollment by seat" description="Share of voters on the roll who have enrolled." />
                    {seatRows.length === 0 ? (
                        <EmptyState icon={IdCard} title="No voters yet" />
                    ) : (
                        <ul className="divide-y divide-line">
                            {seatRows.map((s) => (
                                <li key={s._id || 'none'} className="px-4 py-3 sm:px-6">
                                    <div className="flex items-baseline justify-between gap-3 text-sm">
                                        <span className="font-medium text-ink">{s._id || 'No seat'}</span>
                                        <span className="tabular-nums text-ink-2">
                                            <span className="font-semibold text-ink">{s.enrolled}</span> of {s.total} · {pct(s.enrolled, s.total)}%
                                        </span>
                                    </div>
                                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-subtle" aria-hidden="true">
                                        <div className="h-full rounded-full bg-brand" style={{ width: `${pct(s.enrolled, s.total)}%` }} />
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </Card>
            </div>
        </>
    );
}
