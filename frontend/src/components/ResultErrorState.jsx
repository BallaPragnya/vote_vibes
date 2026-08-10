import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Lock, ArrowLeft, RefreshCw } from 'lucide-react';

export default function ResultErrorState({ error, onRetry }) {
  const isPendingResult = error?.toLowerCase().includes('hidden') || error?.toLowerCase().includes('completed') || error?.toLowerCase().includes('active');

  return (
    <div className="max-w-md mx-auto py-16 px-6 text-center">
      <div className={`p-4 rounded-3xl w-fit mx-auto mb-4 ${
        isPendingResult 
          ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400' 
          : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
      }`}>
        {isPendingResult ? <Lock className="w-10 h-10" /> : <AlertCircle className="w-10 h-10" />}
      </div>

      <h2 className="text-xl font-bold text-white mb-2">
        {isPendingResult ? 'Results Restricted / Pending' : 'Failed to Load Results'}
      </h2>

      <p className="text-xs text-slate-400 mb-6 leading-relaxed">
        {error || 'Election results are unavailable or restricted at this time.'}
      </p>

      <div className="flex items-center justify-center gap-3">
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-200 hover:text-white transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
        )}

        <Link
          to="/elections"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-lg shadow-indigo-500/20 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Elections</span>
        </Link>
      </div>
    </div>
  );
}
