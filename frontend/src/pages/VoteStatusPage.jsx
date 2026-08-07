import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import electionService from '../services/electionService';
import voteService from '../services/voteService';
import VoterStatusBadge from '../components/VoterStatusBadge';
import useAuth from '../hooks/useAuth';
import { ShieldCheck, Vote, ArrowLeft, RefreshCw, CheckCircle2, Clock, Calendar } from 'lucide-react';

export default function VoteStatusPage() {
  const { user } = useAuth();

  const [electionsStatus, setElectionsStatus] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStatusList = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const elecRes = await electionService.getAllElections();
      let items = [];
      if (elecRes?.data) {
        if (Array.isArray(elecRes.data)) items = elecRes.data;
        else if (Array.isArray(elecRes.data.elections)) items = elecRes.data.elections;
        else if (Array.isArray(elecRes.data.data)) items = elecRes.data.data;
      } else if (Array.isArray(elecRes)) {
        items = elecRes;
      }

      // Check voter status for each election
      const statusPromises = items.map(async (elec) => {
        try {
          const statusRes = await voteService.getVotingStatus(elec.id);
          const statusData = statusRes?.data || statusRes;
          return {
            ...elec,
            hasVoted: Boolean(statusData?.hasVoted),
            receiptCode: statusData?.voteReceipt || statusData?.receiptCode,
          };
        } catch (err) {
          return {
            ...elec,
            hasVoted: false,
          };
        }
      });

      const combined = await Promise.all(statusPromises);
      setElectionsStatus(combined);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load voter status list.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatusList();
  }, [fetchStatusList]);

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

      {/* Header */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              Voter Status Dashboard
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              My Election Participation Status
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              Review your voting eligibility and participation history across all college elections.
            </p>
          </div>

          <button
            onClick={fetchStatusList}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition-colors shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Status</span>
          </button>
        </div>
      </div>

      {/* Status List Grid */}
      {isLoading ? (
        <div className="py-16 text-center space-y-3">
          <div className="w-8 h-8 border-3 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Loading participation status...</p>
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-center text-xs text-rose-300">
          {error}
        </div>
      ) : electionsStatus.length === 0 ? (
        <div className="py-12 text-center bg-slate-900/60 border border-slate-800 rounded-3xl">
          <p className="text-xs text-slate-400">No elections found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {electionsStatus.map((elec) => {
            const isActive = elec.status === 'ACTIVE';

            return (
              <div key={elec.id} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-md shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-base font-bold text-white">{elec.title}</h3>
                    <VoterStatusBadge hasVoted={elec.hasVoted} />
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-1">
                    Status: <strong className="text-indigo-300">{elec.status}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                  {elec.hasVoted ? (
                    <Link
                      to="/audit"
                      className="px-4 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 text-xs font-semibold transition-colors flex items-center gap-1.5"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Verified Receipt</span>
                    </Link>
                  ) : isActive ? (
                    <Link
                      to={`/vote/${elec.id}`}
                      className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition-all flex items-center gap-1.5"
                    >
                      <Vote className="w-3.5 h-3.5" />
                      <span>Cast Vote</span>
                    </Link>
                  ) : (
                    <span className="text-xs text-slate-500 italic">Voting Not Active</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
