import React, { useState, useEffect, useCallback } from 'react';
import candidateService from '../services/candidateService';
import CandidateStatusBadge from '../components/CandidateStatusBadge';
import ApprovalToggle from '../components/ApprovalToggle';
import CandidateStatusFilter from '../components/CandidateStatusFilter';
import SearchBar from '../components/SearchBar';
import { Settings, ShieldCheck, CheckCircle2, AlertCircle, Award, User, RefreshCw } from 'lucide-react';

export default function AdminCandidateApprovalPage() {
  const [candidates, setCandidates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [updatingId, setUpdatingId] = useState(null);
  const [actionSuccess, setActionSuccess] = useState('');

  const fetchCandidates = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const params = {};
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (selectedStatus !== 'ALL') params.status = selectedStatus;

      const res = await candidateService.getAllCandidates(params);
      let items = [];
      if (res?.data) {
        if (Array.isArray(res.data)) items = res.data;
        else if (Array.isArray(res.data.candidates)) items = res.data.candidates;
        else if (Array.isArray(res.data.data)) items = res.data.data;
      } else if (Array.isArray(res)) {
        items = res;
      }
      setCandidates(items);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load candidates for approval review.');
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedStatus]);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  const handleApprove = async (id) => {
    setUpdatingId(id);
    try {
      await candidateService.approveCandidate(id);
      setActionSuccess('Candidate nomination approved successfully!');
      fetchCandidates();
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve candidate.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleReject = async (id) => {
    setUpdatingId(id);
    try {
      await candidateService.rejectCandidate(id);
      setActionSuccess('Candidate nomination rejected.');
      fetchCandidates();
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject candidate.');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-8 py-4">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950/40 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              Election Commission Approval Panel
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Candidate Nomination Approvals
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-xl">
              Review student candidate submissions, verify manifestos, and approve or reject ballot eligibility.
            </p>
          </div>

          <button
            onClick={fetchCandidates}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition-colors shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Nominations</span>
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Toolbar Controls */}
      <div className="space-y-4">
        <SearchBar
          value={searchQuery}
          onChange={(val) => setSearchQuery(val)}
          onClear={() => setSearchQuery('')}
          placeholder="Search nominations by candidate name or manifesto..."
        />

        <CandidateStatusFilter
          selectedStatus={selectedStatus}
          onSelectStatus={(status) => setSelectedStatus(status)}
        />
      </div>

      {/* Approvals Table / Grid */}
      {isLoading ? (
        <div className="py-16 text-center space-y-3">
          <div className="w-8 h-8 border-3 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Loading candidate nominations for review...</p>
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-center text-xs text-rose-300">
          {error}
        </div>
      ) : candidates.length === 0 ? (
        <div className="py-16 px-6 text-center bg-slate-900/60 border border-slate-800 rounded-3xl backdrop-blur-md max-w-md mx-auto">
          <Award className="w-10 h-10 text-purple-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">No Nominations Found</h3>
          <p className="text-xs text-slate-400">There are no candidate nominations matching the selected filter.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {candidates.map((candidate) => {
            const status = candidate.nominationStatus || candidate.approvalStatus || candidate.status || 'PENDING';
            const name = candidate.fullName || candidate.user?.name || 'Nominee';
            const electionTitle = candidate.election?.title || 'Campus Election';

            return (
              <div
                key={candidate.id}
                className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-md shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-100 text-sm">{name}</h3>
                    <CandidateStatusBadge status={status} />
                  </div>
                  <p className="text-xs text-slate-400">
                    Election: <strong className="text-slate-300">{electionTitle}</strong>
                  </p>
                  <p className="text-xs text-slate-400 italic line-clamp-1 mt-1">
                    "{candidate.manifesto}"
                  </p>
                </div>

                <div className="shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800 flex items-center justify-between sm:justify-end gap-3">
                  <ApprovalToggle
                    candidateId={candidate.id}
                    status={status}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    isUpdating={updatingId === candidate.id}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
