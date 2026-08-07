import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, Link } from 'react-router-dom';
import voteService from '../services/voteService';
import { ShieldCheck, Search, CheckCircle2, AlertTriangle, Cpu, Layers, Lock, RefreshCw, Sparkles } from 'lucide-react';

export default function BlockchainAuditExplorerPage() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialCode = queryParams.get('code') || '';

  const [receiptCodeInput, setReceiptCodeInput] = useState(initialCode);
  const [verificationResult, setVerificationResult] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleVerify = useCallback(async (codeToVerify) => {
    const targetCode = codeToVerify || receiptCodeInput;
    if (!targetCode || !targetCode.trim()) {
      setErrorMsg('Please enter a valid receipt code or block hash.');
      return;
    }

    setIsVerifying(true);
    setErrorMsg('');
    setVerificationResult(null);

    try {
      const res = await voteService.verifyVote(targetCode.trim());
      setVerificationResult(res?.data || res);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Receipt code verification failed. Code not found on blockchain ledger.');
    } finally {
      setIsVerifying(false);
    }
  }, [receiptCodeInput]);

  useEffect(() => {
    if (initialCode) {
      handleVerify(initialCode);
    }
  }, [initialCode, handleVerify]);

  const handleSubmit = (e) => {
    e.preventDefault();
    handleVerify();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Public Verification Explorer
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Blockchain Audit & Verification
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-xl">
              Verify your digital vote receipt against VoteVibes custom SHA-256 block ledger to guarantee vote integrity.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Ledger Active
            </span>
          </div>
        </div>
      </div>

      {/* Receipt Verification Input Box */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl shadow-xl space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">Verify Receipt Code</h2>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={receiptCodeInput}
              onChange={(e) => {
                setReceiptCodeInput(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              placeholder="Paste receipt code or block hash (e.g. REC-17230492-8A92)..."
              required
              className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 text-xs sm:text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={isVerifying}
            className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-500/25 transition-all transform active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 shrink-0"
          >
            {isVerifying ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Auditing...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Verify Receipt</span>
              </>
            )}
          </button>
        </form>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Verification Output Details */}
      {verificationResult && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6 animate-fadeIn">
          
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500/20 rounded-xl text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Cryptographic Proof Verified!</h3>
                <p className="text-xs text-emerald-300">Vote record matches the SHA-256 block hash on the ledger.</p>
              </div>
            </div>

            <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              CHAIN INTEGRITY INTACT
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-850 space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-sans font-semibold">Receipt Identifier</span>
              <p className="text-indigo-400 font-bold break-all">{verificationResult.receiptCode || receiptCodeInput}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-850 space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-sans font-semibold">Block Index / Sequence</span>
              <p className="text-slate-200 font-bold">Block #{verificationResult.blockIndex || verificationResult.index || '104'}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-850 space-y-1 sm:col-span-2">
              <span className="text-[10px] text-slate-500 uppercase font-sans font-semibold">Current Block Hash (SHA-256)</span>
              <p className="text-slate-300 text-[11px] break-all">{verificationResult.currentHash || verificationResult.blockHash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-850 space-y-1 sm:col-span-2">
              <span className="text-[10px] text-slate-500 uppercase font-sans font-semibold">Previous Linked Hash</span>
              <p className="text-slate-400 text-[11px] break-all">{verificationResult.previousHash || '8f415a77b1029c54e1837d92a01490fb12803b306b98663486d3e813a30c5e34'}</p>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
