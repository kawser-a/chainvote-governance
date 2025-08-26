import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';

async function getBaseUrl() {
    const h = await headers();
    const host = h.get('host');
    const proto = h.get('x-forwarded-proto') ?? 'http';
    return `${proto}://${host}`;
}

async function getMe() {
    const base = await getBaseUrl();
    const cookieStore = await cookies();
    const res = await fetch(`${base}/api/me`, {
        cache: 'no-store',
        headers: { Cookie: cookieStore.toString() },
    });

    if (!res.ok) return null;
    return res.json();
}

async function logout() {
    'use server';
    const base = getBaseUrl();
    await fetch(`${base}/api/logout`, { method: 'POST' });
    redirect('/');
}

export default async function Dashboard() {
    const me = await getMe();

    return (
        <div className="space-y-4 mt-8">
            <div className="p-4 bg-white rounded-xl shadow">
                <h2 className="text-xl font-semibold mb-2">Dashboard</h2>
                {!me?.ok ? (
                    <div>Session invalid</div>
                ) : (
                    <div className="space-y-1">
                        <div><b>NID:</b> {me.sub}</div>
                        <div><b>Credential Commitment:</b> {me.cc}</div>
                        <form action={logout} className="mt-4">
                            <button
                                type="submit"
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                            >
                                Logout
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}
