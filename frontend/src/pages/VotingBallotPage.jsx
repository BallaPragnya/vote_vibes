import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import electionService from '../services/electionService';
import candidateService from '../services/candidateService';
import voteService from '../services/voteService';
import useAuth from '../hooks/useAuth';
import { 
  Vote, 
  User, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft, 
  Lock, 
  ShieldCheck, 
  Sparkles,
  FileText,
  Copy,
  ExternalLink
} from 'lucide-react';

export default function VotingBallotPage() {
  const { id: electionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [election, setElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidateId, setSelectedCandidateId] = useState('');
  const [hasVoted, setHasVoted] = useState(false);
  const [existingReceipt, setExistingReceipt] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Post-vote receipt popup state
  const [voteReceiptResult, setVoteReceiptResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      // 1. Fetch Election details
      const electionRes = await electionService.getElectionById(electionId);
      const electionData = electionRes?.data || electionRes;
      setElection(electionData);

      // 2. Check Voter Status in this election
      try {
        const statusRes = await voteService.getVoterStatus(electionId);
        if (statusRes?.data?.hasVoted || statusRes?.hasVoted) {
          setHasVoted(true);
          setExistingReceipt(statusRes?.data?.voteReceipt || statusRes?.voteReceipt || statusRes?.data?.receiptCode);
        }
      } catch (err) {
        // Non-blocking if status check fails
      }

      // 3. Fetch APPROVED candidates for this election
      const candRes = await candidateService.getAllCandidates({ electionId, status: 'APPROVED' });
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
      setErrorMsg(err.response?.data?.message || 'Failed to load election ballot.');
    } finally {
      setIsLoading(false);
    }
  }, [electionId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCastVote = async () => {
    if (!selectedCandidateId) return;
    setIsSubmitting(true);
    setErrorMsg('');
    try {
      const payload = {
        electionId,
        candidateId: selectedCandidateId,
      };

      const res = await voteService.castVote(payload);

      if (res?.success || res?.data) {
        const receiptData = res.data?.receipt || res.data || res;
        setVoteReceiptResult(receiptData);
        setHasVoted(true);
        setConfirmModalOpen(false);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to submit vote. Please try again.');
      setConfirmModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="w-10 h-10 border-3 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-400 font-medium">Securing voting booth session...</p>
      </div>
    );
  }

  const selectedCandidate = candidates.find((c) => c.id === selectedCandidateId);

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      <div>
        <Link
          to={`/elections/${electionId}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Election Details
        </Link>
      </div>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              Cryptographic Voting Booth
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Official Ballot: {election?.title || 'Campus Election'}
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-xl">
              Cast your vote for a candidate nominee. Your vote is anonymized and recorded on the SHA-256 blockchain ledger.
            </p>
          </div>

          <div className="flex flex-col items-start sm:items-end gap-1.5">
            <span className="text-xs font-bold px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/20 text-indigo-300">
              Voter: {user?.name}
            </span>
          </div>
        </div>
      </div>

      {/* Already Voted Notice */}
      {hasVoted && !voteReceiptResult && (
        <div className="p-6 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-3">
          <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
          <h3 className="text-lg font-bold text-white">Vote Successfully Cast!</h3>
          <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
            You have already participated in this election. Your vote has been securely recorded on the blockchain.
          </p>

          <div className="pt-2 flex justify-center gap-3">
            <Link
              to="/audit"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-all shadow-lg shadow-indigo-500/25"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Verify Receipt on Blockchain</span>
            </Link>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {errorMsg && (
        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Candidate Ballot Selection Form */}
      {!hasVoted && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Select Your Candidate</h2>
            <span className="text-xs text-slate-400">1 Selection Required</span>
          </div>

          {candidates.length === 0 ? (
            <div className="py-12 text-center bg-slate-900/60 border border-slate-800 rounded-3xl">
              <Vote className="w-8 h-8 text-slate-500 mx-auto mb-2" />
              <p className="text-xs text-slate-400">No approved candidates available for this election ballot yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {candidates.map((cand) => {
                const isSelected = selectedCandidateId === cand.id;
                const photo = cand.profileImage || cand.photoUrl;
                const candName = cand.fullName || cand.user?.name || 'Nominated Candidate';

                return (
                  <div
                    key={cand.id}
                    onClick={() => setSelectedCandidateId(cand.id)}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
                      isSelected
                        ? 'bg-indigo-950/40 border-indigo-500 shadow-xl shadow-indigo-500/10 ring-1 ring-indigo-500'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="pt-0.5">
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                        isSelected ? 'border-indigo-400 bg-indigo-500' : 'border-slate-700 bg-slate-950'
                      }`}>
                        {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        {photo ? (
                          <img src={photo} alt={candName} className="w-10 h-10 rounded-full object-cover border border-slate-700 shrink-0" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 shrink-0">
                            <User className="w-5 h-5" />
                          </div>
                        )}
                        <div>
                          <h3 className="font-bold text-slate-100 text-sm truncate">{candName}</h3>
                          <p className="text-[11px] text-indigo-400">Approved Candidate</p>
                        </div>
                      </div>

                      <p className="text-xs text-slate-400 line-clamp-2 italic">
                        "{cand.manifesto || 'No manifesto summary.'}"
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Action Button */}
          {candidates.length > 0 && (
            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setConfirmModalOpen(true)}
                disabled={!selectedCandidateId}
                className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-600 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-bold text-sm shadow-xl shadow-indigo-500/25 transition-all transform active:scale-95 disabled:opacity-50"
              >
                <Vote className="w-4 h-4" />
                <span>Review & Cast Vote</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative space-y-5">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-indigo-400">
                <Vote className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Confirm Vote Submission</h3>
                <p className="text-xs text-slate-400">This action is permanent and irreversible.</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
              <p className="text-xs text-slate-400 uppercase font-semibold">Selected Candidate</p>
              <p className="text-base font-extrabold text-indigo-300">
                {selectedCandidate?.fullName || selectedCandidate?.user?.name || 'Nominee'}
              </p>
              <p className="text-xs text-slate-400 mt-1">Election: {election?.title}</p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModalOpen(false)}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleCastVote}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Signing Vote...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Cast Final Vote</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Post-Vote Receipt Modal */}
      {voteReceiptResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-indigo-500 to-purple-600" />

            <div className="text-center space-y-2">
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 w-fit mx-auto">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-extrabold text-white">Cryptographic Vote Receipt</h2>
              <p className="text-xs text-slate-400">Your vote has been committed to the SHA-256 blockchain ledger</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-850 space-y-3 font-mono text-xs">
              <div>
                <span className="text-[10px] text-slate-500 uppercase block font-sans font-semibold">Receipt Code</span>
                <div className="flex items-center justify-between gap-2 mt-0.5">
                  <span className="text-emerald-400 font-bold break-all">
                    {voteReceiptResult.receiptCode || voteReceiptResult.id || voteReceiptResult.receiptId}
                  </span>
                  <button
                    onClick={() => copyToClipboard(voteReceiptResult.receiptCode || voteReceiptResult.id || voteReceiptResult.receiptId)}
                    className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white shrink-0"
                    title="Copy Receipt Code"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {voteReceiptResult.blockHash && (
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-sans font-semibold">Block Hash (SHA-256)</span>
                  <p className="text-slate-300 text-[10px] break-all truncate mt-0.5">{voteReceiptResult.blockHash}</p>
                </div>
              )}

              {copied && (
                <p className="text-[11px] text-emerald-400 font-sans text-center">Receipt code copied to clipboard!</p>
              )}
            </div>

            <div className="flex justify-center gap-3 pt-2">
              <Link
                to="/audit"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-lg shadow-indigo-500/20"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Verify on Audit Explorer</span>
              </Link>

              <button
                onClick={() => setVoteReceiptResult(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
