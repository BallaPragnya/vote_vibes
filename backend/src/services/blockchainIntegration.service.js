import { createAnonymizedVotePayload } from '../blockchain/voterIdentity.js';
import calculateHash from '../blockchain/hash.js';
import defaultVoteRepository from '../repositories/vote.repository.js';
import prisma from '../config/prisma.js';

export class BlockchainIntegrationService {
  /**
   * @param {Object} [voteRepo] 
   */
  constructor(voteRepo = defaultVoteRepository) {
    this.voteRepository = voteRepo;
  }

  /**
   * Prepare anonymized blockchain vote payload using existing Blockchain module
   * @param {Object} params
   * @param {string} params.userId 
   * @param {string} params.electionId 
   * @param {string} params.candidateId 
   * @returns {Object} Anonymized payload containing voterHash, electionId, candidateId, timestamp, nonce
   */
  prepareBlockchainPayload({ userId, electionId, candidateId }) {
    return createAnonymizedVotePayload({
      userId,
      electionId,
      candidateId,
    });
  }

  /**
   * Record vote payload on blockchain ledger and save transaction reference in Vote record
   * Handles blockchain failures gracefully to ensure database consistency.
   * 
   * @param {Object} params
   * @param {string} params.voteId - Target Vote primary key
   * @param {string} params.userId 
   * @param {string} params.electionId 
   * @param {string} params.candidateId 
   * @param {string} [params.positionId] 
   * @param {Object} [tx] - Prisma transaction client
   * @returns {Promise<Object>} - { success: boolean, blockchainTransactionId: string, blockHash: string }
   */
  async recordVoteOnBlockchain({ voteId, userId, electionId, candidateId, positionId }, tx = prisma) {
    try {
      // 1. Prepare anonymized payload using Blockchain team module
      const payload = this.prepareBlockchainPayload({ userId, electionId, candidateId });

      // 2. Fetch latest block from ledger
      const latestBlock = await this.voteRepository.getLatestBlock(tx);
      const previousHash = latestBlock
        ? latestBlock.hash
        : '0000000000000000000000000000000000000000000000000000000000000000';

      const timestamp = Date.now();
      const nextIndex = latestBlock ? Number(latestBlock.id) + 1 : 1;

      // 3. Compute Block Hash using Blockchain module
      const blockHash = calculateHash({
        index: nextIndex,
        timestamp,
        data: payload,
        previousHash,
      });

      // 4. Invoke Blockchain service to store block
      const newBlock = await this.voteRepository.createBlock(
        {
          previousHash,
          hash: blockHash,
          nonce: Math.floor(Math.random() * 10000),
          timestamp,
        },
        tx
      );

      // Resolve valid position ID
      let resolvedPositionId = positionId;
      if (!resolvedPositionId) {
        const candidateObj = await tx.candidate.findUnique({
          where: { id: candidateId },
          select: { positionId: true },
        });
        resolvedPositionId = candidateObj?.positionId;
      }

      if (!resolvedPositionId) {
        let defaultPos = await tx.position.findFirst({
          where: { electionId },
          select: { id: true },
        });
        if (!defaultPos) {
          defaultPos = await tx.position.create({
            data: { electionId, title: 'General' },
          });
        }
        resolvedPositionId = defaultPos.id;
      }

      // 5. Record transaction entry
      const transaction = await this.voteRepository.recordVoteTransaction(
        {
          blockId: newBlock.id,
          electionId,
          positionId: resolvedPositionId,
          candidateId,
          voteHash: payload.voterHash,
        },
        tx
      );

      const blockchainTransactionId = `BLK-TX-${transaction.id}`;

      // 6. Save blockchain transaction reference inside Vote record
      if (voteId) {
        await tx.vote.update({
          where: { id: voteId },
          data: {
            blockchainTransactionId,
          },
        });
      }

      return {
        success: true,
        blockchainTransactionId,
        blockHash: newBlock.hash,
        voterHash: payload.voterHash,
      };
    } catch (error) {
      // Graceful fallback for blockchain service error to preserve DB consistency
      console.warn(`[Blockchain Integration Warning] Failed to record vote '${voteId}' on blockchain ledger:`, error.message);
      const fallbackTxId = `FALLBACK-PENDING-${Date.now()}`;

      if (voteId) {
        await tx.vote.update({
          where: { id: voteId },
          data: {
            blockchainTransactionId: fallbackTxId,
          },
        }).catch(() => {});
      }

      return {
        success: false,
        error: error.message,
        blockchainTransactionId: fallbackTxId,
      };
    }
  }
}

export const blockchainIntegrationService = new BlockchainIntegrationService();
export default blockchainIntegrationService;
