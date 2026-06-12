import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminDashboard() {
    const [user, setUser] = useState(null);
    const router = useRouter();

    useEffect(() => {
        async function fetchUserData() {
            const res = await fetch('/api/me');
            const data = await res.json();
            if (data.ok) {
                setUser(data);
            } else {
                router.push('/login');
            }
        }
        fetchUserData();
    }, [router]);

    return (
        <div className="flex min-h-screen bg-gray-100">
            <div className="w-64 bg-white shadow-md">
                <div className="p-6">
                    <h2 className="text-2xl font-semibold">Admin Dashboard</h2>
                    {user && (
                        <div className="mt-4">
                            <p><b>NID:</b> {user.sub}</p>
                            <p><b>Credential Commitment:</b> {user.cc}</p>
                        </div>
                    )}
                </div>
                <nav className="mt-8">
                    <ul>
                        <li><Link href="/admin/voters" className="block p-4 hover:bg-gray-200">Manage Voters</Link></li>
                        <li><Link href="/admin/candidates" className="block p-4 hover:bg-gray-200">Manage Candidates</Link></li>
                        <li><Link href="/admin/manifestos" className="block p-4 hover:bg-gray-200">Manage Manifestos</Link></li>
                        <li><Link href="/admin/results" className="block p-4 hover:bg-gray-200">View Results</Link></li>
                    </ul>
                </nav>
            </div>
            <div className="flex-1 p-6">
                {/* Render content for different sections (voters, candidates, etc.) */}
            </div>
        </div>
    );
}
