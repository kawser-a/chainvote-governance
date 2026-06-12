import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ManageCandidates() {
    const [candidates, setCandidates] = useState([]);
    const router = useRouter();

    useEffect(() => {
        async function fetchCandidates() {
            const res = await fetch('/api/candidates');
            const data = await res.json();
            setCandidates(data.candidates);
        }
        fetchCandidates();
    }, []);

    async function handleApproval(candidateId, status) {
        const res = await fetch(`/api/candidates/approve`, {
            method: 'POST',
            body: JSON.stringify({ candidateId, status }),
            headers: { 'Content-Type': 'application/json' },
        });
        if (res.ok) {
            setCandidates(candidates.map(candidate =>
                candidate._id === candidateId ? { ...candidate, status } : candidate
            ));
        }
    }

    return (
        <div>
            <h2 className="text-xl font-semibold mb-4">Manage Candidates</h2>
            <table className="min-w-full table-auto">
                <thead>
                    <tr>
                        <th className="px-4 py-2">Name</th>
                        <th className="px-4 py-2">Manifesto Status</th>
                        <th className="px-4 py-2">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {candidates.map(candidate => (
                        <tr key={candidate._id}>
                            <td className="px-4 py-2">{candidate.voter.name}</td>
                            <td className="px-4 py-2">{candidate.manifesto ? 'Uploaded' : 'Pending'}</td>
                            <td className="px-4 py-2">
                                <button
                                    onClick={() => handleApproval(candidate._id, candidate.status === 'approved' ? 'rejected' : 'approved')}
                                    className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700">
                                    {candidate.status === 'approved' ? 'Reject' : 'Approve'}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
