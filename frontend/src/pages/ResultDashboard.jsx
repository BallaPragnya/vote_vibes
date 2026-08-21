import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import resultService from '../services/resultService';
import electionService from '../services/electionService';
import ResultSummaryCards from '../components/ResultSummaryCards';
import VoteDistributionChart from '../components/VoteDistributionChart';
import TurnoutChart from '../components/TurnoutChart';
import DemographicBreakdownChart from '../components/DemographicBreakdownChart';
import WinnerAnnouncement from '../components/WinnerAnnouncement';
import PdfSummaryWidget from '../components/PdfSummaryWidget';
import ResultLoadingSkeleton from '../components/ResultLoadingSkeleton';
import ResultErrorState from '../components/ResultErrorState';
import { BarChart3, ShieldCheck, ArrowLeft, RefreshCw, Trophy, Sparkles, Inbox } from 'lucide-react';

export default function ResultDashboard() {
  const { electionId: routeElectionId } = useParams();
  const navigate = useNavigate();

  const [electionsList, setElectionsList] = useState([]);
  const [selectedElectionId, setSelectedElectionId] = useState(routeElectionId || '');

  const [electionData, setElectionData] = useState(null);
  const [resultsData, setResultsData] = useState(null);
  const [turnoutInfo, setTurnoutInfo] = useState({ totalVotesCast: 0, eligibleVoters: 0, turnoutPercentage: 0 });
  const [winners, setWinners] = useState([]);
  const [demographics, setDemographics] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // 1. Fetch available elections list
  useEffect(() => {
    async function loadElections() {
      try {
        const res = await electionService.getAllElections();
        let items = [];
        if (res?.data) {
          if (Array.isArray(res.data)) items = res.data;
          else if (Array.isArray(res.data.elections)) items = res.data.elections;
          else if (Array.isArray(res.data.data)) items = res.data.data;
        } else if (Array.isArray(res)) {
          items = res;
        }
        setElectionsList(items);

        if (!selectedElectionId && items.length > 0) {
          setSelectedElectionId(items[0].id);
        }
      } catch (err) {
        // Non-blocking election list load error
      }
    }
    loadElections();
  }, [routeElectionId]);

  // Sync state if route URL changes
  useEffect(() => {
    if (routeElectionId) {
      setSelectedElectionId(routeElectionId);
    }
  }, [routeElectionId]);

  // 2. Load dashboard results data for selected election
  const loadDashboardData = useCallback(async () => {
    if (!selectedElectionId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      let elec = null;
      let res = null;

      try {
        const elecRes = await resultService.getElectionDetails(selectedElectionId);
        elec = elecRes?.data || elecRes;
      } catch (err) {
        // Fallback
      }

      try {
        const resultsRes = await resultService.getElectionResults(selectedElectionId);
        res = resultsRes?.data || resultsRes;
      } catch (err) {
        // Handle API error
      }

      if (res && (res.results || res.totalVotesCast !== undefined)) {
        setElectionData(elec || { title: res.electionTitle || 'College Election', status: res.status });
        setResultsData(res);

        const turnout = resultService.calculateTurnout(res, elec);
        setTurnoutInfo(turnout);

        const extractedWinners = resultService.extractWinners(res);
        setWinners(extractedWinners);

        const demoBreakdown = resultService.extractDemographicBreakdown(res);
        setDemographics(demoBreakdown);
      } else if (elec) {
        setElectionData(elec);
        setResultsData({ electionId: selectedElectionId, electionTitle: elec.title, status: elec.status, results: [] });
        setTurnoutInfo({ totalVotesCast: 0, eligibleVoters: 500, turnoutPercentage: 0 });
        setWinners([]);
        setDemographics([]);
      } else {
        setElectionData(null);
        setResultsData(null);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load election results dashboard.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedElectionId]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleElectionChange = (e) => {
    const id = e.target.value;
    setSelectedElectionId(id);
    navigate(`/results/${id}`);
  };

  if (isLoading) {
    return <ResultLoadingSkeleton />;
  }

  if (error) {
    return <ResultErrorState error={error} onRetry={loadDashboardData} />;
  }

  const positions = resultsData?.results || [];
  const hasNoElections = electionsList.length === 0 && !selectedElectionId;
  const hasNoResults = !resultsData || positions.length === 0;

  return (
    <div className="space-y-8 py-4 max-w-7xl mx-auto">
      {/* Navigation back button */}
      <div className="flex items-center justify-between">
        <Link
          to="/elections"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Elections Hub
        </Link>

        {/* Election Selector Dropdown */}
        {electionsList.length > 0 && (
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-400">Select Election:</label>
            <select
              value={selectedElectionId}
              onChange={handleElectionChange}
              className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-medium text-slate-200 focus:outline-none focus:border-amber-500"
            >
              {electionsList.map((elec) => (
                <option key={elec.id} value={elec.id} className="bg-slate-950 text-white">
                  {elec.title} ({elec.status})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Main Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Results & Analytics
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {electionData?.title || 'Campus Election Results'}
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-xl">
              Certified election tallies, voter turnout analytics, declared winners, and downloadable PDF report.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadDashboardData}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition-colors shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Analytics</span>
            </button>
          </div>
        </div>
      </div>

      {/* Clean Empty State when no elections or zero vote results exist */}
      {hasNoElections || hasNoResults ? (
        <div className="py-20 px-6 text-center bg-slate-900/60 border border-slate-800 rounded-3xl backdrop-blur-md max-w-md mx-auto space-y-4">
          <div className="p-4 bg-indigo-500/10 rounded-2xl w-fit mx-auto border border-indigo-500/20 text-indigo-400">
            <Inbox className="w-10 h-10" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-1">No Election Results Available</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {hasNoElections
                ? 'There are no election events created in the system yet.'
                : 'No ballots or tally results have been recorded for this election yet.'}
            </p>
          </div>
          <Link
            to="/elections"
            className="inline-block px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-lg shadow-indigo-500/20 transition-all"
          >
            Explore Elections
          </Link>
        </div>
      ) : (
        <>
          {/* Summary Stat Cards */}
          <ResultSummaryCards
            turnoutInfo={turnoutInfo}
            positionsCount={positions.length}
            winnerCount={winners.length}
          />

          {/* Winner Announcement Component */}
          <WinnerAnnouncement
            electionTitle={electionData?.title}
            winners={winners}
          />

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TurnoutChart turnoutInfo={turnoutInfo} />
            <DemographicBreakdownChart demographicData={demographics} />
          </div>

          {/* Position Vote Distribution Charts */}
          {positions.map((pos) => (
            <VoteDistributionChart
              key={pos.positionId}
              positionTitle={pos.positionTitle}
              candidates={pos.candidates}
            />
          ))}

          {/* Downloadable PDF Summary Widget */}
          <PdfSummaryWidget
            electionTitle={electionData?.title}
            resultsData={resultsData}
            winners={winners}
            turnoutInfo={turnoutInfo}
          />
        </>
      )}
    </div>
  );
}
