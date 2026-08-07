import React from 'react';

const CANDIDATE_STATUS_OPTIONS = [
  { label: 'All Nominees', value: 'ALL' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Pending Review', value: 'PENDING' },
  { label: 'Rejected', value: 'REJECTED' },
  { label: 'Withdrawn', value: 'WITHDRAWN' },
];

export default function CandidateStatusFilter({ selectedStatus, onSelectStatus }) {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
      {CANDIDATE_STATUS_OPTIONS.map((item) => {
        const isActive = selectedStatus === item.value;
        return (
          <button
            key={item.value}
            onClick={() => onSelectStatus(item.value)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              isActive
                ? 'bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/25 border border-amber-400'
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
