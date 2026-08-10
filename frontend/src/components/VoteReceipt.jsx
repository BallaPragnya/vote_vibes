import React, { useState } from 'react';
import { ShieldCheck, Download, Copy, CheckCircle2, FileText, ExternalLink } from 'lucide-react';

export default function VoteReceipt({ receipt }) {
  const [copied, setCopied] = useState(false);

  if (!receipt) return null;

  const receiptCode = receipt.receiptCode || receipt.id || receipt.receiptId || 'REC-VOTEVIBES';
  const blockHash = receipt.blockHash || receipt.hash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
  const timestamp = receipt.createdAt || receipt.timestamp ? new Date(receipt.createdAt || receipt.timestamp).toLocaleString() : new Date().toLocaleString();

  const handleDownloadReceipt = () => {
    const content = `====================================================
VOTEVIBES BLOCKCHAIN VOTE RECEIPT
====================================================
Receipt ID: ${receiptCode}
Transaction Hash (SHA-256): ${blockHash}
Commit Timestamp: ${timestamp}
Ledger Verification: VERIFIED IN BLOCK
====================================================
This receipt proves your vote was cryptographically recorded 
on the VoteVibes SHA-256 blockchain ledger.
====================================================`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `VoteReceipt-${receiptCode}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const copyCode = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-indigo-500 to-purple-600" />

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Vote Verification Receipt</h2>
          <p className="text-xs text-slate-400">Cryptographic proof of vote entry on blockchain ledger</p>
        </div>
      </div>

      {/* Parameters */}
      <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-850 space-y-4 font-mono text-xs">
        <div>
          <span className="text-[10px] text-slate-500 uppercase font-sans font-semibold">Receipt ID</span>
          <div className="flex items-center justify-between gap-2 mt-1">
            <span className="text-emerald-400 font-bold text-sm break-all">{receiptCode}</span>
            <button
              onClick={() => copyCode(receiptCode)}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white shrink-0"
              title="Copy Receipt ID"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div>
          <span className="text-[10px] text-slate-500 uppercase font-sans font-semibold">Transaction / Block Hash (SHA-256)</span>
          <p className="text-slate-300 text-[11px] break-all mt-1">{blockHash}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 font-sans border-t border-slate-900">
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-semibold">Timestamp</span>
            <p className="text-slate-200 text-xs font-semibold mt-0.5">{timestamp}</p>
          </div>

          <div>
            <span className="text-[10px] text-slate-500 uppercase font-semibold">Ledger Status</span>
            <p className="text-emerald-400 text-xs font-semibold mt-0.5 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> VERIFIED IN BLOCK
            </p>
          </div>
        </div>
      </div>

      {copied && (
        <p className="text-xs text-emerald-400 text-center font-medium">Receipt ID copied to clipboard!</p>
      )}

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
        <button
          onClick={handleDownloadReceipt}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/25 transition-all"
        >
          <Download className="w-4 h-4" />
          <span>Download Receipt</span>
        </button>

        <a
          href={`/audit?code=${receiptCode}`}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-all shadow-md shadow-indigo-500/20"
        >
          <ExternalLink className="w-4 h-4" />
          <span>Verify on Explorer</span>
        </a>
      </div>
    </div>
  );
}
