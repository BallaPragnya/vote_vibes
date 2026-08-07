import React from 'react';

const STATUS_OPTIONS = [
  { label: 'All Elections', value: 'ALL' },
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Upcoming', value: 'UPCOMING' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Cancelled', value: 'CANCELLED' },
];

export default function StatusFilter({ selectedStatus, onSelectStatus }) {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
      {STATUS_OPTIONS.map((item) => {
        const isActive = selectedStatus === item.value;
        return (
          <button
            key={item.value}
            onClick={() => onSelectStatus(item.value)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              isActive
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 border border-indigo-500/30'
                : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-850 border border-slate-800'
            }`}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
