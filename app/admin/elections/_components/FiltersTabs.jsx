'use client';

export default function FiltersTabs({ status, onChange }) {
  const tabs = ['all', 'draft', 'scheduled', 'active', 'paused', 'completed', 'archived'];
  return (
    <div className="flex items-center gap-2 mt-4 mb-2">
      {tabs.map(s => (
        <button
          key={s}
          onClick={() => onChange(s)}
          className={`px-3 py-1.5 rounded-lg text-sm border ${
            status === s
              ? 'bg-[#2A2A2A] text-white border-[#3a3a3a]'
              : 'bg-[#1F1F1F] text-[#EDEDED] border-[#2A2A2A]'
          }`}
        >
          {s[0].toUpperCase() + s.slice(1)}
        </button>
      ))}
    </div>
  );
}
