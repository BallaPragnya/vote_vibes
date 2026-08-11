import crypto from 'crypto';
import Blockchain from './blockchain.js';

/**
 * Ledger Export Engine (Phase 7)
 * 
 * Provides mechanisms to export the blockchain ledger in JSON, CSV, 
 * and Cryptographic Proof Package formats for offline auditability.
 */

/**
 * Exports complete blockchain ledger state as structured, verifiable JSON.
 * 
 * @param {Blockchain} blockchain 
 * @returns {Object} JSON Export Package
 */
export function exportLedgerAsJson(blockchain = new Blockchain()) {
  const isChainValid = blockchain.isChainValid();
  const timestamp = new Date().toISOString();

  const blocks = blockchain.chain.map((block) => ({
    index: block.index,
    timestamp: block.timestamp,
    hash: block.hash,
    previousHash: block.previousHash,
    action: block.data?.action || 'GENESIS',
    data: block.data,
  }));

  const exportPayload = {
    metadata: {
      system: 'VoteVibes Custom Blockchain Ledger',
      version: '1.0.0',
      exportedAt: timestamp,
      totalBlocks: blocks.length,
      isChainValid,
      genesisHash: blocks[0]?.hash || null,
      latestHash: blocks[blocks.length - 1]?.hash || null,
    },
    blocks,
  };

  // Attach digital signature to export payload
  const payloadStr = JSON.stringify(exportPayload.blocks);
  const signature = crypto
    .createHmac('sha256', 'votevibes_ledger_export_secret')
    .update(payloadStr)
    .digest('hex');

  exportPayload.metadata.exportSignature = signature;
  return exportPayload;
}

/**
 * Exports blockchain ledger as CSV text.
 * 
 * @param {Blockchain} blockchain 
 * @returns {string} Formatted CSV string
 */
export function exportLedgerAsCsv(blockchain = new Blockchain()) {
  const headers = ['Index', 'Timestamp', 'Action', 'Block Hash', 'Previous Hash', 'Payload Summary'];
  const rows = [headers.join(',')];

  for (const block of blockchain.chain) {
    const idx = block.index;
    const ts = `"${block.timestamp}"`;
    const action = `"${block.data?.action || 'GENESIS'}"`;
    const hash = `"${block.hash}"`;
    const prevHash = `"${block.previousHash || ''}"`;
    const payloadStr = `"${JSON.stringify(block.data || {}).replace(/"/g, '""')}"`;

    rows.push([idx, ts, action, hash, prevHash, payloadStr].join(','));
  }

  return rows.join('\n');
}

/**
 * Generates an offline Cryptographic Proof Package for an election.
 * 
 * @param {Blockchain} blockchain 
 * @param {string} electionId 
 * @returns {Object} Cryptographic Proof Package
 */
export function generateCryptographicProofPackage(blockchain = new Blockchain(), electionId) {
  const isChainValid = blockchain.isChainValid();
  const electionBlocks = blockchain.chain.filter(
    (b) => b.data?.electionId === electionId || b.index === 0
  );

  const blockHashes = electionBlocks.map((b) => b.hash);
  const merkleRoot = blockHashes.reduce((acc, current) => {
    return crypto.createHash('sha256').update(acc + current).digest('hex');
  }, 'MERKLE_INIT');

  return {
    electionId,
    generatedAt: new Date().toISOString(),
    isChainValid,
    totalBlocks: electionBlocks.length,
    merkleRoot,
    proofBlocks: electionBlocks.map((b) => ({
      index: b.index,
      timestamp: b.timestamp,
      hash: b.hash,
      previousHash: b.previousHash,
      data: b.data,
    })),
  };
}

export default {
  exportLedgerAsJson,
  exportLedgerAsCsv,
  generateCryptographicProofPackage,
};
