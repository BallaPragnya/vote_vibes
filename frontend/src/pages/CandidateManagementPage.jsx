import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import candidateService from '../services/candidateService';
import SearchBar from '../components/SearchBar';
import CandidateStatusFilter from '../components/CandidateStatusFilter';
import CandidateList from '../components/CandidateList';
import useAuth from '../hooks/useAuth';
import { 
  Award, 
  UserPlus, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  XCircle,
  FileText
} from 'lucide-react';

export default function CandidateManagementPage() {
  const { isAuthenticated, hasRole } = useAuth();
  const isAdmin = hasRole(['ADMIN', 'SUPER_ADMIN', 'ELECTION_COMMISSION']);

  const [candidates, setCandidates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

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
      setError(err.response?.data?.message || 'Failed to load candidates list.');
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedStatus]);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  const handleApprove = async (id) => {
    try {
      await candidateService.approveCandidate(id);
      setActionSuccessMsg('Candidate nomination approved successfully!');
      fetchCandidates();
      setTimeout(() => setActionSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve candidate.');
    }
  };

  const handleReject = async (id) => {
    try {
      await candidateService.rejectCandidate(id);
      setActionSuccessMsg('Candidate nomination rejected.');
      fetchCandidates();
      setTimeout(() => setActionSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject candidate.');
    }
  };

  const handleWithdraw = async (id) => {
    if (!window.confirm('Are you sure you want to withdraw your nomination?')) return;
    try {
      await candidateService.withdrawCandidate(id);
      setActionSuccessMsg('Nomination withdrawn.');
      fetchCandidates();
      setTimeout(() => setActionSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to withdraw nomination.');
    }
  };

  // Stats calculation
  const stats = {
    total: candidates.length,
    approved: candidates.filter(c => (c.nominationStatus || c.status) === 'APPROVED').length,
    pending: candidates.filter(c => (c.nominationStatus || c.status) === 'PENDING').length,
    rejected: candidates.filter(c => (c.nominationStatus || c.status) === 'REJECTED').length,
  };

  return (
    <div className="space-y-8 py-4">
      
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950/30 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Phase 4 Candidate Directory
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Candidate Nominations Hub
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-xl">
              Inspect student candidate manifestos, review nomination credentials, and submit candidacy applications.
            </p>
          </div>

          {isAuthenticated && (
            <Link
              to="/candidates/nominate"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 font-bold text-xs shadow-xl shadow-amber-500/25 transition-all transform hover:scale-[1.02] shrink-0"
            >
              <UserPlus className="w-4 h-4" />
              <span>Apply for Nomination</span>
            </Link>
          )}
        </div>
      </div>

      {/* Action Success Notification */}
      {actionSuccessMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Summary Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>Total Candidates</span>
          </div>
          <p className="text-2xl font-bold text-slate-100">{stats.total}</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
          <div className="flex items-center gap-2 text-emerald-400 text-xs mb-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Approved</span>
          </div>
          <p className="text-2xl font-bold text-emerald-300">{stats.approved}</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
          <div className="flex items-center gap-2 text-amber-400 text-xs mb-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Pending Review</span>
          </div>
          <p className="text-2xl font-bold text-amber-300">{stats.pending}</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
          <div className="flex items-center gap-2 text-rose-400 text-xs mb-1">
            <XCircle className="w-3.5 h-3.5" />
            <span>Rejected</span>
          </div>
          <p className="text-2xl font-bold text-rose-300">{stats.rejected}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="space-y-4">
        <SearchBar
          value={searchQuery}
          onChange={(val) => setSearchQuery(val)}
          onClear={() => setSearchQuery('')}
          placeholder="Search candidates by name or manifesto keywords..."
        />

        <CandidateStatusFilter
          selectedStatus={selectedStatus}
          onSelectStatus={(status) => setSelectedStatus(status)}
        />
      </div>

      {/* Candidate List Grid */}
      <CandidateList
        candidates={candidates}
        isLoading={isLoading}
        error={error}
        onRetry={fetchCandidates}
        onApprove={handleApprove}
        onReject={handleReject}
        onWithdraw={handleWithdraw}
      />

    </div>
  );
}
