import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  computeElectionIntegrityHash,
  onElectionCreatedHook,
  onElectionStateChangedHook,
  verifyElectionIntegrity,
} from '../../src/blockchain/electionIntegrity.js';
import Blockchain from '../../src/blockchain/blockchain.js';

describe('Election Integrity & Immutability Engine Tests (Phase 3)', () => {

  const sampleElection = {
    id: 'elec_student_council_2026',
    title: 'Student Council President Election 2026',
    description: 'Annual college-wide election for student council president.',
    startDate: '2026-09-01T09:00:00.000Z',
    endDate: '2026-09-02T17:00:00.000Z',
    status: 'UPCOMING',
    isDepartmentRestricted: false,
    departmentIds: [],
    candidates: ['cand_alice_01', 'cand_bob_02'],
  };

  it('Requirement 1: Should compute a deterministic 64-character SHA-256 election integrity hash', () => {
    const hash1 = computeElectionIntegrityHash(sampleElection);
    const hash2 = computeElectionIntegrityHash(sampleElection);

    assert.equal(typeof hash1, 'string');
    assert.equal(hash1.length, 64);
    assert.equal(hash1, hash2, 'Identical election data must produce identical integrity hash');
  });

  it('Requirement 1: Should produce identical hashes regardless of candidate order (Array Sorting)', () => {
    const electionOrderA = { ...sampleElection, candidates: ['cand_bob_02', 'cand_alice_01'] };
    const electionOrderB = { ...sampleElection, candidates: ['cand_alice_01', 'cand_bob_02'] };

    const hashA = computeElectionIntegrityHash(electionOrderA);
    const hashB = computeElectionIntegrityHash(electionOrderB);

    assert.equal(hashA, hashB, 'Hash calculation must be canonical and independent of candidate array insertion order');
  });

  it('Requirement 2: Should record election creation block via onElectionCreatedHook', () => {
    const { block, integrityHash, blockchain } = onElectionCreatedHook(sampleElection);

    assert.ok(blockchain instanceof Blockchain);
    assert.equal(blockchain.chain.length, 2, 'Blockchain should contain Genesis + Election Creation block');

    assert.equal(block.data.action, 'ELECTION_CREATED');
    assert.equal(block.data.electionId, sampleElection.id);
    assert.equal(block.data.integrityHash, integrityHash);
    assert.equal(blockchain.isChainValid(), true);
  });

  it('Requirement 2: Should record state transition blocks via onElectionStateChangedHook', () => {
    const { blockchain } = onElectionCreatedHook(sampleElection);

    // State transition 1: UPCOMING -> ACTIVE
    const { block: activeBlock } = onElectionStateChangedHook(
      sampleElection,
      'UPCOMING',
      'ACTIVE',
      blockchain
    );

    // State transition 2: ACTIVE -> COMPLETED
    const { block: completedBlock } = onElectionStateChangedHook(
      { ...sampleElection, status: 'ACTIVE' },
      'ACTIVE',
      'COMPLETED',
      blockchain
    );

    assert.equal(blockchain.chain.length, 4, 'Chain should contain Genesis + Created + Active + Completed blocks');
    assert.equal(activeBlock.data.action, 'ELECTION_STATE_CHANGED');
    assert.equal(activeBlock.data.previousState, 'UPCOMING');
    assert.equal(activeBlock.data.newState, 'ACTIVE');

    assert.equal(completedBlock.data.action, 'ELECTION_STATE_CHANGED');
    assert.equal(completedBlock.data.newState, 'COMPLETED');
    assert.equal(blockchain.isChainValid(), true, 'Chain validation must remain valid throughout transitions');
  });

  it('Requirement 3: Should verify valid untampered election database record', () => {
    const { block } = onElectionCreatedHook(sampleElection);
    const result = verifyElectionIntegrity(sampleElection, block);

    assert.equal(result.isIntact, true, 'Untampered election must pass integrity verification');
    assert.equal(result.currentHash, result.recordedHash);
    assert.equal(result.tamperedFields.length, 0);
  });

  it('Requirement 3: Should DETECT TAMPERING when election title is modified in DB', () => {
    const { block } = onElectionCreatedHook(sampleElection);

    // Tamper attempt in DB: Alter election title
    const tamperedElection = {
      ...sampleElection,
      title: 'Hacked Election Title',
    };

    const result = verifyElectionIntegrity(tamperedElection, block);

    assert.equal(result.isIntact, false, 'Tampered title MUST cause verification to return false');
    assert.notEqual(result.currentHash, result.recordedHash);
    assert.ok(result.tamperedFields.includes('title'));
  });

  it('Requirement 3: Should DETECT TAMPERING when start/end dates are altered in DB', () => {
    const { block } = onElectionCreatedHook(sampleElection);

    // Tamper attempt in DB: Extend voting end date
    const tamperedElection = {
      ...sampleElection,
      endDate: '2026-12-31T23:59:59.000Z',
    };

    const result = verifyElectionIntegrity(tamperedElection, block);

    assert.equal(result.isIntact, false, 'Tampered end date MUST cause verification to return false');
    assert.ok(result.tamperedFields.includes('endTime'));
  });

  it('Requirement 3: Should DETECT TAMPERING when candidate list is altered in DB', () => {
    const { block } = onElectionCreatedHook(sampleElection);

    // Tamper attempt in DB: Add unauthorized candidate
    const tamperedElection = {
      ...sampleElection,
      candidates: ['cand_alice_01', 'cand_bob_02', 'cand_unauthorized_hacker'],
    };

    const result = verifyElectionIntegrity(tamperedElection, block);

    assert.equal(result.isIntact, false, 'Tampered candidate list MUST cause verification to return false');
  });

  it('Requirement 3: Should DETECT TAMPERING when election status is unauthorizedly changed in DB', () => {
    const { block } = onElectionCreatedHook(sampleElection);

    // Tamper attempt in DB: Force status from UPCOMING to COMPLETED prematurely
    const tamperedElection = {
      ...sampleElection,
      status: 'COMPLETED',
    };

    const result = verifyElectionIntegrity(tamperedElection, block);

    assert.equal(result.isIntact, false, 'Tampered election status MUST cause verification to return false');
    assert.ok(result.tamperedFields.includes('status'));
  });

});
