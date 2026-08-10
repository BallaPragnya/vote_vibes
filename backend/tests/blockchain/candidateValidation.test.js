import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  hashCandidateId,
  computeCandidateIntegrityHash,
  validateCandidateSecurity,
  verifyCandidateIntegrity,
  createCandidateRegistrationBlockData,
} from '../../src/blockchain/candidateValidation.js';
import Block from '../../src/blockchain/block.js';
import Blockchain from '../../src/blockchain/blockchain.js';

describe('Candidate Security Validation & ID Hashing Tests (Phase 4)', () => {

  const sampleCandidate = {
    id: 'cand_alice_uuid_101',
    electionId: 'elec_president_2026',
    userId: 'usr_alice_555',
    name: 'Alice Johnson',
    position: 'President',
    manifesto: 'Promoting transparency and digital democracy for all students.',
    status: 'APPROVED',
  };

  it('Requirement 1: Should compute a 64-character SHA-256 HMAC secure candidate identifier', () => {
    const secureId = hashCandidateId(sampleCandidate.id, sampleCandidate.electionId);

    assert.equal(typeof secureId, 'string');
    assert.equal(secureId.length, 64, 'Candidate ID hash must be a 64-character hex string');
  });

  it('Requirement 1: Should compute deterministic candidate ID hashes for the same candidate and election', () => {
    const secureId1 = hashCandidateId(sampleCandidate.id, sampleCandidate.electionId);
    const secureId2 = hashCandidateId(sampleCandidate.id, sampleCandidate.electionId);

    assert.equal(secureId1, secureId2, 'Identical candidate + election must yield identical secureCandidateId');
  });

  it('Requirement 1: Should compute different candidate ID hashes across different elections', () => {
    const secureIdElectionA = hashCandidateId(sampleCandidate.id, 'elec_president_2026');
    const secureIdElectionB = hashCandidateId(sampleCandidate.id, 'elec_treasurer_2026');

    assert.notEqual(secureIdElectionA, secureIdElectionB, 'Candidate ID hashes across elections must differ');
  });

  it('Requirement 2: Should validate candidate security and reject invalid payloads', () => {
    const validResult = validateCandidateSecurity(sampleCandidate);
    assert.equal(validResult.isValid, true);
    assert.equal(validResult.errors.length, 0);

    // Missing electionId
    const missingElectionResult = validateCandidateSecurity({ ...sampleCandidate, electionId: '' });
    assert.equal(missingElectionResult.isValid, false);
    assert.ok(missingElectionResult.errors.some((e) => e.includes('electionId')));
  });

  it('Requirement 2: Should DETECT AND PREVENT DUPLICATE candidate registration in the same election', () => {
    const existingCandidates = [
      { id: 'cand_alice_uuid_101', electionId: 'elec_president_2026', userId: 'usr_alice_555', name: 'Alice Johnson', position: 'President' },
    ];

    // Attempting to register Alice again in the same election
    const duplicateAttempt = {
      id: 'cand_new_uuid_999',
      electionId: 'elec_president_2026',
      userId: 'usr_alice_555', // Duplicate userId!
      name: 'Alice Johnson',
      position: 'President',
    };

    const result = validateCandidateSecurity(duplicateAttempt, existingCandidates);

    assert.equal(result.isValid, false, 'Duplicate candidate registration MUST be rejected');
    assert.ok(result.errors.some((e) => e.includes('Duplicate candidate registration detected')));
  });

  it('Requirement 2: Should DETECT SECURITY VIOLATIONS (Script Injection in candidate manifesto)', () => {
    const xssCandidate = {
      ...sampleCandidate,
      manifesto: 'Vote for me! <script>alert("Hacked")</script>',
    };

    const result = validateCandidateSecurity(xssCandidate);

    assert.equal(result.isValid, false, 'Script injection in candidate manifesto MUST be blocked');
    assert.ok(result.errors.some((e) => e.includes('Security Violation')));
  });

  it('Requirement 3: Should compute a candidate integrity hash fingerprint and detect database tampering', () => {
    const recordedIntegrityHash = computeCandidateIntegrityHash(sampleCandidate);

    // Verify untampered candidate
    const untamperedResult = verifyCandidateIntegrity(sampleCandidate, recordedIntegrityHash);
    assert.equal(untamperedResult.isIntact, true);

    // Tamper attempt in DB: Alter candidate manifesto / bio
    const tamperedCandidate = {
      ...sampleCandidate,
      manifesto: 'Unapproved altered manifesto payload.',
    };

    const tamperedResult = verifyCandidateIntegrity(tamperedCandidate, recordedIntegrityHash);
    assert.equal(tamperedResult.isIntact, false, 'Tampered candidate profile MUST cause verification failure');
  });

  it('Requirement 4: Should integrate candidate registration block into Blockchain', () => {
    const blockData = createCandidateRegistrationBlockData(sampleCandidate);
    const voteChain = new Blockchain();

    const candidateBlock = new Block(1, blockData.timestamp, blockData);
    voteChain.addBlock(candidateBlock);

    assert.equal(voteChain.chain.length, 2);
    assert.equal(voteChain.isChainValid(), true);
    assert.equal(voteChain.chain[1].data.action, 'CANDIDATE_REGISTERED');
    assert.ok(voteChain.chain[1].data.secureCandidateId);
  });

});
