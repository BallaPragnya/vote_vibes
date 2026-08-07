import React from 'react';
import { CheckCircle2, Clock } from 'lucide-react';

export default function VoterStatusBadge({ hasVoted, status }) {
  const isVoted = hasVoted || status?.toUpperCase() === 'VOTED' || status?.toUpperCase() === 'COMPLETED';

  if (isVoted) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 tracking-wide uppercase">
        <CheckCircle2 className="w-3.5 h-3.5" />
        Voted
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 tracking-wide uppercase">
      <Clock className="w-3.5 h-3.5" />
      Pending Vote
    </span>
  );
}
