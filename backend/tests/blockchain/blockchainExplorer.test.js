import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { blockchainExplorerService, BlockchainExplorerService } from '../../src/services/blockchainExplorer.service.js';
import { recordVoteOnBlockchain } from '../../src/blockchain/votingIntegration.js';
import Blockchain from '../../src/blockchain/blockchain.js';

describe('Blockchain Explorer & Dynamic Integrity Meter Tests (Phase 6)', () => {

  it('Requirement 1: Should retrieve ledger overview, metrics, and chain integrity status', () => {
    const overview = blockchainExplorerService.getLedgerOverview();

    assert.ok(overview.integrity);
    assert.equal(overview.integrity.isChainValid, true);
    assert.equal(overview.integrity.integrityScore, 100);
    assert.equal(overview.integrity.status, 'INTACT');
    assert.ok(overview.metrics);
    assert.ok(Array.isArray(overview.blocks));
  });

  it('Requirement 1: Should filter blocks by action type and search query', () => {
    const sampleVote = {
      userId: 'usr_audit_voter_123',
      electionId: 'elec_audit_2026',
      candidateId: 'cand_audit_c1',
    };

    recordVoteOnBlockchain({
      ...sampleVote,
      blockchain: blockchainExplorerService.store.getChain(),
    });

    const voteBlocks = blockchainExplorerService.filterBlocks({ action: 'VOTE_CAST' });
    assert.ok(voteBlocks.length > 0);
    assert.ok(voteBlocks.every((b) => b.action === 'VOTE_CAST'));

    const searchBlocks = blockchainExplorerService.filterBlocks({ search: 'elec_audit_2026' });
    assert.ok(searchBlocks.length > 0);
  });

  it('Requirement 1: Should perform full chain audit and return 100% integrity score for valid chain', () => {
    const auditReport = blockchainExplorerService.performFullChainAudit();

    assert.equal(auditReport.isChainValid, true);
    assert.equal(auditReport.integrityScore, 100);
    assert.equal(auditReport.tamperedBlocksCount, 0);
    assert.ok(auditReport.verifiedBlocksCount > 0);
  });

  it('Requirement 1: Should DETECT TAMPERING and update integrity score when block data is modified', () => {
    const isolatedChain = new Blockchain();
    const isolatedStore = { getChain: () => isolatedChain };
    const isolatedExplorerService = new BlockchainExplorerService(isolatedStore);

    // Record a new block
    const { block } = recordVoteOnBlockchain({
      userId: 'usr_tamper_target',
      electionId: 'elec_tamper_test',
      candidateId: 'cand_tamper_target',
      blockchain: isolatedChain,
    });

    // Tamper with data payload inside the block
    isolatedChain.chain[block.index].data.secureCandidateId = 'hacked_candidate_hash_override';

    const auditReport = isolatedExplorerService.performFullChainAudit();

    assert.equal(auditReport.isChainValid, false);
    assert.ok(auditReport.tamperedBlocksCount > 0);
    assert.ok(auditReport.integrityScore < 100);
  });

  it('Requirement 2: Should verify a public vote receipt via verifyPublicReceipt', () => {
    const chain = blockchainExplorerService.store.getChain();
    const { voteReceipt } = recordVoteOnBlockchain({
      userId: 'usr_public_verifier',
      electionId: 'elec_public_2026',
      candidateId: 'cand_public_candidate',
      blockchain: chain,
    });

    const verificationResult = blockchainExplorerService.verifyPublicReceipt(voteReceipt);

    assert.equal(verificationResult.isValid, true);
    assert.ok(verificationResult.message.includes('successfully verified'));
  });

});
