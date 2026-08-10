import React from 'react';

export default function CandidateStatusBadge({ status }) {
  const getBadgeStyle = (statusStr) => {
    switch (statusStr?.toUpperCase()) {
      case 'APPROVED':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'PENDING':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'REJECTED':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'WITHDRAWN':
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const statusName = status?.toUpperCase() || 'PENDING';

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getBadgeStyle(statusName)}`}>
      {statusName === 'APPROVED' && (
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
      )}
      {statusName}
    </span>
  );
}
