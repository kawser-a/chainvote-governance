import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CandidateDashboard() {
    const [user, setUser] = useState(null);
    const [manifesto, setManifesto] = useState(null);
    const router = useRouter();

    useEffect(() => {
        async function fetchUserData() {
            const res = await fetch('/api/me');
            const data = await res.json();
            if (data.ok) {
                setUser(data);
                fetchManifesto(data.sub); // Fetch candidate manifesto
            } else {
                router.push('/login');
            }
        }
        fetchUserData();
    }, [router]);

    async function fetchManifesto(nid) {
        const res = await fetch(`/api/manifestos?candidateNid=${nid}`);
        const data = await res.json();
        setManifesto(data.manifesto);
    }

    return (
        <div>
            <h2 className="text-xl font-semibold mb-4">Candidate Dashboard</h2>
            {manifesto ? (
                <div>
                    <h3 className="text-lg font-semibold">Your Manifesto</h3>
                    <p>{manifesto.details}</p>
                    <button
                        onClick={() => router.push(`/candidate/manifesto/edit`)}
                        className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700">
                        Edit Manifesto
                    </button>
                </div>
            ) : (
                <div>
                    <p>No manifesto uploaded yet.</p>
                    <button
                        onClick={() => router.push(`/candidate/manifesto/upload`)}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                        Upload Manifesto
                    </button>
                </div>
            )}
        </div>
    );
}
