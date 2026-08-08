import React from 'react';
import { Trophy, Award, User, Sparkles, CheckCircle2 } from 'lucide-react';

export default function WinnerAnnouncement({ electionTitle, winners = [] }) {
  if (!winners || winners.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-amber-950/60 via-slate-900 to-amber-950/60 border border-amber-500/30 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden text-center space-y-6">
      {/* Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Banner Header */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-widest">
        <Trophy className="w-4 h-4 text-amber-400" />
        Official Winner Announcement
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
        {winners.map((winner, idx) => {
          const photo = winner.winnerPhoto;
          const name = winner.winnerName;
          const posTitle = winner.positionTitle;
          const count = winner.voteCount;
          const pct = winner.percentage;

          return (
            <div
              key={winner.winnerId || idx}
              className="bg-slate-950/80 border border-amber-500/30 rounded-2xl p-6 relative flex flex-col items-center space-y-4 hover:border-amber-500/50 transition-all shadow-xl group"
            >
              {/* Position Pill */}
              <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
                {posTitle}
              </span>

              {/* Photo */}
              <div className="relative">
                {photo ? (
                  <img
                    src={photo}
                    alt={name}
                    className="w-24 h-24 rounded-full object-cover border-4 border-amber-500/40 shadow-xl group-hover:scale-105 transition-transform"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200';
                    }}
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-500/20 to-yellow-600/20 border-4 border-amber-500/40 flex items-center justify-center text-amber-300 font-bold shadow-xl">
                    <User className="w-12 h-12" />
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 p-1.5 bg-amber-500 rounded-full text-slate-950 shadow-md">
                  <Trophy className="w-4 h-4" />
                </div>
              </div>

              {/* Name & Votes */}
              <div className="space-y-1">
                <h3 className="text-xl font-extrabold text-white tracking-tight">{name}</h3>
                <p className="text-xs text-amber-300 font-bold">{count} Votes ({pct}% of Votes)</p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 w-full text-center">
                <span className="text-[11px] text-slate-400">{electionTitle}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
