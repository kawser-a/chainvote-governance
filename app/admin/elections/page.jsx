'use client';
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button, Card, PageHeader } from '../../components/ui/primitives';
import { Segmented, useToast } from '../../components/ui/interactive';
import CreateElectionForm from './_components/CreateElectionForm';
import ElectionsList from './_components/ElectionsList';
import { useElections } from './_lib/useElections';

const FILTERS = [
    { value: 'all', label: 'All' },
    { value: 'active', label: 'Voting open' },
    { value: 'scheduled', label: 'Upcoming' },
    { value: 'paused', label: 'Paused' },
    { value: 'completed', label: 'Ended' },
    { value: 'draft', label: 'Draft' },
    { value: 'archived', label: 'Archived' },
];

export default function AdminElectionsPage() {
    const { notify } = useToast();
    const [creating, setCreating] = useState(false);
    const { list, loading, status, setStatus, page, setPage, totalPages, actions } = useElections();

    return (
        <>
            <PageHeader
                title="Elections"
                description="Set up elections, open and close voting, and keep an eye on live counts."
                actions={!creating && (
                    <Button onClick={() => setCreating(true)}>
                        <Plus className="h-4 w-4" aria-hidden="true" /> New election
                    </Button>
                )}
            />

            {creating && (
                <CreateElectionForm
                    createElection={actions.createElection}
                    onCancel={() => setCreating(false)}
                    onDone={(name) => { setCreating(false); notify(`“${name}” created. It opens at the start time you set.`); }}
                />
            )}

            <Segmented label="Filter by status" value={status} onChange={(s) => { setPage(1); setStatus(s); }} options={FILTERS} className="mb-4" />

            <Card>
                <ElectionsList
                    list={list}
                    loading={loading}
                    page={page}
                    totalPages={totalPages}
                    onPage={setPage}
                    actions={{
                        rebuildBallot: actions.rebuildBallot,
                        setStatusRow: actions.setStatusRow,
                        addCandidates: actions.addCandidatesToBallot,
                        pause: actions.pauseElection,
                        resume: actions.resumeElection,
                    }}
                />
            </Card>
        </>
    );
}
