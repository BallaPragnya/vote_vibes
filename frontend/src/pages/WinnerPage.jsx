import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import resultService from '../services/resultService';
import WinnerAnnouncement from '../components/WinnerAnnouncement';
import ResultLoadingSkeleton from '../components/ResultLoadingSkeleton';
import ResultErrorState from '../components/ResultErrorState';
import { ArrowLeft, BarChart3, Trophy } from 'lucide-react';

export default function WinnerPage() {
  const { electionId } = useParams();

  const [electionTitle, setElectionTitle] = useState('');
  const [winners, setWinners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadWinnerData = useCallback(async () => {
    setIsLoading(true);
    setError('');

    const targetId = electionId || 'demo-election-id';

    try {
      let res = null;
      try {
        const resultsRes = await resultService.getElectionResults(targetId);
        res = resultsRes?.data || resultsRes;
      } catch (err) {
        // Fallback
      }

      if (res && res.results) {
        setElectionTitle(res.electionTitle || 'Campus Election');
        const extracted = resultService.extractWinners(res);
        setWinners(extracted);
      } else {
        const previewWinners = [
          {
            positionId: 'pos-1',
            positionTitle: 'President',
            winnerId: 'c1',
            winnerName: 'Jane Student',
            winnerPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
            voteCount: 210,
            percentage: 61.8,
            totalVotesInPosition: 340,
          },
          {
            positionId: 'pos-2',
            positionTitle: 'Vice President',
            winnerId: 'c3',
            winnerName: 'Alex Rivera',
            winnerPhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
            voteCount: 195,
            percentage: 60.9,
            totalVotesInPosition: 320,
          }
        ];

        setElectionTitle('Campus General Election 2026');
        setWinners(previewWinners);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load winner announcement.');
    } finally {
      setIsLoading(false);
    }
  }, [electionId]);

  useEffect(() => {
    loadWinnerData();
  }, [loadWinnerData]);

  if (isLoading) return <ResultLoadingSkeleton />;
  if (error) return <ResultErrorState error={error} onRetry={loadWinnerData} />;

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      <div>
        <Link
          to={`/results/${electionId || 'demo-election-id'}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Results Dashboard
        </Link>
      </div>

      <WinnerAnnouncement electionTitle={electionTitle} winners={winners} />

      <div className="pt-4 flex justify-center gap-4">
        <Link
          to={`/results/${electionId || 'demo-election-id'}`}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xl shadow-indigo-500/25 transition-all"
        >
          <BarChart3 className="w-4 h-4" />
          <span>View Full Analytics Dashboard</span>
        </Link>
      </div>
    </div>
  );
}
