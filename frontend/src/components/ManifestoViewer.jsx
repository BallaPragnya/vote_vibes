import React from 'react';
import { FileText, X, Download, ExternalLink, Award, User, CheckCircle2 } from 'lucide-react';

export default function ManifestoViewer({ isOpen, onClose, candidate }) {
  if (!isOpen || !candidate) return null;

  const manifestoText = candidate?.manifesto;
  const docUrl = candidate?.manifestoDocument || candidate?.manifestoUrl;
  const name = candidate?.fullName || candidate?.user?.name || 'Candidate';
  const electionTitle = candidate?.election?.title || 'Campus Election';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6 pr-8">
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-400">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">{name}'s Campaign Manifesto</h2>
            <p className="text-xs text-slate-400 mt-0.5">Election: <span className="text-slate-200">{electionTitle}</span></p>
          </div>
        </div>

        {/* Manifesto Text Content */}
        <div className="space-y-4">
          {manifestoText ? (
            <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-850 leading-relaxed text-slate-200 text-sm whitespace-pre-line font-normal">
              {manifestoText}
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-slate-950/40 border border-slate-850 text-center text-xs text-slate-500 italic">
              No text manifesto provided by the candidate.
            </div>
          )}

          {/* Attached Document / PDF */}
          {docUrl && (
            <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/20 rounded-xl text-indigo-400">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-indigo-300">Attached Manifesto Document (PDF)</p>
                  <p className="text-[10px] text-slate-400">Official Candidate Manifesto Document</p>
                </div>
              </div>

              <a
                href={docUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Open PDF</span>
              </a>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
          >
            Close Viewer
          </button>
        </div>

      </div>
    </div>
  );
}
