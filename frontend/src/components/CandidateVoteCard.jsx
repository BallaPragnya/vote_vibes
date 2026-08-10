import React from 'react';
import { User, FileText, CheckCircle2 } from 'lucide-react';

export default function CandidateVoteCard({ candidate, isSelected, onSelect, disabled }) {
  const photo = candidate?.profileImage || candidate?.photoUrl;
  const name = candidate?.fullName || candidate?.user?.name || 'Nominated Candidate';
  const electionTitle = candidate?.election?.title || 'Campus Election';

  return (
    <div
      onClick={() => {
        if (!disabled) onSelect(candidate.id);
      }}
      className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
        isSelected
          ? 'bg-indigo-950/50 border-indigo-500 ring-2 ring-indigo-500 shadow-xl shadow-indigo-500/10'
          : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <div>
        {/* Top bar with Selection Radio Indicator */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
            {electionTitle}
          </span>

          <div
            className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
              isSelected ? 'border-indigo-400 bg-indigo-500' : 'border-slate-700 bg-slate-950'
            }`}
          >
            {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
          </div>
        </div>

        {/* Candidate Profile Info */}
        <div className="flex items-center gap-3 mb-3">
          {photo ? (
            <img
              src={photo}
              alt={name}
              className="w-12 h-12 rounded-full object-cover border-2 border-indigo-500/30 shrink-0"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200';
              }}
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-slate-800 border-2 border-indigo-500/30 flex items-center justify-center text-indigo-300 font-bold shrink-0">
              <User className="w-6 h-6" />
            </div>
          )}

          <div className="overflow-hidden">
            <h3 className="font-bold text-slate-100 text-sm truncate">{name}</h3>
            <p className="text-[11px] text-indigo-400 font-semibold">Nominee</p>
          </div>
        </div>

        {/* Manifesto Summary */}
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-850">
          <div className="flex items-center gap-1.5 text-[10px] uppercase font-semibold text-slate-400 mb-1">
            <FileText className="w-3 h-3 text-indigo-400" />
            <span>Manifesto Summary</span>
          </div>
          <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed italic">
            "{candidate?.manifesto || 'No manifesto summary provided.'}"
          </p>
        </div>
      </div>

      {/* Footer Select Indicator */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
        <span className={isSelected ? 'text-indigo-300 font-bold' : 'text-slate-400'}>
          {isSelected ? 'Selected' : 'Click to select'}
        </span>
        {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-400" />}
      </div>
    </div>
  );
}
