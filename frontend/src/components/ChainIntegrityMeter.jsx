import React from 'react';

/**
 * Dynamic Chain Integrity Meter Component
 * Renders real-time blockchain integrity status, score meter, and ledger metrics summary.
 */
export default function ChainIntegrityMeter({ integrity, metrics, onRefresh }) {
  const isChainValid = integrity?.isChainValid ?? true;
  const score = integrity?.integrityScore ?? 100;
  const statusMessage = integrity?.message || 'All block hashes and link sequences verified successfully.';

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl mb-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-white">Dynamic Chain Integrity Meter</h2>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                isChainValid
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse'
              }`}
            >
              <span className={`w-2 h-2 rounded-full mr-2 ${isChainValid ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
              {isChainValid ? 'CHAIN INTACT' : 'TAMPERING DETECTED'}
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">{statusMessage}</p>
        </div>

        {onRefresh && (
          <button
            onClick={onRefresh}
            className="px-4 py-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors border border-slate-700 flex items-center gap-2"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Re-verify Chain Integrity
          </button>
        )}
      </div>

      {/* Health Score Meter Bar */}
      <div className="mt-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Cryptographic Integrity Score</span>
          <span className={`text-lg font-extrabold ${isChainValid ? 'text-emerald-400' : 'text-rose-400'}`}>{score}%</span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden p-0.5 border border-slate-700/50">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              isChainValid ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-gradient-to-r from-rose-600 to-red-400'
            }`}
            style={{ width: `${score}%` }}
          ></div>
        </div>
      </div>

      {/* Ledger Metrics Dashboard */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800/60">
          <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800">
            <span className="text-xs font-medium text-slate-400 block">Total Ledger Blocks</span>
            <span className="text-xl font-bold text-slate-100 mt-1 block">{metrics.totalBlocks || 0}</span>
          </div>

          <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800">
            <span className="text-xs font-medium text-slate-400 block">Votes Recorded</span>
            <span className="text-xl font-bold text-indigo-400 mt-1 block">{metrics.totalVotesRecorded || 0}</span>
          </div>

          <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800">
            <span className="text-xs font-medium text-slate-400 block">Elections Registered</span>
            <span className="text-xl font-bold text-sky-400 mt-1 block">{metrics.totalElectionsRecorded || 0}</span>
          </div>

          <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800">
            <span className="text-xs font-medium text-slate-400 block">Candidates Verified</span>
            <span className="text-xl font-bold text-amber-400 mt-1 block">{metrics.totalCandidatesRecorded || 0}</span>
          </div>
        </div>
      )}
    </div>
  );
}
