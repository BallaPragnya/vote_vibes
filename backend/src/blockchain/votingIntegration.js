import crypto from 'crypto';
import Block from './block.js';
import Blockchain from './blockchain.js';
import { generateVoterHash } from './voterIdentity.js';
import { hashCandidateId } from './candidateValidation.js';

/**
 * Voting Engine Blockchain Integration & Cryptographic Receipt Module (Phase 5)
 * 
 * Bridges the vote-casting workflow with the immutable blockchain ledger 
 * and generates verifiable cryptographic vote receipts.
 */

export const DEFAULT_VOTE_SALT = 'votevibes_vote_salt_2026';
export const DEFAULT_RECEIPT_KEY = 'votevibes_receipt_key_2026';

/**
 * Generates a unique, formatted cryptographic Receipt ID.
 * Example: VR-8F3A-2026-X9B1
 * 
 * @returns {string} Human-readable cryptographic receipt ID
 */
export function generateReceiptId() {
  const randomHex = crypto.randomBytes(4).toString('hex').toUpperCase();
  const randomHex2 = crypto.randomBytes(2).toString('hex').toUpperCase();
  const year = new Date().getFullYear();
  return `VR-${randomHex.substring(0, 4)}-${year}-${randomHex2}`;
}

/**
 * Records a vote on the blockchain ledger.
 * Transforms voter and candidate IDs into secure hashes, creates an anonymized vote block,
 * and appends it to the blockchain.
 * 
 * @param {Object} params
 * @param {string} params.userId - Real voter student ID
 * @param {string} params.electionId - Election ID
 * @param {string} params.candidateId - Candidate ID voted for
 * @param {Blockchain} [params.blockchain] - Blockchain instance
 * @param {string} [params.secretSalt] - Secret salt for voter/candidate hashing
 * @param {string} [params.receiptSecretKey] - Secret key for receipt signature
 * @returns {Object} - { block, voteReceipt, blockchain }
 */
export function recordVoteOnBlockchain({
  userId,
  electionId,
  candidateId,
  blockchain = new Blockchain(),
  secretSalt = DEFAULT_VOTE_SALT,
  receiptSecretKey = DEFAULT_RECEIPT_KEY,
}) {
  if (!userId || !electionId || !candidateId) {
    throw new Error('userId, electionId, and candidateId are required to record vote on blockchain.');
  }

  // 1. Generate Phase 2 Anonymized Voter Hash
  const voterHash = generateVoterHash(userId, electionId, secretSalt);

  // 2. Generate Phase 4 Secure Candidate Identifier Hash
  const secureCandidateId = hashCandidateId(candidateId, electionId, secretSalt);

  const timestamp = new Date().toISOString();
  const nonce = crypto.randomBytes(16).toString('hex');

  // 3. Create Anonymized Vote Block Payload (NO raw student PII)
  const voteBlockData = {
    action: 'VOTE_CAST',
    voterHash,
    electionId,
    secureCandidateId,
    timestamp,
    nonce,
  };

  // 4. Create and append Block to Blockchain
  const newBlock = new Block(
    blockchain.chain.length,
    timestamp,
    voteBlockData
  );

  blockchain.addBlock(newBlock);

  // 5. Generate Cryptographic Vote Receipt
  const voteReceipt = generateCryptographicVoteReceipt({
    block: newBlock,
    voterHash,
    electionId,
    receiptSecretKey,
  });

  return {
    block: newBlock,
    voteReceipt,
    blockchain,
  };
}

/**
 * Generates a cryptographic vote receipt object for a student to verify their vote.
 * 
 * @param {Object} params
 * @param {Block} params.block - The created vote block
 * @param {string} params.voterHash - Anonymized voter hash
 * @param {string} params.electionId - Election ID
 * @param {string} [params.receiptSecretKey] - Secret key for signature
 * @returns {Object} Cryptographic vote receipt
 */
export function generateCryptographicVoteReceipt({
  block,
  voterHash,
  electionId,
  receiptSecretKey = DEFAULT_RECEIPT_KEY,
}) {
  if (!block || !voterHash || !electionId) {
    throw new Error('block, voterHash, and electionId are required to generate vote receipt.');
  }

  const receiptId = generateReceiptId();
  const blockIndex = block.index;
  const blockHash = block.hash;
  const previousHash = block.previousHash;
  const timestamp = block.timestamp;

  // Create HMAC SHA-256 digital signature of receipt parameters
  const signatureRaw = `${receiptId}:${voterHash}:${electionId}:${blockIndex}:${blockHash}:${timestamp}`;
  const signature = crypto
    .createHmac('sha256', receiptSecretKey)
    .update(signatureRaw)
    .digest('hex');

  return {
    receiptId,
    voterHash,
    electionId,
    blockIndex,
    blockHash,
    previousHash,
    timestamp,
    signature,
  };
}

export default {
  generateReceiptId,
  recordVoteOnBlockchain,
  generateCryptographicVoteReceipt,
};
