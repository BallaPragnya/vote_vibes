import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import electionService from '../services/electionService';
import ElectionStatusBadge from '../components/ElectionStatusBadge';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import useAuth from '../hooks/useAuth';
import { 
  Calendar, 
  ArrowLeft, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Play, 
  XCircle, 
  Archive,
  Layers,
  Award,
  Vote,
  BarChart3
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

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchElection = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await electionService.getElectionById(id);
      setElection(res?.data || res);
    } catch (err) {
      setError(err.response?.data?.message || 'Election details not found.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchElection();
  }, [fetchElection]);

  const handleStatusTransition = async (newStatus) => {
    setStatusUpdating(true);
    setSuccessMsg('');
    try {
      await electionService.updateElectionStatus(id, newStatus);
      setSuccessMsg(`Election status updated to '${newStatus}' successfully!`);
      fetchElection();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || `Failed to update status to '${newStatus}'.`);
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await electionService.deleteElection(id);
      setDeleteModalOpen(false);
      navigate('/elections');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete election.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="w-10 h-10 border-3 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-400 font-medium">Loading election schedule & candidates...</p>
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
        <p className="text-xs text-slate-400 mb-6">{error || 'The requested election does not exist.'}</p>
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

  const isEditable = election?.status === 'DRAFT' && isAdmin;
  const isDeletable = (election?.status === 'DRAFT' || election?.status === 'CANCELLED') && isAdmin;
  const isActive = election?.status === 'ACTIVE';
  const isCompleted = election?.status === 'COMPLETED';

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

      {/* Main Details Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden space-y-6">
        
        {/* Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-600" />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{election.title}</h1>
              <ElectionStatusBadge status={election.status} />
            </div>
            <p className="text-xs text-slate-400">
              Created By: <span className="text-slate-300 font-semibold">{election.createdBy?.name || 'Administrator'}</span>
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2">
            {isActive && (
              <Link
                to={`/elections/${election.id}/vote`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 transition-all transform active:scale-95"
              >
                <Vote className="w-4 h-4" />
                <span>Cast Vote Now</span>
              </Link>
            )}

            {isCompleted && (
              <Link
                to={`/elections/${election.id}/results`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 font-bold text-xs transition-colors"
              >
                <BarChart3 className="w-4 h-4" />
                <span>View Results</span>
              </Link>
            )}

            {isEditable && (
              <Link
                to={`/admin/elections/${election.id}/edit`}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors"
                title="Edit Election"
              >
                <Edit className="w-4 h-4" />
              </Link>
            )}

            {isDeletable && (
              <button
                onClick={() => setDeleteModalOpen(true)}
                className="p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                title="Delete Election"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Success Message */}
        {successMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Description */}
        <p className="text-slate-300 text-sm leading-relaxed">
          {election.description || 'No detailed description provided.'}
        </p>

        {/* Schedule Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-850 flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Start Schedule</span>
              <span className="text-xs font-semibold text-slate-200">
                {new Date(election.startDate).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-850 flex items-center gap-3">
            <div className="p-2.5 bg-purple-500/10 rounded-xl text-purple-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">End Schedule</span>
              <span className="text-xs font-semibold text-slate-200">
                {new Date(election.endDate).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Admin Lifecycle Status Transition Panel */}
        {isAdmin && (
          <div className="pt-6 border-t border-slate-800 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Election Commission Lifecycle Transition Controls
            </h3>

            <div className="flex flex-wrap items-center gap-2">
              {election.status === 'DRAFT' && (
                <button
                  disabled={statusUpdating}
                  onClick={() => handleStatusTransition('UPCOMING')}
                  className="px-3.5 py-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/20 text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Publish as UPCOMING</span>
                </button>
              )}

              {(election.status === 'DRAFT' || election.status === 'UPCOMING') && (
                <button
                  disabled={statusUpdating}
                  onClick={() => handleStatusTransition('ACTIVE')}
                  className="px-3.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Open Voting (ACTIVE)</span>
                </button>
              )}

              {election.status === 'ACTIVE' && (
                <button
                  disabled={statusUpdating}
                  onClick={() => handleStatusTransition('COMPLETED')}
                  className="px-3.5 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/20 text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Close Voting (COMPLETED)</span>
                </button>
              )}

              {election.status !== 'CANCELLED' && election.status !== 'COMPLETED' && (
                <button
                  disabled={statusUpdating}
                  onClick={() => handleStatusTransition('CANCELLED')}
                  className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Cancel Election</span>
                </button>
              )}
            </div>
          </div>
        )}

      </div>

      {/* Delete Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Election"
        message={`Are you sure you want to delete '${election.title}'?`}
        isDeleting={isDeleting}
      />
    </div>
  );
}
