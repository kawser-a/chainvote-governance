
'use client';

import CreateElectionForm from './_components/CreateElectionForm';
import FiltersTabs from './_components/FiltersTabs';
import ElectionsTable from './_components/ElectionsTable';
import { useElections } from './_lib/useElections';

export default function AdminElectionsPage() {
    const {
        list, loading,
        status, setStatus,
        page, setPage, totalPages,
        reload,
        actions
    } = useElections();

    return (
        <div>
            <h1 className="text-white text-xl font-semibold mb-4">Elections</h1>

            {/* Create */}
            <CreateElectionForm onCreated={reload} createElection={actions.createElection} />

            {/* Quick tabs */}
            <FiltersTabs
                status={status}
                onChange={(s) => { setPage(1); setStatus(s); }}
            />

            {/* Table */}
            <ElectionsTable
                list={list}
                loading={loading}
                page={page}
                totalPages={totalPages}
                onPrev={() => setPage(p => Math.max(1, p - 1))}
                onNext={() => setPage(p => Math.min(totalPages, p + 1))}
                actions={{
                    rebuildBallot: actions.rebuildBallot,
                    setStatusRow: actions.setStatusRow,
                    addCandidates: actions.addCandidatesToBallot,
                    pause: actions.pauseElection,
                    resume: actions.resumeElection,
                }}
            />
        </div>
    );
}
