import React from 'react';
import CandidateVoteCard from './CandidateVoteCard';
import { User, AlertCircle } from 'lucide-react';

export default function CandidateSelectionGrid({
  candidates,
  selectedCandidateId,
  onSelectCandidate,
  disabled,
}) {
  if (!candidates || candidates.length === 0) {
    return (
      <div className="py-16 text-center bg-slate-900/60 border border-slate-800 rounded-3xl backdrop-blur-md max-w-md mx-auto">
        <User className="w-10 h-10 text-slate-500 mx-auto mb-3" />
        <h3 className="text-base font-bold text-white mb-1">No Candidates Available</h3>
        <p className="text-xs text-slate-400">There are no approved candidates registered on this ballot yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {candidates.map((candidate) => (
        <CandidateVoteCard
          key={candidate.id}
          candidate={candidate}
          isSelected={selectedCandidateId === candidate.id}
          onSelect={onSelectCandidate}
          disabled={disabled}
        />
      ))}
    </div>
  );
}
