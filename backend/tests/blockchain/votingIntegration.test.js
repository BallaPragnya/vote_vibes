import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  generateReceiptId,
  recordVoteOnBlockchain,
  generateCryptographicVoteReceipt,
} from '../../src/blockchain/votingIntegration.js';
import Blockchain from '../../src/blockchain/blockchain.js';

describe('Voting Engine Blockchain Integration Tests (Phase 5)', () => {

  const sampleVote = {
    userId: 'usr_student_8888',
    electionId: 'elec_presidential_2026',
    candidateId: 'cand_candidate_9999',
  };

  it('Requirement 1: Should format human-readable cryptographic receipt ID', () => {
    const receiptId = generateReceiptId();

    assert.equal(typeof receiptId, 'string');
    assert.ok(receiptId.startsWith('VR-'));
    assert.ok(receiptId.includes('-2026-'));
  });

  it('Requirement 1 & 2: Should record a vote on the blockchain and return a cryptographic receipt', () => {
    const blockchain = new Blockchain();
    const result = recordVoteOnBlockchain({
      ...sampleVote,
      blockchain,
    });

    assert.ok(result.block);
    assert.ok(result.voteReceipt);
    assert.equal(blockchain.chain.length, 2, 'Chain should contain Genesis + Vote block');
    assert.equal(blockchain.isChainValid(), true, 'Chain validation must pass');

    // Verify block data contains NO raw student PII
    assert.equal(result.block.data.action, 'VOTE_CAST');
    assert.equal(typeof result.block.data.voterHash, 'string');
    assert.equal(typeof result.block.data.secureCandidateId, 'string');
    assert.equal('userId' in result.block.data, false, 'Block MUST NOT contain raw userId');
    assert.equal('candidateId' in result.block.data, false, 'Block MUST NOT contain raw candidateId');
  });

  it('Requirement 2: Should generate a valid cryptographic vote receipt with digital signature', () => {
    const blockchain = new Blockchain();
    const { block, voteReceipt } = recordVoteOnBlockchain({
      ...sampleVote,
      blockchain,
    });

    assert.ok(voteReceipt.receiptId.startsWith('VR-'));
    assert.equal(voteReceipt.blockIndex, 1);
    assert.equal(voteReceipt.blockHash, block.hash);
    assert.equal(voteReceipt.previousHash, block.previousHash);
    assert.equal(typeof voteReceipt.signature, 'string');
    assert.equal(voteReceipt.signature.length, 64, 'HMAC SHA-256 signature must be 64 hex chars');
  });

});
