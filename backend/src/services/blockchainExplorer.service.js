import Blockchain from '../blockchain/blockchain.js';
import Block from '../blockchain/block.js';
import { verifyVoteReceipt, verifyVoterParticipation } from '../blockchain/voteVerification.js';
import { recordVoteOnBlockchain, generateCryptographicVoteReceipt } from '../blockchain/votingIntegration.js';
import { onElectionCreatedHook, onElectionStateChangedHook } from '../blockchain/electionIntegrity.js';
import { createCandidateRegistrationBlockData } from '../blockchain/candidateValidation.js';

/**
 * Singleton Blockchain Instance for VoteVibes Node
 */
class GlobalBlockchainStore {
  constructor() {
    this.blockchain = new Blockchain();
    this.receiptsStore = new Map(); // Store generated vote receipts by receiptId
  }

  getChain() {
    return this.blockchain;
  }
}

export const globalBlockchain = new GlobalBlockchainStore();

export class BlockchainExplorerService {
  constructor(blockchainStore = globalBlockchain) {
    this.store = blockchainStore;
  }

  /**
   * Returns current blockchain ledger overview, metrics, and chain validity status
   * @returns {Object} Ledger summary & integrity status
   */
  getLedgerOverview() {
    const blockchain = this.store.getChain();
    const isChainValid = blockchain.isChainValid();
    const totalBlocks = blockchain.chain.length;

    // Count action types
    let totalVotesRecorded = 0;
    let totalElectionsRecorded = 0;
    let totalCandidatesRecorded = 0;

    const blockSummaries = blockchain.chain.map((block) => {
      const action = block.data?.action || 'GENESIS';
      if (action === 'VOTE_CAST') totalVotesRecorded++;
      if (action === 'ELECTION_CREATED') totalElectionsRecorded++;
      if (action === 'CANDIDATE_REGISTERED') totalCandidatesRecorded++;

      return {
        index: block.index,
        timestamp: block.timestamp,
        hash: block.hash,
        previousHash: block.previousHash,
        action,
        data: block.data,
      };
    });

    const genesisBlock = blockchain.chain[0];
    const latestBlock = blockchain.getLatestBlock();

    return {
      integrity: {
        isChainValid,
        integrityScore: isChainValid ? 100 : 0,
        status: isChainValid ? 'INTACT' : 'CORRUPTED',
        message: isChainValid
          ? 'All block hashes and link sequences verified successfully.'
          : 'CRITICAL WARNING: Blockchain integrity check failed!',
      },
      metrics: {
        totalBlocks,
        totalVotesRecorded,
        totalElectionsRecorded,
        totalCandidatesRecorded,
        genesisTimestamp: genesisBlock?.timestamp || null,
        latestBlockHash: latestBlock?.hash || null,
      },
      blocks: blockSummaries,
    };
  }

  /**
   * Retrieves a specific block by index or hash
   * @param {string|number} identifier 
   * @returns {Object|null}
   */
  getBlock(identifier) {
    const blockchain = this.store.getChain();
    if (typeof identifier === 'number' || !isNaN(Number(identifier))) {
      const idx = Number(identifier);
      if (idx >= 0 && idx < blockchain.chain.length) {
        return blockchain.chain[idx];
      }
    }

    const hashStr = String(identifier).trim();
    return blockchain.chain.find((b) => b.hash === hashStr) || null;
  }

  /**
   * Filters blockchain blocks by action type, electionId, or search query
   * @param {Object} queryParams - { action, electionId, search }
   * @returns {Array<Object>}
   */
  filterBlocks({ action, electionId, search }) {
    const overview = this.getLedgerOverview();
    let filtered = overview.blocks;

    if (action && action.trim() !== '') {
      const actionUpper = action.trim().toUpperCase();
      filtered = filtered.filter((b) => b.action.toUpperCase() === actionUpper);
    }

    if (electionId && electionId.trim() !== '') {
      const targetElec = electionId.trim();
      filtered = filtered.filter((b) => b.data?.electionId === targetElec);
    }

    if (search && search.trim() !== '') {
      const query = search.trim().toLowerCase();
      filtered = filtered.filter((b) =>
        String(b.index).includes(query) ||
        b.hash.toLowerCase().includes(query) ||
        b.previousHash.toLowerCase().includes(query) ||
        b.action.toLowerCase().includes(query) ||
        (b.data?.electionId && b.data.electionId.toLowerCase().includes(query)) ||
        (b.data?.voterHash && b.data.voterHash.toLowerCase().includes(query)) ||
        (b.data?.secureCandidateId && b.data.secureCandidateId.toLowerCase().includes(query))
      );
    }

    return filtered;
  }

  /**
   * Performs real-time full audit scan of all block hashes and previousHash links
   * @returns {Object} Full audit report
   */
  performFullChainAudit() {
    const blockchain = this.store.getChain();
    const verifiedBlocks = [];
    const tamperedBlocks = [];

    for (let i = 0; i < blockchain.chain.length; i++) {
      const currentBlock = blockchain.chain[i];
      const recalculatedHash = currentBlock.calculateHash();

      let isBlockIntact = currentBlock.hash === recalculatedHash;
      let isLinkIntact = true;

      if (i > 0) {
        const previousBlock = blockchain.chain[i - 1];
        if (currentBlock.previousHash !== previousBlock.hash) {
          isLinkIntact = false;
        }
      }

      if (isBlockIntact && isLinkIntact) {
        verifiedBlocks.push({
          index: currentBlock.index,
          hash: currentBlock.hash,
          status: 'VERIFIED',
        });
      } else {
        tamperedBlocks.push({
          index: currentBlock.index,
          hash: currentBlock.hash,
          recalculatedHash,
          reason: !isBlockIntact ? 'Hash mismatch' : 'Previous hash link mismatch',
        });
      }
    }

    const isChainValid = tamperedBlocks.length === 0;

    return {
      isChainValid,
      integrityScore: isChainValid ? 100 : Math.max(0, Math.round(((verifiedBlocks.length) / blockchain.chain.length) * 100)),
      totalBlocks: blockchain.chain.length,
      verifiedBlocksCount: verifiedBlocks.length,
      tamperedBlocksCount: tamperedBlocks.length,
      tamperedBlocks,
      verifiedBlocks,
    };
  }

  /**
   * Public receipt verification tool endpoint handler
   * @param {Object} receiptData - Receipt payload to verify
   * @returns {Object} Verification outcome
   */
  verifyPublicReceipt(receiptData) {
    const blockchain = this.store.getChain();
    return verifyVoteReceipt(receiptData, blockchain);
  }
}

export const blockchainExplorerService = new BlockchainExplorerService();
export default blockchainExplorerService;
