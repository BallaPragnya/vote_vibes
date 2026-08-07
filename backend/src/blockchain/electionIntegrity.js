import crypto from 'crypto';
import Block from './block.js';
import Blockchain from './blockchain.js';

/**
 * Election Integrity & Immutability Engine (Phase 3)
 * 
 * Provides cryptographic hashing, blockchain record hooks, and tamper-detection 
 * verification for election lifecycle events.
 */

/**
 * Computes a deterministic SHA-256 integrity fingerprint for an election.
 * Sorts all nested candidate IDs and department restriction IDs to ensure hash reproducibility.
 * 
 * @param {Object} election - Election entity from database
 * @returns {string} 64-character hex integrity hash
 */
export function computeElectionIntegrityHash(election) {
  if (!election || typeof election !== 'object') {
    throw new Error('Election object is required for integrity hash calculation.');
  }

  const id = election.id || '';
  const title = (election.title || '').trim();
  const description = (election.description || '').trim();
  const startTime = election.startTime || election.startDate ? new Date(election.startTime || election.startDate).toISOString() : '';
  const endTime = election.endTime || election.endDate ? new Date(election.endTime || election.endDate).toISOString() : '';
  const status = (election.status || 'DRAFT').toUpperCase();
  const isDepartmentRestricted = Boolean(election.isDepartmentRestricted);

  // Normalize candidate identifiers (sorted)
  let candidates = [];
  if (Array.isArray(election.candidates)) {
    candidates = election.candidates
      .map((c) => (typeof c === 'object' ? (c.id || c.name || '') : String(c)).trim())
      .filter(Boolean)
      .sort();
  }

  // Normalize department restriction IDs (sorted)
  let departmentIds = [];
  if (Array.isArray(election.departmentIds)) {
    departmentIds = election.departmentIds
      .map((d) => String(d).trim())
      .filter(Boolean)
      .sort();
  }

  const canonicalPayload = {
    id,
    title,
    description,
    startTime,
    endTime,
    status,
    isDepartmentRestricted,
    departmentIds,
    candidates,
  };

  return crypto
    .createHash('sha256')
    .update(JSON.stringify(canonicalPayload))
    .digest('hex');
}

/**
 * Hook executed when an election is created.
 * Generates the election's genesis block payload and appends it to the blockchain.
 * 
 * @param {Object} election - Election data created in DB
 * @param {Blockchain} [blockchain] - Blockchain instance (instantiates new one if omitted)
 * @returns {Object} - { block, integrityHash, blockchain }
 */
export function onElectionCreatedHook(election, blockchain = new Blockchain()) {
  const integrityHash = computeElectionIntegrityHash(election);
  const timestamp = new Date().toISOString();

  const blockPayload = {
    action: 'ELECTION_CREATED',
    electionId: election.id,
    integrityHash,
    title: election.title,
    startTime: election.startTime || election.startDate,
    endTime: election.endTime || election.endDate,
    status: election.status || 'DRAFT',
    timestamp,
  };

  const newBlock = new Block(
    blockchain.chain.length,
    timestamp,
    blockPayload
  );

  blockchain.addBlock(newBlock);

  return {
    block: newBlock,
    integrityHash,
    blockchain,
  };
}

/**
 * Hook executed when an election transitions status (e.g., UPCOMING -> ACTIVE -> COMPLETED).
 * Appends a state transition block onto the election's blockchain ledger.
 * 
 * @param {Object} election - Election entity after status update
 * @param {string} previousState - State before update
 * @param {string} newState - State after update
 * @param {Blockchain} blockchain - Blockchain instance tracking the election
 * @returns {Object} - { block, integrityHash }
 */
export function onElectionStateChangedHook(election, previousState, newState, blockchain) {
  if (!blockchain || !(blockchain instanceof Blockchain)) {
    throw new Error('Valid Blockchain instance is required for state change hook.');
  }

  const updatedElection = { ...election, status: newState };
  const integrityHash = computeElectionIntegrityHash(updatedElection);
  const timestamp = new Date().toISOString();

  const blockPayload = {
    action: 'ELECTION_STATE_CHANGED',
    electionId: election.id,
    previousState,
    newState,
    integrityHash,
    timestamp,
  };

  const newBlock = new Block(
    blockchain.chain.length,
    timestamp,
    blockPayload
  );

  blockchain.addBlock(newBlock);

  return {
    block: newBlock,
    integrityHash,
  };
}

/**
 * Verifies the integrity of an election database entity against its recorded blockchain block.
 * Detects any unauthorized modification or database tampering.
 * 
 * @param {Object} currentDbElection - Current election data retrieved from PostgreSQL database
 * @param {Object|Block} recordedBlock - Blockchain block containing the recorded integrityHash
 * @returns {Object} - { isIntact: boolean, currentHash: string, recordedHash: string, tamperedFields: string[] }
 */
export function verifyElectionIntegrity(currentDbElection, recordedBlock) {
  if (!currentDbElection || !recordedBlock) {
    return {
      isIntact: false,
      reason: 'Missing current election data or recorded blockchain block.',
      tamperedFields: ['ALL'],
    };
  }

  const blockData = recordedBlock.data || recordedBlock;
  const recordedHash = blockData.integrityHash;

  if (!recordedHash) {
    return {
      isIntact: false,
      reason: 'Recorded blockchain block does not contain an integrityHash.',
      tamperedFields: ['integrityHash'],
    };
  }

  const currentHash = computeElectionIntegrityHash(currentDbElection);
  const isIntact = currentHash === recordedHash;

  const tamperedFields = [];
  if (!isIntact) {
    if ((blockData.title && currentDbElection.title !== blockData.title)) {
      tamperedFields.push('title');
    }
    if ((blockData.status && currentDbElection.status !== blockData.status)) {
      tamperedFields.push('status');
    }
    if (blockData.startTime && new Date(currentDbElection.startTime || currentDbElection.startDate).toISOString() !== new Date(blockData.startTime).toISOString()) {
      tamperedFields.push('startTime');
    }
    if (blockData.endTime && new Date(currentDbElection.endTime || currentDbElection.endDate).toISOString() !== new Date(blockData.endTime).toISOString()) {
      tamperedFields.push('endTime');
    }
    if (tamperedFields.length === 0) {
      tamperedFields.push('configuration_or_candidates');
    }
  }

  return {
    isIntact,
    currentHash,
    recordedHash,
    tamperedFields,
  };
}

export default {
  computeElectionIntegrityHash,
  onElectionCreatedHook,
  onElectionStateChangedHook,
  verifyElectionIntegrity,
};
