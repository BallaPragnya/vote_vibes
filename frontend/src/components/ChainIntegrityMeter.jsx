import React, { useState } from 'react';
import axios from 'axios';

/**
 * Dynamic Chain Integrity Meter & Performance Benchmark Control Component (Phase 7)
 * Renders real-time blockchain integrity status, health meter, metrics, 
 * stress test execution, tamper simulation demo, and ledger export buttons.
 */
export default function ChainIntegrityMeter({ integrity, metrics, onRefresh }) {
  const isChainValid = integrity?.isChainValid ?? true;
  const score = integrity?.integrityScore ?? 100;
  const statusMessage = integrity?.message || 'All block hashes and link sequences verified successfully.';

  const [stressLoading, setStressLoading] = useState(false);
  const [stressResult, setStressResult] = useState(null);

  const [tamperLoading, setTamperLoading] = useState(false);
  const [tamperResult, setTamperResult] = useState(null);

  const handleRunStressTest = async () => {
    setStressLoading(true);
    setStressResult(null);
    try {
      const res = await axios.post('/api/blockchain/stress-test', { blockCount: 100 });
      setStressResult(res.data.data);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Stress test failed:', err);
    } finally {
      setStressLoading(false);
    }
  };

  const handleSimulateTamper = async () => {
    setTamperLoading(true);
    setTamperResult(null);
    try {
      const res = await axios.post('/api/blockchain/simulate-tamper', { targetBlockIndex: 1, tamperType: 'DATA_MUTATION' });
      setTamperResult(res.data.data);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Tamper simulation failed:', err);
    } finally {
      setTamperLoading(false);
    }
  };

  const handleExportJson = () => {
    window.open('/api/blockchain/export/json', '_blank');
  };

  const handleExportCsv = () => {
    window.open('/api/blockchain/export/csv', '_blank');
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl mb-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-white">Dynamic Chain Integrity Meter</h2>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                isChainValid
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse'
              }`}
            >
              <span className={`w-2 h-2 rounded-full mr-2 ${isChainValid ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
              {isChainValid ? 'CHAIN INTACT' : 'TAMPERING DETECTED'}
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">{statusMessage}</p>
        </div>

        {/* Action Controls & Export Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportJson}
            className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-indigo-300 rounded-lg transition-colors border border-slate-700"
            title="Download full ledger JSON"
          >
            Export JSON
          </button>
          <button
            onClick={handleExportCsv}
            className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-sky-300 rounded-lg transition-colors border border-slate-700"
            title="Download audit CSV"
          >
            Export CSV
          </button>
          <button
            onClick={handleRunStressTest}
            disabled={stressLoading}
            className="px-3 py-1.5 text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors shadow"
          >
            {stressLoading ? 'Running Test...' : '⚡ Stress Test'}
          </button>
          <button
            onClick={handleSimulateTamper}
            disabled={tamperLoading}
            className="px-3 py-1.5 text-xs font-medium bg-rose-600 hover:bg-rose-500 text-white rounded-lg transition-colors shadow"
          >
            {tamperLoading ? 'Simulating...' : '🚨 Simulate Tamper'}
          </button>
        </div>
      </div>

      {/* Health Score Meter Bar */}
      <div className="mt-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Cryptographic Integrity Score</span>
          <span className={`text-lg font-extrabold ${isChainValid ? 'text-emerald-400' : 'text-rose-400'}`}>{score}%</span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden p-0.5 border border-slate-700/50">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              isChainValid ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-gradient-to-r from-rose-600 to-red-400'
            }`}
            style={{ width: `${score}%` }}
          ></div>
        </div>
      </div>

      {/* Stress Test Results Banner */}
      {stressResult && (
        <div className="mt-4 p-4 rounded-lg bg-indigo-950/40 border border-indigo-500/30 text-indigo-200 text-xs font-mono">
          <div className="flex justify-between items-center font-bold mb-2 text-indigo-300">
            <span>⚡ STRESS TEST BENCHMARK COMPLETE</span>
            <span>{stressResult.tps} TPS</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px]">
            <div>Blocks: {stressResult.totalBlocksGenerated}</div>
            <div>Duration: {stressResult.totalDurationMs} ms</div>
            <div>Avg Latency: {stressResult.avgBlockLatencyMs} ms</div>
            <div>Heap Used: {stressResult.memoryUsageMb} MB</div>
          </div>
        </div>
      )}

      {/* Tamper Simulation Results Banner */}
      {tamperResult && (
        <div className="mt-4 p-4 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-200 text-xs font-mono">
          <div className="flex justify-between items-center font-bold mb-2 text-rose-300">
            <span>🚨 TAMPER DETECTION DEMO OUTCOME</span>
            <span>{tamperResult.detected ? 'TAMPER DETECTED ✅' : 'PASSED'}</span>
          </div>
          <p className="mb-2">{tamperResult.tamperDescription}</p>
          <div className="space-y-1 text-[11px] bg-slate-950 p-2 rounded border border-slate-800">
            <div className="text-slate-400">Original Hash: <span className="text-emerald-400">{tamperResult.originalState?.hash}</span></div>
            <div className="text-slate-400">Tampered Payload: <span className="text-rose-400">{tamperResult.tamperedState?.data}</span></div>
          </div>
        </div>
      )}

      {/* Ledger Metrics Dashboard */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800/60">
          <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800">
            <span className="text-xs font-medium text-slate-400 block">Total Ledger Blocks</span>
            <span className="text-xl font-bold text-slate-100 mt-1 block">{metrics.totalBlocks || 0}</span>
          </div>

          <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800">
            <span className="text-xs font-medium text-slate-400 block">Votes Recorded</span>
            <span className="text-xl font-bold text-indigo-400 mt-1 block">{metrics.totalVotesRecorded || 0}</span>
          </div>

          <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800">
            <span className="text-xs font-medium text-slate-400 block">Elections Registered</span>
            <span className="text-xl font-bold text-sky-400 mt-1 block">{metrics.totalElectionsRecorded || 0}</span>
          </div>

          <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800">
            <span className="text-xs font-medium text-slate-400 block">Candidates Verified</span>
            <span className="text-xl font-bold text-amber-400 mt-1 block">{metrics.totalCandidatesRecorded || 0}</span>
          </div>
        </div>
      )}
    </div>
  );
}
