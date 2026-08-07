import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import voteService from '../services/voteService';
import electionService from '../services/electionService';
import { Award, BarChart3, Users, ArrowLeft, RefreshCw, Trophy, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function ElectionResultsPage() {
  const { id: electionId } = useParams();

  const [election, setElection] = useState(null);
  const [resultsData, setResultsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchResults = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      // 1. Fetch Election details
      const elecRes = await electionService.getElectionById(electionId);
      setElection(elecRes?.data || elecRes);

      // 2. Fetch Results
      const res = await voteService.getResults(electionId);
      setResultsData(res?.data || res);
    } catch (err) {
      setError(err.response?.data?.message || 'Election results are not available or election is currently active.');
    } finally {
      setIsLoading(false);
    }
  }, [electionId]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  if (isLoading) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="w-10 h-10 border-3 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-400 font-medium">Tallying election vote counts...</p>
      </div>
    );
  }

  if (error || !resultsData) {
    return (
      <div className="max-w-md mx-auto py-16 text-center">
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-3xl text-amber-400 w-fit mx-auto mb-4">
          <BarChart3 className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Results Pending / Restricted</h2>
        <p className="text-xs text-slate-400 mb-6">{error || 'Election results will be published once the election is concluded.'}</p>
        <Link
          to="/elections"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-200 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Elections Hub</span>
        </Link>
      </div>
    );
  }

  const candidateResults = resultsData.candidates || resultsData.tally || [];
  const totalVotes = resultsData.totalVotes || resultsData.totalVotesCast || 0;
  const winner = resultsData.winner || (candidateResults.length > 0 ? candidateResults[0] : null);

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      <div>
        <Link
          to="/elections"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Elections Hub
        </Link>
      </div>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold mb-3">
              <Trophy className="w-3.5 h-3.5" />
              Certified Election Results
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {election?.title || 'Campus Election'} Results
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-xl">
              Official candidate vote counts and percentage distribution certified by blockchain ledger verification.
            </p>
          </div>

          <button
            onClick={fetchResults}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition-colors shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Results</span>
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
            <Users className="w-4 h-4 text-indigo-400" />
            <span>Total Ballots Cast</span>
          </div>
          <p className="text-3xl font-bold text-slate-100">{totalVotes}</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md sm:col-span-2 flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-400 shrink-0">
            <Trophy className="w-7 h-7" />
          </div>
          <div>
            <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">Leading / Winning Nominee</span>
            <p className="text-lg font-extrabold text-white">
              {winner?.fullName || winner?.candidateName || winner?.name || 'Candidate Nominee'}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              Votes: <strong className="text-amber-300">{winner?.votesCount || winner?.voteCount || winner?.votes || 0}</strong> ({winner?.percentage || '100'}%)
            </p>
          </div>
        </div>
      </div>

      {/* Candidate Breakdown List */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-xl space-y-6">
        <h2 className="text-base font-bold text-white uppercase tracking-wider">Candidate Tally Breakdown</h2>

        <div className="space-y-5">
          {candidateResults.map((cand, idx) => {
            const name = cand.fullName || cand.candidateName || cand.name || `Candidate #${idx + 1}`;
            const count = cand.votesCount || cand.voteCount || cand.votes || 0;
            const pct = cand.percentage !== undefined ? cand.percentage : totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
            const isWinner = winner && (winner.id === cand.id || idx === 0);

            return (
              <div key={cand.id || idx} className="space-y-2">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-200">{name}</span>
                    {isWinner && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 text-[10px] font-bold border border-amber-500/20">
                        <Trophy className="w-3 h-3" /> WINNER
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-slate-400">
                    <strong className="text-white">{count}</strong> votes ({pct}%)
                  </span>
                </div>

                <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-850 p-0.5">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isWinner
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-500 shadow-md shadow-amber-500/20'
                        : 'bg-gradient-to-r from-indigo-500 to-violet-600'
                    }`}
                    style={{ width: `${Math.max(pct, 2)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
