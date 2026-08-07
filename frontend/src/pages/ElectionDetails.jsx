import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import electionService from '../services/electionService';
import ElectionStatusBadge from '../components/ElectionStatusBadge';
import useAuth from '../hooks/useAuth';
import { 
  Calendar, 
  Clock, 
  User, 
  ArrowLeft, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  Vote, 
  Award,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';

export default function ElectionDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const isAdmin = hasRole(['ADMIN', 'SUPER_ADMIN', 'ELECTION_COMMISSION']);

  const [election, setElection] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchElectionDetails = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await electionService.getElectionById(id);
      if (res?.data) {
        setElection(res.data);
      } else {
        setElection(res);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Election not found or error loading details.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchElectionDetails();
  }, [fetchElectionDetails]);

  const handleStatusChange = async (newStatus) => {
    setStatusUpdating(true);
    setSuccessMsg('');
    try {
      await electionService.changeStatus(id, newStatus);
      setSuccessMsg(`Status successfully updated to ${newStatus}`);
      fetchElectionDetails();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || `Failed to update status to ${newStatus}`);
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete "${election?.title}"?`)) return;
    try {
      await electionService.deleteElection(id);
      navigate('/elections');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete election.');
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="w-10 h-10 border-3 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-400 font-medium">Loading election details...</p>
      </div>
    );
  }

  if (error || !election) {
    return (
      <div className="max-w-md mx-auto py-16 text-center">
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-3xl text-rose-400 w-fit mx-auto mb-4">
          <AlertTriangle className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Election Not Found</h2>
        <p className="text-xs text-slate-400 mb-6">{error || 'The requested election record does not exist or has been archived.'}</p>
        <Link
          to="/elections"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-200 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Elections</span>
        </Link>
      </div>
    );
  }

  const startDateFormatted = election?.startTime || election?.startDate
    ? new Date(election.startTime || election.startDate).toLocaleString([], { dateStyle: 'full', timeStyle: 'short' })
    : 'TBD';

  const endDateFormatted = election?.endTime || election?.endDate
    ? new Date(election.endTime || election.endDate).toLocaleString([], { dateStyle: 'full', timeStyle: 'short' })
    : 'TBD';

  const creatorName = election?.createdBy?.name || election?.createdBy?.email || 'Election Commission';

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      
      {/* Back Navigation */}
      <div>
        <Link
          to="/elections"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Elections Hub
        </Link>
      </div>

      {/* Main Header Details Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden space-y-6">
        
        {/* Accent Glow */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-600" />

        {/* Status Badge & Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ElectionStatusBadge status={election?.status} />
            {election?.isDepartmentRestricted && (
              <span className="text-xs px-3 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 font-medium">
                Department Restricted
              </span>
            )}
          </div>

          {/* Admin Edit / Delete Actions */}
          {isAdmin && (
            <div className="flex items-center gap-2">
              {election?.status === 'DRAFT' && (
                <Link
                  to={`/admin/elections/${election.id}/edit`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Parameters</span>
                </Link>
              )}

              {(election?.status === 'DRAFT' || election?.status === 'CANCELLED') && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-xs font-semibold transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Title & Description */}
        <div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            {election.title}
          </h1>
          <p className="text-slate-300 text-sm mt-3 leading-relaxed whitespace-pre-line">
            {election.description || 'No detailed description provided.'}
          </p>
        </div>

        {/* Schedule Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-800">
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
            <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400 mt-0.5">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-semibold">Voting Commences</p>
              <p className="text-xs font-semibold text-slate-200 mt-0.5">{startDateFormatted}</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
            <div className="p-2 bg-violet-500/10 rounded-xl text-violet-400 mt-0.5">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-semibold">Voting Concludes</p>
              <p className="text-xs font-semibold text-slate-200 mt-0.5">{endDateFormatted}</p>
            </div>
          </div>
        </div>

        {/* Creator Info */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
          <span className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-slate-500" />
            Created by: <strong className="text-slate-300">{creatorName}</strong>
          </span>
          <span className="font-mono text-slate-500">ID: {election.id}</span>
        </div>

      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Admin Lifecycle Status Control Box */}
      {isAdmin && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-purple-400 text-xs font-semibold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Administrator Lifecycle Controls</span>
          </div>

          <p className="text-xs text-slate-400">
            Transition election status along approved business lifecycle paths.
          </p>

          <div className="flex flex-wrap gap-2 pt-2">
            {election.status === 'DRAFT' && (
              <button
                type="button"
                disabled={statusUpdating}
                onClick={() => handleStatusChange('UPCOMING')}
                className="px-4 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 text-xs font-semibold transition-colors"
              >
                Publish to UPCOMING
              </button>
            )}

            {(election.status === 'DRAFT' || election.status === 'UPCOMING') && (
              <button
                type="button"
                disabled={statusUpdating}
                onClick={() => handleStatusChange('ACTIVE')}
                className="px-4 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 text-xs font-semibold transition-colors"
              >
                Activate Election Now
              </button>
            )}

            {election.status === 'ACTIVE' && (
              <button
                type="button"
                disabled={statusUpdating}
                onClick={() => handleStatusChange('COMPLETED')}
                className="px-4 py-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 text-xs font-semibold transition-colors"
              >
                Mark as COMPLETED
              </button>
            )}

            {['DRAFT', 'UPCOMING', 'ACTIVE'].includes(election.status) && (
              <button
                type="button"
                disabled={statusUpdating}
                onClick={() => handleStatusChange('CANCELLED')}
                className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-xs font-semibold transition-colors"
              >
                Cancel Election
              </button>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
