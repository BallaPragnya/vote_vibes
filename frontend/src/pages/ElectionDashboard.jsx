import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import electionService from '../services/electionService';
import SearchBar from '../components/SearchBar';
import StatusFilter from '../components/StatusFilter';
import ElectionList from '../components/ElectionList';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import useAuth from '../hooks/useAuth';
import { 
  Vote, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Layers, 
  Sparkles, 
  FileText,
  AlertCircle
} from 'lucide-react';

export default function ElectionDashboard() {
  const { hasRole } = useAuth();
  const isAdmin = hasRole(['ADMIN', 'SUPER_ADMIN', 'ELECTION_COMMISSION']);

  const [elections, setElections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Deletion modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedElection, setSelectedElection] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

  const fetchElections = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const params = {};
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (selectedStatus !== 'ALL') params.status = selectedStatus;

      const res = await electionService.getAllElections(params);

      let items = [];
      if (res?.data) {
        if (Array.isArray(res.data)) items = res.data;
        else if (Array.isArray(res.data.data)) items = res.data.data;
        else if (Array.isArray(res.data.elections)) items = res.data.elections;
      } else if (Array.isArray(res)) {
        items = res;
      }

      setElections(items);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load elections list.');
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedStatus]);

  useEffect(() => {
    fetchElections();
  }, [fetchElections]);

  // Open delete modal
  const handleDeleteClick = (id, title) => {
    setSelectedElection({ id, title });
    setDeleteModalOpen(true);
  };

  // Confirm delete handler
  const handleConfirmDelete = async () => {
    if (!selectedElection) return;
    setIsDeleting(true);
    try {
      await electionService.deleteElection(selectedElection.id);
      setActionSuccessMsg(`Election "${selectedElection.title}" deleted successfully.`);
      setDeleteModalOpen(false);
      setSelectedElection(null);
      fetchElections();
      setTimeout(() => setActionSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete election.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Calculate election statistics
  const stats = {
    total: elections.length,
    active: elections.filter(e => e.status === 'ACTIVE').length,
    upcoming: elections.filter(e => e.status === 'UPCOMING').length,
    completed: elections.filter(e => e.status === 'COMPLETED').length,
    draft: elections.filter(e => e.status === 'DRAFT').length,
  };

  return (
    <div className="space-y-8 py-4">
      
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Campus Elections
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Campus Elections Hub
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-xl">
              Explore active, upcoming, and completed college elections. Track schedules, candidate lineups, and vote transparency.
            </p>
          </div>

          {isAdmin && (
            <Link
              to="/admin/elections/create"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-600 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-bold text-xs shadow-xl shadow-indigo-500/25 transition-all transform hover:scale-[1.02] shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Election</span>
            </Link>
          )}
        </div>
      </div>

      {/* Action Notification Banner */}
      {actionSuccessMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
            <Vote className="w-3.5 h-3.5 text-indigo-400" />
            <span>Total Listed</span>
          </div>
          <p className="text-2xl font-bold text-slate-100">{stats.total}</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
          <div className="flex items-center gap-2 text-emerald-400 text-xs mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Active Elections</span>
          </div>
          <p className="text-2xl font-bold text-emerald-300">{stats.active}</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
          <div className="flex items-center gap-2 text-amber-400 text-xs mb-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Upcoming</span>
          </div>
          <p className="text-2xl font-bold text-amber-300">{stats.upcoming}</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
          <div className="flex items-center gap-2 text-indigo-400 text-xs mb-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Completed</span>
          </div>
          <p className="text-2xl font-bold text-indigo-300">{stats.completed}</p>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="space-y-4">
        <SearchBar
          value={searchQuery}
          onChange={(val) => setSearchQuery(val)}
          onClear={() => setSearchQuery('')}
        />

        <StatusFilter
          selectedStatus={selectedStatus}
          onSelectStatus={(status) => setSelectedStatus(status)}
        />
      </div>

      {/* Elections Grid List */}
      <ElectionList
        elections={elections}
        isLoading={isLoading}
        error={error}
        onRetry={fetchElections}
        onDelete={handleDeleteClick}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedElection(null);
        }}
        onConfirm={handleConfirmDelete}
        electionTitle={selectedElection?.title}
        isDeleting={isDeleting}
      />

    </div>
  );
}
