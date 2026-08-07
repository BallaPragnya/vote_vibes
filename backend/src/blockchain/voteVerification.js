import crypto from 'crypto';
import { generateVoterHash } from './voterIdentity.js';
import Blockchain from './blockchain.js';
import { DEFAULT_RECEIPT_KEY, DEFAULT_VOTE_SALT } from './votingIntegration.js';

/**
 * Vote Verification Engine (Phase 5)
 * 
 * Verifies whether a cryptographic vote receipt corresponds to a valid, 
 * untampered record on the blockchain ledger.
 */

/**
 * Verifies a cryptographic vote receipt against the blockchain ledger.
 * 
 * @param {Object} receipt - Cryptographic vote receipt object
 * @param {Blockchain} blockchain - Blockchain instance containing the ledger
 * @param {string} [receiptSecretKey] - Secret key used for signature verification
 * @returns {Object} - { isValid: boolean, reason?: string, verifiedBlock?: Object, blockIndex?: number }
 */
export function verifyVoteReceipt(receipt, blockchain, receiptSecretKey = DEFAULT_RECEIPT_KEY) {
  if (!receipt || typeof receipt !== 'object') {
    return { isValid: false, reason: 'Invalid receipt object.' };
  }

  if (!blockchain || !(blockchain instanceof Blockchain)) {
    return { isValid: false, reason: 'Valid Blockchain instance is required for verification.' };
  }

  const { receiptId, voterHash, electionId, blockIndex, blockHash, timestamp, signature } = receipt;

  if (!receiptId || !voterHash || !electionId || blockIndex === undefined || !blockHash || !signature) {
    return { isValid: false, reason: 'Receipt is missing required verification fields.' };
  }

  // 1. Verify Receipt Signature Integrity
  const signatureRaw = `${receiptId}:${voterHash}:${electionId}:${blockIndex}:${blockHash}:${timestamp}`;
  const computedSignature = crypto
    .createHmac('sha256', receiptSecretKey)
    .update(signatureRaw)
    .digest('hex');

  const isSignatureValid = crypto.timingSafeEqual(
    Buffer.from(computedSignature, 'hex'),
    Buffer.from(signature, 'hex')
  );

  if (!isSignatureValid) {
    return { isValid: false, reason: 'Receipt cryptographic signature mismatch (Tampered receipt).' };
  }

  // 2. Locate Block on Blockchain Ledger
  if (blockIndex < 0 || blockIndex >= blockchain.chain.length) {
    return { isValid: false, reason: `Block index ${blockIndex} out of blockchain range.` };
  }

  const targetBlock = blockchain.chain[blockIndex];

  // 3. Verify Block Hash Match
  if (targetBlock.hash !== blockHash) {
    return { isValid: false, reason: 'Block hash mismatch between receipt and blockchain ledger.' };
  }

  // 4. Verify Block Internal Integrity & Data Payload
  if (targetBlock.hash !== targetBlock.calculateHash()) {
    return { isValid: false, reason: 'Block hash calculation failure (Block data modified on chain).' };
  }

  if (targetBlock.data.voterHash !== voterHash) {
    return { isValid: false, reason: 'Voter hash mismatch between receipt and target block.' };
  }

  if (targetBlock.data.electionId !== electionId) {
    return { isValid: false, reason: 'Election ID mismatch between receipt and target block.' };
  }

  // 5. Verify Entire Blockchain Chain Integrity
  if (!blockchain.isChainValid()) {
    return { isValid: false, reason: 'Blockchain chain linkage is corrupted or broken.' };
  }

  return {
    isValid: true,
    message: 'Vote receipt successfully verified on the blockchain ledger.',
    verifiedBlock: targetBlock,
    blockIndex,
    timestamp: targetBlock.timestamp,
  };
}

/**
 * Checks if a voter has cast a vote in a specific election on the blockchain ledger.
 * Preserves privacy: confirms participation without revealing candidate selection.
 * 
 * @param {string} userId - Real voter student ID
 * @param {string} electionId - Election ID
 * @param {Blockchain} blockchain - Blockchain instance
 * @param {string} [secretSalt] - Salt used for voter hashing
 * @returns {Object} - { hasVoted: boolean, blockIndex?: number, timestamp?: string }
 */
export function verifyVoterParticipation(userId, electionId, blockchain, secretSalt = DEFAULT_VOTE_SALT) {
  if (!userId || !electionId || !blockchain) {
    return { hasVoted: false, reason: 'Missing required arguments.' };
  }

  const targetVoterHash = generateVoterHash(userId, electionId, secretSalt);

  for (let i = 1; i < blockchain.chain.length; i++) {
    const block = blockchain.chain[i];
    if (
      block.data &&
      block.data.action === 'VOTE_CAST' &&
      block.data.electionId === electionId &&
      block.data.voterHash === targetVoterHash
    ) {
      return {
        hasVoted: true,
        blockIndex: block.index,
        timestamp: block.timestamp,
      };
    }
  }

  return {
    hasVoted: false,
  };
}

export default {
  verifyVoteReceipt,
  verifyVoterParticipation,
};
