import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  generateVoterHash,
  createAnonymizedVotePayload,
  verifyVoterHash,
  validateAnonymizedBlockData,
} from '../../src/blockchain/voterIdentity.js';
import Block from '../../src/blockchain/block.js';
import Blockchain from '../../src/blockchain/blockchain.js';

describe('Voter Identity Abstraction Layer Tests (Phase 2)', () => {

  it('Should generate a 64-character hex anonymous voter hash', () => {
    const userId = 'usr_student_12345';
    const electionId = 'elec_president_2026';
    const hash = generateVoterHash(userId, electionId);

    assert.equal(typeof hash, 'string');
    assert.equal(hash.length, 64, 'SHA-256 HMAC should yield 64 hex characters');
  });

  it('Should produce deterministic voter hashes for the same voter in the same election', () => {
    const userId = 'usr_student_12345';
    const electionId = 'elec_president_2026';

    const hash1 = generateVoterHash(userId, electionId);
    const hash2 = generateVoterHash(userId, electionId);

    assert.equal(hash1, hash2, 'Identical voter + election must yield identical voterHash for double-voting checks');
  });

  it('Should produce different voter hashes across different elections (Unlinkability)', () => {
    const userId = 'usr_student_12345';

    const hashElectionA = generateVoterHash(userId, 'elec_president_2026');
    const hashElectionB = generateVoterHash(userId, 'elec_treasurer_2026');

    assert.notEqual(hashElectionA, hashElectionB, 'Voter hashes across different elections must be unlinkable');
  });

  it('Should verify a voter hash correctly using verifyVoterHash', () => {
    const userId = 'usr_student_999';
    const electionId = 'elec_secretary_2026';
    const voterHash = generateVoterHash(userId, electionId);

    const isMatch = verifyVoterHash(userId, electionId, voterHash);
    const isFalseMatch = verifyVoterHash('usr_imposter', electionId, voterHash);

    assert.equal(isMatch, true);
    assert.equal(isFalseMatch, false);
  });

  it('Should create an anonymized vote payload free of PII', () => {
    const payload = createAnonymizedVotePayload({
      userId: 'usr_alice_555',
      electionId: 'elec_dept_2026',
      candidateId: 'cand_bob_777',
    });

    assert.equal(typeof payload.voterHash, 'string');
    assert.equal(payload.electionId, 'elec_dept_2026');
    assert.equal(payload.candidateId, 'cand_bob_777');
    assert.ok(payload.nonce);
    assert.ok(payload.timestamp);

    // Verify absence of PII
    assert.equal('userId' in payload, false);
    assert.equal('email' in payload, false);
    assert.equal('name' in payload, false);
  });

  it('Should validate anonymized block data structure and reject raw student identifiers', () => {
    const validAnonymizedData = {
      voterHash: 'a'.repeat(64),
      electionId: 'elec_1',
      candidateId: 'cand_1',
    };

    const invalidPiiData = {
      voterHash: 'a'.repeat(64),
      electionId: 'elec_1',
      candidateId: 'cand_1',
      userId: 'usr_leaked_id',
    };

    assert.equal(validateAnonymizedBlockData(validAnonymizedData), true);
    assert.equal(validateAnonymizedBlockData(invalidPiiData), false);
  });

  it('Should integrate seamlessly into Block and Blockchain', () => {
    const voteChain = new Blockchain();
    const payload = createAnonymizedVotePayload({
      userId: 'usr_student_789',
      electionId: 'elec_cs_2026',
      candidateId: 'cand_charlie_01',
    });

    const voteBlock = new Block(1, payload.timestamp, payload);
    voteChain.addBlock(voteBlock);

    assert.equal(voteChain.isChainValid(), true);
    assert.equal(voteChain.chain[1].data.candidateId, 'cand_charlie_01');
    assert.equal('userId' in voteChain.chain[1].data, false, 'Blockchain block data MUST NOT contain userId');
  });

});
