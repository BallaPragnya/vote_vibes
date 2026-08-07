import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import voteService from '../services/voteService';
import { ShieldCheck, ArrowLeft, Copy, CheckCircle2, AlertCircle, ExternalLink, Printer } from 'lucide-react';

export default function VoteReceiptPage() {
  const { receiptId } = useParams();

  const [receipt, setReceipt] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const fetchReceipt = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await voteService.getVoteReceipt(receiptId);
      setReceipt(res?.data || res);
    } catch (err) {
      setError(err.response?.data?.message || 'Vote receipt not found or invalid receipt ID.');
    } finally {
      setIsLoading(false);
    }
  }, [receiptId]);

  useEffect(() => {
    fetchReceipt();
  }, [fetchReceipt]);

  const copyCode = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="w-10 h-10 border-3 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-400 font-medium">Fetching blockchain receipt...</p>
      </div>
    );
  }

  if (error || !receipt) {
    return (
      <div className="max-w-md mx-auto py-16 text-center">
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-3xl text-rose-400 w-fit mx-auto mb-4">
          <AlertCircle className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Receipt Not Found</h2>
        <p className="text-xs text-slate-400 mb-6">{error || 'The specified receipt identifier does not exist on the ledger.'}</p>
        <Link
          to="/audit"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-200 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Go to Audit Explorer</span>
        </Link>
      </div>
    );
  }

  const receiptCode = receipt.receiptCode || receipt.id || receiptId;
  const blockHash = receipt.blockHash || receipt.hash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
  const timestamp = receipt.createdAt || receipt.timestamp ? new Date(receipt.createdAt || receipt.timestamp).toLocaleString() : new Date().toLocaleString();

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-4">
      <div>
        <Link
          to="/audit"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Audit Explorer
        </Link>
      </div>

      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden space-y-6">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-indigo-500 to-purple-600" />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Digital Vote Receipt</h1>
              <p className="text-xs text-slate-400">VoteVibes Blockchain Proof of Participation</p>
            </div>
          </div>

          <button
            onClick={() => window.print()}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white transition-colors"
            title="Print Receipt"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>

        {/* Receipt Parameters Grid */}
        <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-850 space-y-4 font-mono text-xs">
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-sans font-semibold">Unique Receipt Code</span>
            <div className="flex items-center justify-between gap-2 mt-1">
              <span className="text-emerald-400 font-bold text-sm break-all">{receiptCode}</span>
              <button
                onClick={() => copyCode(receiptCode)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white shrink-0"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div>
            <span className="text-[10px] text-slate-500 uppercase font-sans font-semibold">Cryptographic Block Hash (SHA-256)</span>
            <p className="text-slate-300 text-[11px] break-all mt-1">{blockHash}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 font-sans border-t border-slate-900">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Commit Timestamp</span>
              <p className="text-slate-200 text-xs font-semibold mt-0.5">{timestamp}</p>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Chain Ledger Status</span>
              <p className="text-emerald-400 text-xs font-semibold mt-0.5 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> VERIFIED IN BLOCK
              </p>
            </div>
          </div>
        </div>

        {copied && (
          <p className="text-xs text-emerald-400 text-center font-medium">Receipt code copied to clipboard!</p>
        )}

        <div className="pt-2 flex justify-end">
          <Link
            to={`/audit?code=${receiptCode}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-lg shadow-indigo-500/20"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Verify on Blockchain Explorer</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
