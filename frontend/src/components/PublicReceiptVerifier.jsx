import React, { useState } from 'react';
import axios from 'axios';

/**
 * Public Vote Receipt Verification Tool Component
 * Allows individual voters to enter or paste their cryptographic receipt to verify their vote on the blockchain ledger.
 */
export default function PublicReceiptVerifier() {
  const [receiptInput, setReceiptInput] = useState('');
  const [receiptId, setReceiptId] = useState('');
  const [voterHash, setVoterHash] = useState('');
  const [electionId, setElectionId] = useState('');
  const [blockIndex, setBlockIndex] = useState('');
  const [blockHash, setBlockHash] = useState('');
  const [signature, setSignature] = useState('');

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Helper to parse pasted JSON receipt
  const handleJsonPaste = (text) => {
    try {
      const parsed = JSON.parse(text);
      if (parsed.receiptId) setReceiptId(parsed.receiptId);
      if (parsed.voterHash) setVoterHash(parsed.voterHash);
      if (parsed.electionId) setElectionId(parsed.electionId);
      if (parsed.blockIndex !== undefined) setBlockIndex(String(parsed.blockIndex));
      if (parsed.blockHash) setBlockHash(parsed.blockHash);
      if (parsed.signature) setSignature(parsed.signature);
    } catch (e) {
      // Not valid JSON, ignore paste auto-fill
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError(null);

    const payload = {
      receiptId: receiptId.trim(),
      voterHash: voterHash.trim(),
      electionId: electionId.trim(),
      blockIndex: Number(blockIndex),
      blockHash: blockHash.trim(),
      signature: signature.trim(),
    };

    try {
      const response = await axios.post('/api/blockchain/verify-receipt', payload);
      setResult(response.data.data);
    } catch (err) {
      const responseData = err.response?.data;
      if (responseData && responseData.data) {
        setResult(responseData.data);
      } else {
        setError(responseData?.message || err.message || 'Verification failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl mb-8">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-white">Public Vote Receipt Verification Tool</h3>
        <p className="text-xs text-slate-400 mt-1">
          Verify your cryptographic vote receipt against the immutable blockchain ledger to confirm your vote was accurately recorded.
        </p>
      </div>

      {/* Optional JSON Paste Shortcut */}
      <div className="mb-6">
        <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">
          Quick Paste JSON Receipt (Optional)
        </label>
        <textarea
          rows="2"
          placeholder='Paste complete receipt JSON here e.g. {"receiptId": "VR-...", "signature": "..."}'
          value={receiptInput}
          onChange={(e) => {
            setReceiptInput(e.target.value);
            handleJsonPaste(e.target.value);
          }}
          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono text-slate-300 focus:outline-none focus:border-indigo-500"
        />
      </div>

      {/* Manual Input Fields Form */}
      <form onSubmit={handleVerify} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Receipt ID</label>
            <input
              type="text"
              required
              placeholder="e.g. VR-8F3A-2026-X9B1"
              value={receiptId}
              onChange={(e) => setReceiptId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Election ID</label>
            <input
              type="text"
              required
              placeholder="e.g. elec_presidential_2026"
              value={electionId}
              onChange={(e) => setElectionId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Block Index</label>
            <input
              type="number"
              required
              placeholder="e.g. 1"
              value={blockIndex}
              onChange={(e) => setBlockIndex(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Block Hash (SHA-256)</label>
            <input
              type="text"
              required
              placeholder="64-character block hash"
              value={blockHash}
              onChange={(e) => setBlockHash(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Anonymized Voter Hash</label>
          <input
            type="text"
            required
            placeholder="64-character voter hash"
            value={voterHash}
            onChange={(e) => setVoterHash(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Digital Signature</label>
          <input
            type="text"
            required
            placeholder="HMAC SHA-256 digital signature"
            value={signature}
            onChange={(e) => setSignature(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold text-xs rounded-lg transition-all shadow-md disabled:opacity-50"
        >
          {loading ? 'Verifying Blockchain Ledger...' : 'Verify Cryptographic Receipt'}
        </button>
      </form>

      {/* Error Output */}
      {error && (
        <div className="mt-6 p-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
          <strong>Verification Error:</strong> {error}
        </div>
      )}

      {/* Verification Result Outcome Card */}
      {result && (
        <div
          className={`mt-6 p-5 rounded-xl border ${
            result.isValid
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${result.isValid ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
              {result.isValid ? '✓' : '✕'}
            </span>
            <div>
              <h4 className="font-bold text-sm">{result.isValid ? 'VOTE RECEIPT VERIFIED' : 'VERIFICATION FAILED'}</h4>
              <p className="text-xs opacity-90 mt-0.5">{result.message || result.reason}</p>
            </div>
          </div>

          {result.isValid && (
            <div className="mt-4 pt-4 border-t border-emerald-500/20 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              <div>
                <span className="opacity-60 block">Block Index:</span>
                <span className="font-bold">#{result.blockIndex}</span>
              </div>
              <div>
                <span className="opacity-60 block">Ledger Timestamp:</span>
                <span>{new Date(result.timestamp).toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
