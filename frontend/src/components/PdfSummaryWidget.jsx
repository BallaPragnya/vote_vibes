import React, { useState } from 'react';
import { FileText, Download, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';
import resultService from '../services/resultService';

export default function PdfSummaryWidget({ electionTitle, resultsData, winners, turnoutInfo }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleDownloadPdf = async () => {
    setIsGenerating(true);
    setError('');
    setDownloadSuccess(false);

    try {
      resultService.downloadElectionSummary(electionTitle, resultsData, winners, turnoutInfo);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err) {
      setError('Failed to generate PDF summary document. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const primaryWinner = winners && winners.length > 0 ? winners[0].winnerName : 'Declared Nominee';

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl shadow-2xl space-y-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-500" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-indigo-400">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">Election Summary Report</h3>
            <p className="text-xs text-slate-400">Official certified PDF export for archival</p>
          </div>
        </div>

        <span className="text-[10px] uppercase font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          PDF Ready
        </span>
      </div>

      {/* Summary Content Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-950/80 border border-slate-850 text-xs">
        <div>
          <span className="text-[10px] text-slate-500 uppercase font-semibold block">Target Election</span>
          <p className="font-bold text-slate-200 mt-0.5">{electionTitle || 'Campus Election'}</p>
        </div>

        <div>
          <span className="text-[10px] text-slate-500 uppercase font-semibold block">Declared Winner</span>
          <p className="font-bold text-amber-300 mt-0.5">{primaryWinner}</p>
        </div>

        <div>
          <span className="text-[10px] text-slate-500 uppercase font-semibold block">Total Ballots Cast</span>
          <p className="font-bold text-slate-200 mt-0.5">{turnoutInfo?.totalVotesCast || 0} Votes</p>
        </div>

        <div>
          <span className="text-[10px] text-slate-500 uppercase font-semibold block">Turnout Percentage</span>
          <p className="font-bold text-emerald-400 mt-0.5">{turnoutInfo?.turnoutPercentage || 0}%</p>
        </div>
      </div>

      {/* Action CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div className="text-xs text-slate-400 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Includes cryptographic SHA-256 ledger proof</span>
        </div>

        <button
          onClick={handleDownloadPdf}
          disabled={isGenerating}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-600 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-bold text-xs shadow-xl shadow-indigo-500/25 transition-all transform active:scale-95 disabled:opacity-50 shrink-0"
        >
          {isGenerating ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Generating PDF...</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Download PDF Summary</span>
            </>
          )}
        </button>
      </div>

      {/* Success Notification */}
      {downloadSuccess && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>PDF summary downloaded successfully! Saved as VoteVibes_{electionTitle}_Summary.pdf</span>
        </div>
      )}

      {error && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
