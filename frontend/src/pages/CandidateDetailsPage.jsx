import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import candidateService from '../services/candidateService';
import CandidateStatusBadge from '../components/CandidateStatusBadge';
import useAuth from '../hooks/useAuth';
import { 
  User, 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Award, 
  FileText, 
  ShieldCheck,
  Calendar
} from 'lucide-react';

export default function CandidateDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();
  const isAdmin = hasRole(['ADMIN', 'SUPER_ADMIN', 'ELECTION_COMMISSION']);

  const [candidate, setCandidate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchCandidate = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await candidateService.getCandidateById(id);
      setCandidate(res?.data || res);
    } catch (err) {
      setError(err.response?.data?.message || 'Candidate record not found.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCandidate();
  }, [fetchCandidate]);

  const handleApprove = async () => {
    setStatusUpdating(true);
    try {
      await candidateService.approveCandidate(id);
      setSuccessMsg('Candidate nomination approved successfully!');
      fetchCandidate();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve candidate.');
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleReject = async () => {
    setStatusUpdating(true);
    try {
      await candidateService.rejectCandidate(id);
      setSuccessMsg('Candidate nomination rejected.');
      fetchCandidate();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject candidate.');
    } fontFinally: {
      setStatusUpdating(false);
    }
  };

  const handleWithdraw = async () => {
    if (!window.confirm('Are you sure you want to withdraw your nomination?')) return;
    try {
      await candidateService.withdrawCandidate(id);
      navigate('/candidates');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to withdraw nomination.');
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="w-10 h-10 border-3 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-400 font-medium">Loading candidate details...</p>
      </div>
    );
  }

  if (error || !candidate) {
    return (
      <div className="max-w-md mx-auto py-16 text-center">
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-3xl text-rose-400 w-fit mx-auto mb-4">
          <AlertTriangle className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Candidate Not Found</h2>
        <p className="text-xs text-slate-400 mb-6">{error || 'The requested candidate record could not be found.'}</p>
        <Link
          to="/candidates"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-200 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Candidates</span>
        </Link>
      </div>
    );
  }

  const photo = candidate?.profileImage || candidate?.photoUrl || candidate?.user?.profileImage;
  const name = candidate?.fullName || candidate?.user?.name || 'Nominated Candidate';
  const electionTitle = candidate?.election?.title || 'Campus Election';
  const status = candidate?.nominationStatus || candidate?.approvalStatus || candidate?.status || 'PENDING';
  const isOwner = user?.id === (candidate?.userId || candidate?.user?.id);

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      <div>
        <Link
          to="/candidates"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Candidate Directory
        </Link>
      </div>

      {/* Main Details Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden space-y-6">
        
        {/* Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-yellow-500 to-indigo-600" />

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            {photo ? (
              <img
                src={photo}
                alt={name}
                className="w-16 h-16 rounded-full object-cover border-2 border-amber-500/40 shrink-0 shadow-lg"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200';
                }}
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500/20 to-indigo-500/20 border-2 border-amber-500/40 flex items-center justify-center text-amber-300 font-bold shrink-0">
                <User className="w-8 h-8" />
              </div>
            )}

            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-extrabold text-white tracking-tight">{name}</h1>
                <CandidateStatusBadge status={status} />
              </div>
              <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                Nominated for: <strong className="text-slate-200">{electionTitle}</strong>
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {isAdmin && status === 'PENDING' && (
              <>
                <button
                  type="button"
                  disabled={statusUpdating}
                  onClick={handleApprove}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 text-xs font-semibold transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Approve Nomination</span>
                </button>

                <button
                  type="button"
                  disabled={statusUpdating}
                  onClick={handleReject}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-xs font-semibold transition-colors"
                >
                  <XCircle className="w-4 h-4 text-rose-400" />
                  <span>Reject</span>
                </button>
              </>
            )}

            {isOwner && status === 'PENDING' && (
              <button
                type="button"
                onClick={handleWithdraw}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                Withdraw Nomination
              </button>
            )}
          </div>
        </div>

        {/* Notifications */}
        {successMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Full Campaign Manifesto */}
        <div className="pt-4 border-t border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
            <FileText className="w-4 h-4" />
            <span>Official Campaign Manifesto</span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 leading-relaxed text-slate-200 text-sm whitespace-pre-line">
            {candidate?.manifesto || 'No detailed manifesto submitted.'}
          </div>
        </div>

        {/* Audit Details */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 pt-2 gap-2 border-t border-slate-800/80">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Nominee Identity Verified
          </span>
          <span className="font-mono text-slate-500">Nomination ID: {candidate.id}</span>
        </div>

      </div>

    </div>
  );
}
