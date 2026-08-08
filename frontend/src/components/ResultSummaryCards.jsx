import React from 'react';
import { Users, Vote, Percent, Trophy, Layers } from 'lucide-react';

export default function ResultSummaryCards({ turnoutInfo, positionsCount, winnerCount }) {
  const { totalVotesCast, eligibleVoters, turnoutPercentage } = turnoutInfo || {
    totalVotesCast: 0,
    eligibleVoters: 0,
    turnoutPercentage: 0,
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Votes Cast */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md shadow-lg space-y-1">
        <div className="flex items-center justify-between text-slate-400 text-xs">
          <span>Total Ballots Cast</span>
          <Vote className="w-4 h-4 text-indigo-400" />
        </div>
        <p className="text-2xl sm:text-3xl font-extrabold text-white">{totalVotesCast}</p>
        <span className="text-[10px] text-slate-500 block">Recorded on Immutable Ledger</span>
      </div>

      {/* Eligible Voters */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md shadow-lg space-y-1">
        <div className="flex items-center justify-between text-slate-400 text-xs">
          <span>Eligible Voters</span>
          <Users className="w-4 h-4 text-purple-400" />
        </div>
        <p className="text-2xl sm:text-3xl font-extrabold text-white">{eligibleVoters}</p>
        <span className="text-[10px] text-slate-500 block">Electoral Roll Target</span>
      </div>

      {/* Voter Turnout % */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md shadow-lg space-y-1">
        <div className="flex items-center justify-between text-slate-400 text-xs">
          <span>Voter Turnout</span>
          <Percent className="w-4 h-4 text-emerald-400" />
        </div>
        <p className="text-2xl sm:text-3xl font-extrabold text-emerald-400">{turnoutPercentage}%</p>
        <span className="text-[10px] text-emerald-500/80 block">Participation Rate</span>
      </div>

      {/* Winners & Positions */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md shadow-lg space-y-1">
        <div className="flex items-center justify-between text-slate-400 text-xs">
          <span>Declared Winners</span>
          <Trophy className="w-4 h-4 text-amber-400" />
        </div>
        <p className="text-2xl sm:text-3xl font-extrabold text-amber-300">{winnerCount || 1}</p>
        <span className="text-[10px] text-slate-500 block">Across {positionsCount || 1} Positions</span>
      </div>
    </div>
  );
}
