import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ManageVoters() {
    const [voters, setVoters] = useState([]);
    const router = useRouter();

    useEffect(() => {
        async function fetchVoters() {
            const res = await fetch('/api/voters'); // Add appropriate API route
            const data = await res.json();
            setVoters(data.voters);
        }
        fetchVoters();
    }, []);

    async function handleDisable(voterId) {
        const res = await fetch(`/api/voters/${voterId}/disable`, { method: 'POST' });
        if (res.ok) {
            setVoters(voters.filter(voter => voter._id !== voterId)); // Remove from UI after disabling
        }
    }

    return (
        <div>
            <h2 className="text-xl font-semibold mb-4">Manage Voters</h2>
            <table className="min-w-full table-auto">
                <thead>
                    <tr>
                        <th className="px-4 py-2">Name</th>
                        <th className="px-4 py-2">NID</th>
                        <th className="px-4 py-2">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {voters.map(voter => (
                        <tr key={voter._id}>
                            <td className="px-4 py-2">{voter.name}</td>
                            <td className="px-4 py-2">{voter.nid}</td>
                            <td className="px-4 py-2">
                                <button
                                    onClick={() => handleDisable(voter._id)}
                                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                                    Disable
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
