import crypto from 'crypto';

/**
 * Voter Identity Abstraction Layer for VoteVibes Blockchain
 * 
 * Provides cryptographic voter identity anonymization to preserve ballot secrecy while 
 * ensuring vote auditability and double-voting prevention.
 */

/**
 * Generates an anonymous, irreversible voter hash scoped to a specific election.
 * Uses HMAC-SHA256 with an election-specific secret salt.
 * 
 * @param {string} userId - Real voter UUID / student identifier (MUST NOT be exposed on chain)
 * @param {string} electionId - Unique election identifier
 * @param {string} [secretSalt] - Secret pepper/salt for the election (defaults to system key)
 * @returns {string} 64-character hex anonymous voter hash
 */
export function generateVoterHash(userId, electionId, secretSalt = 'votevibes_identity_salt_2026') {
  if (!userId || typeof userId !== 'string' || userId.trim() === '') {
    throw new Error('Voter ID must be a non-empty string.');
  }
  if (!electionId || typeof electionId !== 'string' || electionId.trim() === '') {
    throw new Error('Election ID must be a non-empty string.');
  }

  const combinedSecret = `${electionId}:${secretSalt}`;
  const normalizedUser = userId.trim().toLowerCase();

  return crypto
    .createHmac('sha256', combinedSecret)
    .update(normalizedUser)
    .digest('hex');
}

/**
 * Creates an anonymized vote payload suitable for block inclusion.
 * Guarantees no PII (Personally Identifiable Information) enters the blockchain ledger.
 * 
 * @param {Object} params
 * @param {string} params.userId - Real voter identifier
 * @param {string} params.electionId - Election identifier
 * @param {string} params.candidateId - Candidate selected
 * @param {string} [params.secretSalt] - Secret salt
 * @returns {Object} Anonymized vote payload object
 */
export function createAnonymizedVotePayload({ userId, electionId, candidateId, secretSalt }) {
  if (!candidateId || typeof candidateId !== 'string') {
    throw new Error('Candidate ID is required for vote payload.');
  }

  const voterHash = generateVoterHash(userId, electionId, secretSalt);
  const nonce = crypto.randomBytes(16).toString('hex');
  const timestamp = new Date().toISOString();

  return {
    voterHash,
    electionId,
    candidateId,
    timestamp,
    nonce,
  };
}

/**
 * Verifies if a given voter hash matches a voter for a given election.
 * Used by individual voters to verify their vote on the ledger.
 * 
 * @param {string} userId 
 * @param {string} electionId 
 * @param {string} expectedVoterHash 
 * @param {string} [secretSalt] 
 * @returns {boolean} True if matching
 */
export function verifyVoterHash(userId, electionId, expectedVoterHash, secretSalt) {
  try {
    const computed = generateVoterHash(userId, electionId, secretSalt);
    return crypto.timingSafeEqual(Buffer.from(computed, 'hex'), Buffer.from(expectedVoterHash, 'hex'));
  } catch (err) {
    return false;
  }
}

/**
 * Validates that block data strictly contains anonymized identifiers and no PII.
 * 
 * @param {Object} blockData 
 * @returns {boolean} True if block data is clean and anonymized
 */
export function validateAnonymizedBlockData(blockData) {
  if (!blockData || typeof blockData !== 'object') return false;

  const forbiddenFields = ['userId', 'email', 'name', 'studentId', 'rollNumber', 'password'];
  for (const field of forbiddenFields) {
    if (field in blockData) {
      return false;
    }
  }

  return Boolean(blockData.voterHash && blockData.electionId && blockData.candidateId);
}

export default {
  generateVoterHash,
  createAnonymizedVotePayload,
  verifyVoterHash,
  validateAnonymizedBlockData,
};
