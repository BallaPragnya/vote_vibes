import React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

export default function ApprovalToggle({ candidateId, status, onApprove, onReject, isUpdating }) {
  const isApproved = status === 'APPROVED';
  const isRejected = status === 'REJECTED';

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        disabled={isUpdating || isApproved}
        onClick={() => onApprove(candidateId)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
          isApproved
            ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
            : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
        } disabled:opacity-60`}
      >
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span>{isApproved ? 'Approved' : 'Approve'}</span>
      </button>

      <button
        type="button"
        disabled={isUpdating || isRejected}
        onClick={() => onReject(candidateId)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
          isRejected
            ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
            : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20'
        } disabled:opacity-60`}
      >
        <XCircle className="w-3.5 h-3.5" />
        <span>{isRejected ? 'Rejected' : 'Reject'}</span>
      </button>
    </div>
  );
}
