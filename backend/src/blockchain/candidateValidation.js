import crypto from 'crypto';
import calculateHash from './hash.js';

/**
 * Candidate Validation & ID Hashing Engine (Phase 4)
 * 
 * Provides candidate ID hashing, duplicate prevention validation, 
 * candidate profile integrity fingerprinting, and tamper detection.
 */

/**
 * Generates a secure, hashed candidate identifier.
 * Transforms raw candidate ID into a SHA-256 secure representation scoped to an election.
 * 
 * @param {string} candidateId - Raw candidate ID / UUID
 * @param {string} electionId - Election ID candidate belongs to
 * @param {string} [salt] - Secret salt/pepper
 * @returns {string} 64-character hex Secure Candidate Identifier
 */
export function hashCandidateId(candidateId, electionId, salt = 'candidate_secure_id_salt_2026') {
  if (!candidateId || typeof candidateId !== 'string' || candidateId.trim() === '') {
    throw new Error('Candidate ID must be a non-empty string.');
  }
  if (!electionId || typeof electionId !== 'string' || electionId.trim() === '') {
    throw new Error('Election ID must be a non-empty string.');
  }

  const combinedKey = `${electionId}:${salt}`;
  const normalizedCandidateId = candidateId.trim();

  return crypto
    .createHmac('sha256', combinedKey)
    .update(normalizedCandidateId)
    .digest('hex');
}

/**
 * Computes a deterministic canonical SHA-256 fingerprint hash of a candidate's profile payload.
 * Used to lock candidate profile integrity on the blockchain ledger.
 * 
 * @param {Object} candidate - Candidate entity object
 * @returns {string} 64-character hex candidate integrity hash
 */
export function computeCandidateIntegrityHash(candidate) {
  if (!candidate || typeof candidate !== 'object') {
    throw new Error('Candidate object is required for integrity hash calculation.');
  }

  const id = String(candidate.id || candidate.candidateId || '').trim();
  const electionId = String(candidate.electionId || '').trim();
  const userId = String(candidate.userId || candidate.user_id || '').trim();
  const name = String(candidate.name || candidate.userName || '').trim();
  const position = String(candidate.position || candidate.post || '').trim();
  const manifesto = String(candidate.manifesto || candidate.bio || '').trim();
  const status = String(candidate.status || 'APPROVED').toUpperCase();

  const canonicalPayload = {
    id,
    electionId,
    userId,
    name,
    position,
    manifesto,
    status,
  };

  return calculateHash(canonicalPayload);
}

/**
 * Validates candidate registration payload for security, uniqueness, and duplicate prevention.
 * 
 * @param {Object} candidateData - Candidate data to validate
 * @param {Array<Object>} [existingCandidates=[]] - Existing candidates list in the same election
 * @returns {Object} - { isValid: boolean, errors: string[] }
 */
export function validateCandidateSecurity(candidateData, existingCandidates = []) {
  const errors = [];

  if (!candidateData || typeof candidateData !== 'object') {
    return { isValid: false, errors: ['Candidate data must be an object.'] };
  }

  const candidateId = candidateData.id || candidateData.candidateId;
  const electionId = candidateData.electionId;
  const userId = candidateData.userId || candidateData.user_id;
  const name = candidateData.name || candidateData.userName;

  // 1. Ensure candidate ID / user ID presence
  if (!candidateId && !userId) {
    errors.push('Candidate must possess a valid unique candidateId or userId.');
  }

  if (!electionId || typeof electionId !== 'string' || electionId.trim() === '') {
    errors.push('Candidate must be linked to a valid electionId.');
  }

  // 2. Prevent duplicate candidate registration in the same election
  if (Array.isArray(existingCandidates) && existingCandidates.length > 0) {
    const isDuplicateUser = existingCandidates.some((existing) => {
      const existingUser = existing.userId || existing.user_id;
      const existingId = existing.id || existing.candidateId;
      
      // Check ID match
      if (candidateId && existingId && candidateId === existingId) {
        return true;
      }
      // Check user ID match within same election
      if (userId && existingUser && userId === existingUser) {
        return true;
      }
      // Check exact candidate name match within same election & position
      if (name && existing.name && name.trim().toLowerCase() === existing.name.trim().toLowerCase()) {
        const candidatePos = (candidateData.position || '').trim().toLowerCase();
        const existingPos = (existing.position || '').trim().toLowerCase();
        if (candidatePos === existingPos) {
          return true;
        }
      }
      return false;
    });

    if (isDuplicateUser) {
      errors.push('Duplicate candidate registration detected: Candidate is already registered in this election.');
    }
  }

  // 3. Security Sanity Check (prevent XSS / Script Injection in candidate bio/manifesto)
  const scriptPattern = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
  if (candidateData.manifesto && scriptPattern.test(candidateData.manifesto)) {
    errors.push('Security Violation: Candidate manifesto contains forbidden script content.');
  }
  if (candidateData.name && scriptPattern.test(candidateData.name)) {
    errors.push('Security Violation: Candidate name contains forbidden script content.');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Verifies the integrity of a candidate database record against its recorded blockchain integrity hash.
 * Detects unauthorized modification of candidate profile, position, or manifesto in PostgreSQL.
 * 
 * @param {Object} currentCandidateData - Current candidate data from database
 * @param {string} recordedIntegrityHash - Integrity hash recorded on blockchain ledger
 * @returns {Object} - { isIntact: boolean, currentHash: string, recordedHash: string, tamperedFields: string[] }
 */
export function verifyCandidateIntegrity(currentCandidateData, recordedIntegrityHash) {
  if (!currentCandidateData || !recordedIntegrityHash) {
    return {
      isIntact: false,
      reason: 'Missing candidate data or recorded integrity hash.',
      tamperedFields: ['ALL'],
    };
  }

  const currentHash = computeCandidateIntegrityHash(currentCandidateData);
  const isIntact = currentHash === recordedIntegrityHash;

  const tamperedFields = [];
  if (!isIntact) {
    tamperedFields.push('candidate_payload_or_manifesto');
  }

  return {
    isIntact,
    currentHash,
    recordedHash: recordedIntegrityHash,
    tamperedFields,
  };
}

/**
 * Creates a secure, hashed block data payload for candidate registration onto the blockchain.
 * 
 * @param {Object} candidate 
 * @returns {Object} Candidate registration block payload
 */
export function createCandidateRegistrationBlockData(candidate) {
  const candidateId = candidate.id || candidate.candidateId;
  const secureCandidateId = hashCandidateId(candidateId, candidate.electionId);
  const integrityHash = computeCandidateIntegrityHash(candidate);
  const timestamp = new Date().toISOString();

  return {
    action: 'CANDIDATE_REGISTERED',
    secureCandidateId,
    electionId: candidate.electionId,
    position: candidate.position || '',
    integrityHash,
    timestamp,
  };
}

export default {
  hashCandidateId,
  computeCandidateIntegrityHash,
  validateCandidateSecurity,
  verifyCandidateIntegrity,
  createCandidateRegistrationBlockData,
};
