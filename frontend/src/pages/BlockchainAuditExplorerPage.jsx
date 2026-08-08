import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import ChainIntegrityMeter from '../components/ChainIntegrityMeter';
import BlockchainExplorer from '../components/BlockchainExplorer';
import PublicReceiptVerifier from '../components/PublicReceiptVerifier';
import { Sparkles, ShieldCheck } from 'lucide-react';

export default function BlockchainAuditExplorerPage() {
  const [ledgerOverview, setLedgerOverview] = useState(null);
  const [integrityData, setIntegrityData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLedgerData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [overviewRes, integrityRes] = await Promise.all([
        axios.get('/api/blockchain'),
        axios.get('/api/blockchain/integrity'),
      ]);

      setLedgerOverview(overviewRes.data.data);
      setIntegrityData(integrityRes.data.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch blockchain ledger state.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLedgerData();
  }, [fetchLedgerData]);

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-4">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Public Verification & Blockchain Ledger
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Blockchain Explorer & Integrity Meter
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-xl">
              Inspect VoteVibes SHA-256 block ledger, verify live chain integrity, and audit cryptographic vote receipts.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              SHA-256 Ledger Active
            </span>
          </div>
        </div>
      </div>

      {/* Dynamic Chain Integrity Meter */}
      <ChainIntegrityMeter
        integrity={integrityData || ledgerOverview?.integrity}
        metrics={ledgerOverview?.metrics}
        onRefresh={fetchLedgerData}
      />

      {/* Public Vote Receipt Verification Tool */}
      <PublicReceiptVerifier />

      {/* Interactive Blockchain Explorer */}
      {loading ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-400 text-sm">
          Loading blockchain ledger blocks...
        </div>
      ) : error ? (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl p-6 text-sm">
          <strong>Error loading blockchain:</strong> {error}
        </div>
      ) : (
        <BlockchainExplorer blocks={ledgerOverview?.blocks || []} />
      )}
    </div>
  );
}
