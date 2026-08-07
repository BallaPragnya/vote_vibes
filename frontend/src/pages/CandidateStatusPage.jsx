import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import candidateService from '../services/candidateService';
import CandidateStatusBadge from '../components/CandidateStatusBadge';
import useAuth from '../hooks/useAuth';
import { Clock, CheckCircle2, XCircle, AlertCircle, ArrowLeft, RefreshCw, Award, FileText } from 'lucide-react';

export default function CandidateStatusPage() {
  const { user } = useAuth();

  const [myNominations, setMyNominations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  const fetchMyNominations = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await candidateService.getAllCandidates();
      let items = [];
      if (res?.data) {
        if (Array.isArray(res.data)) items = res.data;
        else if (Array.isArray(res.data.candidates)) items = res.data.candidates;
        else if (Array.isArray(res.data.data)) items = res.data.data;
      } else if (Array.isArray(res)) {
        items = res;
      }

      // Filter nominations owned by the logged-in user
      const userNominations = items.filter(
        (c) => (c.userId || c.user?.id) === user?.id
      );

      setMyNominations(userNominations);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to retrieve nomination status.');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchMyNominations();
  }, [fetchMyNominations]);

  const handleWithdraw = async (id) => {
    if (!window.confirm('Are you sure you want to withdraw your nomination application?')) return;
    try {
      await candidateService.withdrawCandidate(id);
      setActionSuccess('Nomination withdrawn successfully.');
      fetchMyNominations();
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to withdraw nomination.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      <div>
        <Link
          to="/candidates"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Candidates Directory
        </Link>
      </div>

      {/* Header */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold mb-3">
              <Clock className="w-3.5 h-3.5" />
              Nomination Tracker
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              My Candidate Nomination Status
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              Track the review and approval progress of your submitted candidacy applications.
            </p>
          </div>

          <button
            onClick={fetchMyNominations}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition-colors shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Status</span>
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Content Grid */}
      {isLoading ? (
        <div className="py-16 text-center space-y-3">
          <div className="w-8 h-8 border-3 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Loading your candidate status...</p>
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-center text-xs text-rose-300">
          {error}
        </div>
      ) : myNominations.length === 0 ? (
        <div className="py-12 px-6 text-center bg-slate-900/60 border border-slate-800 rounded-3xl backdrop-blur-md max-w-md mx-auto">
          <Award className="w-10 h-10 text-amber-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">No Active Nominations</h3>
          <p className="text-xs text-slate-400 mb-6">You have not submitted any candidate nomination applications yet.</p>
          <Link
            to="/candidates/nominate"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/25 transition-all"
          >
            Apply for Nomination Now
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {myNominations.map((nomination) => {
            const status = nomination.nominationStatus || nomination.approvalStatus || nomination.status || 'PENDING';
            const electionTitle = nomination.election?.title || 'Campus Election';

            return (
              <div key={nomination.id} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-md shadow-lg space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-white">{electionTitle}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Applicant: <strong className="text-slate-200">{nomination.fullName || user?.name}</strong></p>
                  </div>
                  <CandidateStatusBadge status={status} />
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-850 text-xs text-slate-300 leading-relaxed italic">
                  "{nomination.manifesto}"
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs text-slate-400">
                  <span>Nomination ID: <span className="font-mono text-slate-400">{nomination.id}</span></span>
                  
                  {status === 'PENDING' && (
                    <button
                      onClick={() => handleWithdraw(nomination.id)}
                      className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-xs font-semibold transition-colors"
                    >
                      Withdraw Application
                    </button>
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
