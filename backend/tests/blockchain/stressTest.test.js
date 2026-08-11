import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { runBlockchainStressTest } from '../../src/blockchain/stressTester.js';
import { simulateTamperAttempt } from '../../src/blockchain/tamperSimulator.js';
import { fastCalculateHash, batchVerifyBlocks } from '../../src/blockchain/cryptoOptimizer.js';
import { exportLedgerAsJson, exportLedgerAsCsv, generateCryptographicProofPackage } from '../../src/blockchain/ledgerExporter.js';
import Blockchain from '../../src/blockchain/blockchain.js';
import { recordVoteOnBlockchain } from '../../src/blockchain/votingIntegration.js';

describe('Phase 7 Stress Testing, Tamper Simulation & Ledger Export Tests', () => {

  it('Requirement 1: Should execute high-throughput blockchain stress test (100 blocks) and maintain 100% chain integrity', () => {
    const report = runBlockchainStressTest({ blockCount: 100, electionId: 'elec_stress_test_phase7' });

    assert.equal(report.success, true);
    assert.equal(report.totalBlocksGenerated, 100);
    assert.equal(report.isChainValid, true);
    assert.ok(report.tps > 0);
    assert.ok(report.avgBlockLatencyMs >= 0);
    assert.ok(report.memoryUsageMb > 0);
  });

  it('Requirement 1: Should DETECT TAMPERING when payload data is mutated in simulateTamperAttempt', () => {
    const chain = new Blockchain();
    for (let i = 1; i <= 3; i++) {
      recordVoteOnBlockchain({
        userId: `usr_voter_${i}`,
        electionId: 'elec_tamper_demo',
        candidateId: `cand_c${i}`,
        blockchain: chain,
      });
    }

    const tamperResult = simulateTamperAttempt(chain, 1, 'DATA_MUTATION');

    assert.equal(tamperResult.detected, true);
    assert.equal(tamperResult.auditReport.isChainValid, false);
    assert.equal(tamperResult.tamperType, 'DATA_MUTATION');
    assert.ok(tamperResult.auditReport.message.includes('ALERT: Tamper attack detected'));
  });

  it('Requirement 2: Should perform fast batch block verification and caching via cryptoOptimizer', () => {
    const dataObj = { test: 'payload_fast_hash' };
    const hash1 = fastCalculateHash(dataObj);
    const hash2 = fastCalculateHash(dataObj);

    assert.equal(hash1, hash2);
    assert.equal(hash1.length, 64);

    const chain = new Blockchain();
    recordVoteOnBlockchain({ userId: 'u1', electionId: 'e1', candidateId: 'c1', blockchain: chain });
    recordVoteOnBlockchain({ userId: 'u2', electionId: 'e1', candidateId: 'c2', blockchain: chain });

    const batchAudit = batchVerifyBlocks(chain.chain);
    assert.equal(batchAudit.isChainValid, true);
    assert.equal(batchAudit.corruptedIndices.length, 0);
  });

  it('Requirement 2: Should export blockchain ledger as JSON with export signature metadata', () => {
    const chain = new Blockchain();
    recordVoteOnBlockchain({ userId: 'u1', electionId: 'e1', candidateId: 'c1', blockchain: chain });

    const jsonExport = exportLedgerAsJson(chain);

    assert.ok(jsonExport.metadata);
    assert.equal(jsonExport.metadata.system, 'VoteVibes Custom Blockchain Ledger');
    assert.ok(jsonExport.metadata.exportSignature);
    assert.equal(jsonExport.blocks.length, chain.chain.length);
  });

  it('Requirement 2: Should export blockchain ledger as CSV audit log', () => {
    const chain = new Blockchain();
    recordVoteOnBlockchain({ userId: 'u1', electionId: 'e1', candidateId: 'c1', blockchain: chain });

    const csvStr = exportLedgerAsCsv(chain);

    assert.equal(typeof csvStr, 'string');
    assert.ok(csvStr.startsWith('Index,Timestamp,Action,Block Hash,Previous Hash,Payload Summary'));
    assert.ok(csvStr.includes('VOTE_CAST'));
  });

  it('Requirement 2: Should generate offline Cryptographic Proof Package with Merkle root', () => {
    const chain = new Blockchain();
    recordVoteOnBlockchain({ userId: 'u1', electionId: 'elec_proof_2026', candidateId: 'c1', blockchain: chain });

    const proof = generateCryptographicProofPackage(chain, 'elec_proof_2026');

    assert.equal(proof.electionId, 'elec_proof_2026');
    assert.ok(proof.merkleRoot);
    assert.equal(proof.merkleRoot.length, 64);
    assert.equal(proof.isChainValid, true);
    assert.ok(proof.proofBlocks.length >= 2);
  });

});
