import React from 'react';
import CandidateCard from './CandidateCard';
import { Award, AlertCircle, RefreshCw } from 'lucide-react';

export default function CandidateList({ candidates, isLoading, error, onRetry, onApprove, onReject, onWithdraw }) {
  if (isLoading) {
    return (
      <div className="py-16 text-center space-y-3">
        <div className="w-10 h-10 border-3 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-400 font-medium">Loading candidate nominations...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 px-6 rounded-3xl bg-rose-500/10 border border-rose-500/20 text-center max-w-md mx-auto">
        <AlertCircle className="w-10 h-10 text-rose-400 mx-auto mb-3" />
        <h3 className="text-base font-bold text-white mb-1">Failed to Load Candidates</h3>
        <p className="text-xs text-rose-300 mb-4">{error}</p>
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-200 hover:text-white transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Try Again</span>
        </button>
      </div>
    );
  }

  if (!candidates || candidates.length === 0) {
    return (
      <div className="py-16 px-6 text-center max-w-md mx-auto bg-slate-900/60 border border-slate-800 rounded-3xl backdrop-blur-md">
        <div className="p-4 bg-amber-500/10 rounded-2xl w-fit mx-auto mb-4 text-amber-400">
          <Award className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-white mb-1">No Candidates Found</h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          There are no candidate nominations matching your search or filter criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {candidates.map((candidate) => (
        <CandidateCard
          key={candidate.id}
          candidate={candidate}
          onApprove={onApprove}
          onReject={onReject}
          onWithdraw={onWithdraw}
        />
      ))}
    </div>
  );
}
