'use client';
import { useEffect, useState } from 'react';

export default function AdminCandidates() {
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [seat, setSeat] = useState('');
    const [search, setSearch] = useState('');

    const [form, setForm] = useState({
        name: '', gender: 'Male', age: '', seat: '', nid: '', phone: '', email: '',
        partyName: '', independent: false,
    });
    const [message, setMessage] = useState('');

    async function load() {
        setLoading(true);
        const p = new URLSearchParams();
        if (seat) p.set('seat', seat);
        if (search) p.set('search', search);
        const r = await fetch(`/api/admin/candidates?${p.toString()}`);
        const j = await r.json();
        if (j.ok) setList(j.data);
        setLoading(false);
    }
    useEffect(() => { load(); }, [seat, search]);

    async function addCandidate(e) {
        e.preventDefault();
        setMessage('');
        const r = await fetch('/api/admin/candidates', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...form,
                age: form.age ? Number(form.age) : undefined,
            })
        });
        const j = await r.json();
        if (!j.ok) { setMessage(j.error || 'Failed'); return; }
        setMessage('Candidate created and credentials emailed (dev log).');
        setForm({ name: '', gender: 'Male', age: '', seat: '', nid: '', phone: '', email: '', partyName: '', independent: false });
        load();
    }

    return (
        <div className="space-y-6">
            <h1 className="text-white text-xl font-semibold">Candidates</h1>

            {/* Add Form */}
            <form onSubmit={addCandidate} className="rounded-2xl border border-[#232323] bg-[#171717] p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                <Input label="Name" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} required />
                <Select label="Gender" value={form.gender} onChange={v => setForm(f => ({ ...f, gender: v }))}
                    options={['Male', 'Female', 'Other']} />
                <Input label="Age" type="number" value={form.age} onChange={v => setForm(f => ({ ...f, age: v }))} />

                <Input label="Seat (e.g., Dhaka-1)" value={form.seat} onChange={v => setForm(f => ({ ...f, seat: v }))} required />
                <Input label="NID" value={form.nid} onChange={v => setForm(f => ({ ...f, nid: v }))} required />
                <Input label="Phone" value={form.phone} onChange={v => setForm(f => ({ ...f, phone: v }))} required />

                <Input label="Email" value={form.email} onChange={v => setForm(f => ({ ...f, email: v }))} required />
                <Input label="Party Name" value={form.partyName} onChange={v => setForm(f => ({ ...f, partyName: v }))} />
                <div className="flex items-center gap-2">
                    <input id="ind" type="checkbox" checked={form.independent} onChange={e => setForm(f => ({ ...f, independent: e.target.checked }))} />
                    <label htmlFor="ind" className="text-[#EDEDED] text-sm">Independent</label>
                </div>
                <div className="md:col-span-3 flex items-center gap-3">
                    <button className="px-4 py-2 rounded-lg bg-[#C9F300] text-black font-medium">Add Candidate</button>
                    {message && <span className="text-[#9EFF00] text-sm">{message}</span>}
                </div>
            </form>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Input label="Filter Seat" value={seat} onChange={setSeat} placeholder="e.g., Dhaka-1" />
                <Input label="Search" value={search} onChange={setSearch} placeholder="name, email, NID, party..." />
                <button onClick={load} className="px-4 py-2 rounded-lg bg-[#1F1F1F] border border-[#2A2A2A] text-white">Refresh</button>
            </div>

            {/* Table */}
            <div className="rounded-2xl border border-[#232323] bg-[#171717] overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead className="bg-[#1b1b1b] text-[#A1A1A1]">
                        <tr>
                            <Th text="Seat" />
                            <Th text="Name" />
                            <Th text="Party/Ind." />
                            <Th text="NID" />
                            <Th text="Phone" />
                            <Th text="Email" />
                            <Th text="Approved" />
                            <Th text="Active" />
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={8} className="p-6 text-center text-[#A1A1A1]">Loading...</td></tr>
                        ) : list.length === 0 ? (
                            <tr><td colSpan={8} className="p-6 text-center text-[#A1A1A1]">No candidates</td></tr>
                        ) : list.map(c => (
                            <tr key={c._id} className="border-t border-[#232323] hover:bg-[#1c1c1c]">
                                <Td>{c.seat}</Td>
                                <Td className="text-white">{c.name}</Td>
                                <Td>{c.independent ? 'Independent' : (c.partyName || '')}</Td>
                                <Td className="text-[#C9F300]">{c.nid}</Td>
                                <Td>{c.phone}</Td>
                                <Td>{c.email}</Td>
                                <Td>{c.approved ? 'Yes' : 'No'}</Td>
                                <Td>{c.active ? 'Yes' : 'No'}</Td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function Input({ label, value, onChange, required, type = 'text', placeholder = '' }) {
    return (
        <label className="flex flex-col gap-1">
            <span className="text-[#A1A1A1] text-sm">{label}{required && ' *'}</span>
            <input
                type={type}
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                required={required}
                className="bg-[#0F0F0F] border border-[#2A2A2A] rounded-xl px-3 py-2 text-[#EDEDED]"
            />
        </label>
    );
}
function Select({ label, value, onChange, options }) {
    return (
        <label className="flex flex-col gap-1">
            <span className="text-[#A1A1A1] text-sm">{label}</span>
            <select value={value} onChange={e => onChange(e.target.value)}
                className="bg-[#0F0F0F] border border-[#2A2A2A] rounded-xl px-3 py-2 text-[#EDEDED]">
                {options.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
        </label>
    );
}
function Th({ text }) { return <th className="text-left px-4 py-3 font-medium">{text}</th>; }
function Td({ children }) { return <td className="px-4 py-3 text-[#EDEDED]">{children}</td>; }
