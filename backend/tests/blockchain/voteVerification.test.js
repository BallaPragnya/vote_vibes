import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { recordVoteOnBlockchain } from '../../src/blockchain/votingIntegration.js';
import { verifyVoteReceipt, verifyVoterParticipation } from '../../src/blockchain/voteVerification.js';
import Blockchain from '../../src/blockchain/blockchain.js';

describe('Vote Verification Engine Tests (Phase 5)', () => {

  const sampleVote = {
    userId: 'usr_student_7777',
    electionId: 'elec_department_2026',
    candidateId: 'cand_candidate_3333',
  };

  it('Requirement 3: Should verify a valid cryptographic vote receipt against the blockchain ledger', () => {
    const blockchain = new Blockchain();
    const { voteReceipt } = recordVoteOnBlockchain({
      ...sampleVote,
      blockchain,
    });

    const verificationResult = verifyVoteReceipt(voteReceipt, blockchain);

    assert.equal(verificationResult.isValid, true);
    assert.ok(verificationResult.message.includes('successfully verified'));
    assert.equal(verificationResult.blockIndex, 1);
  });

  it('Requirement 3: Should DETECT TAMPERING when receipt signature is modified', () => {
    const blockchain = new Blockchain();
    const { voteReceipt } = recordVoteOnBlockchain({
      ...sampleVote,
      blockchain,
    });

    // Tamper attempt: Modify signature
    const tamperedReceipt = {
      ...voteReceipt,
      signature: 'f'.repeat(64),
    };

    const verificationResult = verifyVoteReceipt(tamperedReceipt, blockchain);

    assert.equal(verificationResult.isValid, false);
    assert.ok(verificationResult.reason.includes('signature mismatch'));
  });

  it('Requirement 3: Should DETECT TAMPERING when vote block data on chain is modified', () => {
    const blockchain = new Blockchain();
    const { block, voteReceipt } = recordVoteOnBlockchain({
      ...sampleVote,
      blockchain,
    });

    // Tamper attempt: Modify candidate selection inside block on chain
    blockchain.chain[1].data.secureCandidateId = 'hacked_candidate_hash';

    const verificationResult = verifyVoteReceipt(voteReceipt, blockchain);

    assert.equal(verificationResult.isValid, false);
    assert.ok(verificationResult.reason.includes('calculation failure') || verificationResult.reason.includes('corrupted'));
  });

  it('Requirement 3: Should verify voter participation without disclosing candidate selection', () => {
    const blockchain = new Blockchain();
    recordVoteOnBlockchain({
      ...sampleVote,
      blockchain,
    });

    const participation = verifyVoterParticipation(sampleVote.userId, sampleVote.electionId, blockchain);
    const nonVoterParticipation = verifyVoterParticipation('usr_did_not_vote', sampleVote.electionId, blockchain);

    assert.equal(participation.hasVoted, true);
    assert.equal(participation.blockIndex, 1);
    assert.equal(nonVoterParticipation.hasVoted, false);
  });

});
