'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

export function useElections() {
    const [list, setList] = useState([]);
    const [status, setStatus] = useState('all'); // all|draft|scheduled|active|paused|completed|archived
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const limit = 20;

    const query = useMemo(
        () => new URLSearchParams({ page, limit, status }).toString(),
        [page, limit, status]
    );

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const r = await fetch(`/api/admin/elections?${query}`, {
                credentials: 'include', cache: 'no-store'
            });
            const j = await r.json();
            if (j.ok) {
                setList(j.data || []);
                setTotalPages(j.totalPages || 1);
            }
        } finally { setLoading(false); }
    }, [query]);

    useEffect(() => { load(); }, [load]);

    // actions
    async function createElection(body) {
        const r = await fetch('/api/admin/elections', {
            method: 'POST', credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        const j = await r.json();
        if (!j.ok) throw new Error(j.error || 'Create failed');
        await load();
        return j;
    }
    async function rebuildBallot(id) {
        const r = await fetch(`/api/admin/elections/${id}`, {
            method: 'PATCH', credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rebuildBallot: true }),
        });
        const j = await r.json();
        if (!j.ok) throw new Error(j.error || 'Rebuild failed');
        await load();
    }
    async function setStatusRow(id, newStatus) {
        const r = await fetch(`/api/admin/elections/${id}`, {
            method: 'PATCH', credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus }),
        });
        const j = await r.json();
        if (!j.ok) throw new Error(j.error || 'Update failed');
        await load();
    }
    async function addCandidatesToBallot(id, csv) {
        const ids = (csv || '').split(',').map(s => s.trim()).filter(Boolean);
        if (!ids.length) return;
        const r = await fetch(`/api/admin/elections/${id}`, {
            method: 'PATCH', credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ addCandidates: ids }),
        });
        const j = await r.json();
        if (!j.ok) throw new Error(j.error || 'Add failed');
        await load();
    }
    async function pauseElection(id, reason = '') {
        const r = await fetch(`/api/admin/elections/${id}`, {
            method: 'PATCH', credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'pause', pauseReason: reason }),
        });
        const j = await r.json();
        if (!j.ok) throw new Error(j.error || 'Pause failed');
        await load();
    }
    async function resumeElection(id) {
        const r = await fetch(`/api/admin/elections/${id}`, {
            method: 'PATCH', credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'resume' }),
        });
        const j = await r.json();
        if (!j.ok) throw new Error(j.error || 'Resume failed');
        await load();
    }

    return {
        list, loading,
        status, setStatus,
        page, setPage, totalPages,
        reload: load,
        actions: {
            createElection,
            rebuildBallot,
            setStatusRow,
            addCandidatesToBallot,
            pauseElection,
            resumeElection,
        }
    };
}
