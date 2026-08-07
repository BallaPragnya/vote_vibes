import crypto from 'crypto';

/**
 * Generate an immutable, anonymous vote receipt object without sensitive voter PII.
 * 
 * Guaranteed Receipt Properties:
 * - receiptId (UUID)
 * - electionId (UUID)
 * - candidateId (UUID)
 * - voteTimestamp (ISO 8601 string)
 * - receiptHash (SHA-256 digest of receiptId:electionId:candidateId:voteTimestamp)
 * 
 * @param {Object} params
 * @param {string} [params.receiptId] - Optional receipt UUID
 * @param {string} params.electionId - Election UUID
 * @param {string} params.candidateId - Candidate UUID
 * @param {Date|string|number} [params.voteTimestamp] - Vote timestamp
 * @returns {Readonly<Object>} Immutable receipt object
 */
export const generateVoteReceiptPayload = ({
  receiptId,
  electionId,
  candidateId,
  voteTimestamp = new Date(),
}) => {
  const finalReceiptId = receiptId || crypto.randomUUID();
  const timestampIso = new Date(voteTimestamp).toISOString();

  // Compute SHA-256 digest over immutable receipt components
  const hashInput = `${finalReceiptId}:${electionId}:${candidateId}:${timestampIso}`;
  const receiptHash = crypto.createHash('sha256').update(hashInput).digest('hex');

  const receipt = {
    receiptId: finalReceiptId,
    electionId,
    candidateId,
    voteTimestamp: timestampIso,
    receiptHash,
  };

  // Freeze object to enforce immutability
  return Object.freeze(receipt);
};

export default generateVoteReceiptPayload;
