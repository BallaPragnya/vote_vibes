import React, { useState, useEffect, useCallback } from 'react';
import candidateService from '../services/candidateService';
import SearchBar from '../components/SearchBar';
import CandidateStatusFilter from '../components/CandidateStatusFilter';
import CandidateGrid from '../components/CandidateGrid';
import ManifestoViewer from '../components/ManifestoViewer';
import { Award, Sparkles, CheckCircle2 } from 'lucide-react';

export default function CandidateGridPage() {
  const [candidates, setCandidates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('APPROVED');

  // Manifesto Viewer Modal State
  const [viewerCandidate, setViewerCandidate] = useState(null);
  const [viewerOpen, setViewerOpen] = useState(false);

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
      setError(err.response?.data?.message || 'Failed to load candidates.');
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedStatus]);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  const handleOpenManifesto = (candidate) => {
    setViewerCandidate(candidate);
    setViewerOpen(true);
  };

  return (
    <div className="space-y-8 py-4">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950/30 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Approved Candidates Directory
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Campus Candidates Grid
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-xl">
              Inspect candidate profiles, read election manifestos, and review approved nominees running in active college elections.
            </p>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
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

      {/* Candidates Grid */}
      <CandidateGrid
        candidates={candidates}
        isLoading={isLoading}
        error={error}
        onRetry={fetchCandidates}
        onOpenManifesto={handleOpenManifesto}
      />

      {/* Manifesto Viewer Modal */}
      <ManifestoViewer
        isOpen={viewerOpen}
        onClose={() => {
          setViewerOpen(false);
          setViewerCandidate(null);
        }}
        candidate={viewerCandidate}
      />
    </div>
  );
}
