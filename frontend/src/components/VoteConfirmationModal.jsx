import React from 'react';
import { Vote, AlertTriangle, CheckCircle2, X } from 'lucide-react';

export default function VoteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  selectedCandidate,
  electionTitle,
  isSubmitting,
}) {
  if (!isOpen) return null;

  const candidateName = selectedCandidate?.fullName || selectedCandidate?.user?.name || 'Nominated Candidate';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative space-y-5">
        
        {/* Close */}
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Confirm Your Vote</h3>
            <p className="text-xs text-slate-400">Final Verification Step</p>
          </div>
        </div>

        {/* Warning Alert */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs leading-relaxed font-medium">
          You are about to cast your vote. Votes cannot be changed after submission.
        </div>

        {/* Selection Details */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-850 space-y-2">
          <span className="text-[10px] text-slate-500 uppercase font-semibold block">Selected Candidate</span>
          <p className="text-base font-extrabold text-indigo-300">{candidateName}</p>
          <p className="text-xs text-slate-400">Election: {electionTitle || 'Campus Election'}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 transition-all transform active:scale-95 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Signing Vote...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm Vote</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
