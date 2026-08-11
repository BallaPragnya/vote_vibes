import Blockchain from './blockchain.js';
import { recordVoteOnBlockchain } from './votingIntegration.js';
import { batchVerifyBlocks, clearHashCache } from './cryptoOptimizer.js';

/**
 * Blockchain Stress Tester & Performance Benchmarking Engine (Phase 7)
 */

/**
 * Executes a simulated high-throughput stress test on the blockchain engine.
 * 
 * @param {Object} [options]
 * @param {number} [options.blockCount=100] - Total blocks to generate
 * @param {string} [options.electionId='elec_stress_test_2026'] - Target election ID
 * @param {boolean} [options.clearCache=true] - Whether to clear hash cache before testing
 * @returns {Object} Comprehensive benchmark report
 */
export function runBlockchainStressTest({
  blockCount = 100,
  electionId = 'elec_stress_test_2026',
  clearCache = true,
} = {}) {
  if (clearCache) {
    clearHashCache();
  }

  const stressChain = new Blockchain();
  const startTime = process.hrtime.bigint();
  const generatedReceipts = [];

  for (let i = 1; i <= blockCount; i++) {
    const userId = `usr_stress_voter_${i}_${Math.random().toString(36).substring(2, 7)}`;
    const candidateId = `cand_candidate_${(i % 5) + 1}`;

    const { voteReceipt } = recordVoteOnBlockchain({
      userId,
      electionId,
      candidateId,
      blockchain: stressChain,
    });

    generatedReceipts.push(voteReceipt);
  }

  const endTime = process.hrtime.bigint();
  const durationNs = Number(endTime - startTime);
  const durationMs = durationNs / 1_000_000;
  const tps = Math.round((blockCount / (durationMs / 1000)) * 100) / 100;
  const avgBlockLatencyMs = Math.round((durationMs / blockCount) * 1000) / 1000;

  // Post-stress chain verification
  const auditResult = batchVerifyBlocks(stressChain.chain);
  const memoryUsageMb = Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100;

  return {
    success: auditResult.isChainValid,
    totalBlocksGenerated: blockCount,
    totalLedgerBlocks: stressChain.chain.length,
    totalDurationMs: Math.round(durationMs * 100) / 100,
    tps,
    avgBlockLatencyMs,
    isChainValid: auditResult.isChainValid,
    verifiedCount: auditResult.verifiedCount,
    memoryUsageMb,
    sampleReceipt: generatedReceipts[0] || null,
  };
}

export default {
  runBlockchainStressTest,
};
