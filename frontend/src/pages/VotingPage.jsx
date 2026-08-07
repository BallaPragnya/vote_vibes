import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import electionService from '../services/electionService';
import candidateService from '../services/candidateService';
import voteService from '../services/voteService';
import CandidateSelectionGrid from '../components/CandidateSelectionGrid';
import VoteConfirmationModal from '../components/VoteConfirmationModal';
import VoteReceipt from '../components/VoteReceipt';
import VoterStatusBadge from '../components/VoterStatusBadge';
import useAuth from '../hooks/useAuth';
import { Vote, ArrowLeft, AlertCircle, CheckCircle2, ShieldCheck, Sparkles, Layers } from 'lucide-react';

export default function VotingPage() {
  const { electionId: paramElectionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [activeElections, setActiveElections] = useState([]);
  const [selectedElectionId, setSelectedElectionId] = useState(paramElectionId || '');
  const [election, setElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidateId, setSelectedCandidateId] = useState('');

  const [hasVoted, setHasVoted] = useState(false);
  const [voteReceiptResult, setVoteReceiptResult] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load list of active elections
  useEffect(() => {
    async function loadActiveElections() {
      try {
        const res = await electionService.getAllElections({ status: 'ACTIVE' });
        let items = [];
        if (res?.data) {
          if (Array.isArray(res.data)) items = res.data;
          else if (Array.isArray(res.data.elections)) items = res.data.elections;
          else if (Array.isArray(res.data.data)) items = res.data.data;
        } else if (Array.isArray(res)) {
          items = res;
        }
        setActiveElections(items);

        if (!selectedElectionId && items.length > 0) {
          setSelectedElectionId(items[0].id);
        }
      } catch (err) {
        // Non-blocking
      }
    }
    loadActiveElections();
  }, [selectedElectionId]);

  const loadElectionBallot = useCallback(async () => {
    if (!selectedElectionId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    try {
      // 1. Fetch election details
      const elecRes = await electionService.getElectionById(selectedElectionId);
      const elecData = elecRes?.data || elecRes;
      setElection(elecData);

      // 2. Check voter status for this election
      try {
        const statusRes = await voteService.getVotingStatus(selectedElectionId);
        const statusData = statusRes?.data || statusRes;
        if (statusData?.hasVoted) {
          setHasVoted(true);
          if (statusData?.voteReceipt) {
            setVoteReceiptResult(statusData.voteReceipt);
          }
        } else {
          setHasVoted(false);
          setVoteReceiptResult(null);
        }
      } catch (err) {
        // Continue if status check errors out
      }

      // 3. Fetch APPROVED candidates for this election
      const candRes = await candidateService.getAllCandidates({ electionId: selectedElectionId, status: 'APPROVED' });
      let items = [];
      if (candRes?.data) {
        if (Array.isArray(candRes.data)) items = candRes.data;
        else if (Array.isArray(candRes.data.candidates)) items = candRes.data.candidates;
        else if (Array.isArray(candRes.data.data)) items = candRes.data.data;
      } else if (Array.isArray(candRes)) {
        items = candRes;
      }

      setCandidates(items);
      if (items.length > 0) {
        setSelectedCandidateId(items[0].id);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to load election voting booth.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedElectionId]);

  useEffect(() => {
    loadElectionBallot();
  }, [loadElectionBallot]);

  const handleCastVote = async () => {
    if (!selectedCandidateId || !selectedElectionId) return;
    setIsSubmitting(true);
    setErrorMsg('');
    try {
      const payload = {
        electionId: selectedElectionId,
        candidateId: selectedCandidateId,
      };

      const res = await voteService.castVote(payload);

      if (res?.success || res?.data) {
        const receiptObj = res.data?.receipt || res.data || res;
        setVoteReceiptResult(receiptObj);
        setHasVoted(true);
        setConfirmModalOpen(false);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to submit vote. Duplicate voting is prohibited.');
      setConfirmModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCandidate = candidates.find((c) => c.id === selectedCandidateId);
  const isElectionActive = election?.status === 'ACTIVE';

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

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              Digital Voting Booth
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {election?.title || 'Campus Election Voting'}
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-xl">
              Cast your vote. Your vote is anonymized and verified on the SHA-256 blockchain ledger.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <VoterStatusBadge hasVoted={hasVoted} />
          </div>
        </div>
      </div>

      {/* Election Selector Dropdown if multiple active elections */}
      {activeElections.length > 1 && (
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-4">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            Switch Active Election:
          </label>
          <select
            value={selectedElectionId}
            onChange={(e) => {
              setSelectedElectionId(e.target.value);
              navigate(`/vote/${e.target.value}`);
            }}
            className="px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs font-semibold focus:outline-none focus:border-indigo-500"
          >
            {activeElections.map((elec) => (
              <option key={elec.id} value={elec.id} className="bg-slate-900 text-white">
                {elec.title}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Error Notice */}
      {errorMsg && (
        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Voter Status Notice */}
      {hasVoted && (
        <div className="p-6 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-4">
          <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
          <h3 className="text-lg font-bold text-white">Vote Successfully Submitted</h3>
          <p className="text-xs text-slate-300 max-w-md mx-auto">
            You have already voted in this election. Voting controls are disabled to prevent duplicate votes.
          </p>

          {voteReceiptResult && (
            <div className="max-w-xl mx-auto text-left pt-2">
              <VoteReceipt receipt={voteReceiptResult} />
            </div>
          )}
        </div>
      )}

      {/* Candidate Selection Booth */}
      {!hasVoted && (
        <div className="space-y-6">
          {!isElectionActive && election && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs text-center font-semibold">
              Voting is disabled because this election is currently in {election.status} status.
            </div>
          )}

          {isLoading ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-10 h-10 border-3 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-400">Loading approved candidate ballot...</p>
            </div>
          ) : (
            <CandidateSelectionGrid
              candidates={candidates}
              selectedCandidateId={selectedCandidateId}
              onSelectCandidate={(id) => setSelectedCandidateId(id)}
              disabled={!isElectionActive}
            />
          )}

          {/* Submit Vote Button */}
          {candidates.length > 0 && isElectionActive && (
            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setConfirmModalOpen(true)}
                disabled={!selectedCandidateId}
                className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-600 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-bold text-sm shadow-xl shadow-indigo-500/25 transition-all transform active:scale-95 disabled:opacity-50"
              >
                <Vote className="w-4 h-4" />
                <span>Cast Vote</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Confirmation Modal */}
      <VoteConfirmationModal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={handleCastVote}
        selectedCandidate={selectedCandidate}
        electionTitle={election?.title}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
