'use client';

export function SectionTitle({ children }) {
    return <h2 className="text-white font-semibold text-lg">{children}</h2>;
}
export function SectionSubTitle({ children }) {
    return <div className="text-white font-medium">{children}</div>;
}
export function Label({ children }) {
    return <div className="text-[#A1A1A1] text-sm mb-1">{children}</div>;
}
export function Input({ label, value, onChange, type = 'text', ...rest }) {
    return (
        <label className="flex flex-col gap-1">
            {label && <span className="text-[#A1A1A1] text-sm">{label}</span>}
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="bg-[#0F0F0F] border border-[#2A2A2A] rounded-xl px-3 py-2 text-[#EDEDED]"
                {...rest}
            />
        </label>
    );
}
export function TextArea({ label, value, onChange, rows = 3 }) {
    return (
        <label className="flex flex-col gap-1">
            {label && <span className="text-[#A1A1A1] text-sm">{label}</span>}
            <textarea
                rows={rows}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="bg-[#0F0F0F] border border-[#2A2A2A] rounded-xl px-3 py-2 text-[#EDEDED]"
            />
        </label>
    );
}
export function Select({ label, value, onChange, options = [] }) {
    return (
        <label className="flex flex-col gap-1">
            {label && <span className="text-[#A1A1A1] text-sm">{label}</span>}
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="bg-[#0F0F0F] border border-[#2A2A2A] rounded-xl px-3 py-2 text-[#EDEDED]"
            >
                {options.map((o) => (<option key={o} value={o}>{o}</option>))}
            </select>
        </label>
    );
}
export function Toggle({ label, checked, onChange }) {
    return (
        <label className="flex items-center gap-2">
            <span className="text-[#EDEDED] text-sm">{label}</span>
            <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        </label>
    );
}
export function Th({ text }) {
    return <th className="text-left px-4 py-3 font-medium">{text}</th>;
}
export function Td({ children, className = '' }) {
    return <td className={`px-4 py-3 text-[#EDEDED] align-top ${className}`}>{children}</td>;
}
