import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function VoterDashboard() {
    const [elections, setElections] = useState([]);
    const [user, setUser] = useState(null);
    const router = useRouter();

    useEffect(() => {
        async function fetchUserData() {
            const res = await fetch('/api/me');
            const data = await res.json();
            if (data.ok) {
                setUser(data);
                fetchElections(data.sub);
            } else {
                router.push('/login');
            }
        }
        fetchUserData();
    }, [router]);

    async function fetchElections(nid) {
        const res = await fetch(`/api/elections?nid=${nid}`);
        const data = await res.json();
        setElections(data.elections);
    }

    return (
        <div>
            <h2 className="text-xl font-semibold mb-4">Ongoing Elections</h2>
            {elections.length > 0 ? (
                <ul>
                    {elections.map(election => (
                        <li key={election._id} className="mb-4">
                            <h3>{election.type} Election</h3>
                            <p>{election.startDate} - {election.endDate}</p>
                            <button
                                onClick={() => router.push(`/voter/election/${election._id}`)}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                                View Candidates and Vote
                            </button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No ongoing elections available.</p>
            )}
        </div>
    );
}
