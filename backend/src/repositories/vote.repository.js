import prisma from '../config/prisma.js';
import { getPaginationParams, formatPaginatedResponse } from '../utils/pagination.js';

export class VoteRepository {
  /**
   * Create a new Vote record in database
   * @param {Object} voteData - { electionId, candidateId, voterId, transactionReceipt, blockchainTransactionId, voteTimestamp }
   * @param {Object} [tx] - Optional Prisma transaction client
   * @returns {Promise<Object>}
   */
  async createVote({ electionId, candidateId, voterId, transactionReceipt, blockchainTransactionId = null, voteTimestamp = new Date() }, tx = prisma) {
    return tx.vote.create({
      data: {
        electionId,
        candidateId,
        voterId,
        transactionReceipt,
        blockchainTransactionId,
        voteTimestamp,
      },
      include: {
        election: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
        candidate: {
          select: {
            id: true,
            fullName: true,
          },
        },
        voter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Get vote details by ID
   * @param {string} id 
   * @param {Object} [tx] 
   * @returns {Promise<Object|null>}
   */
  async getVoteById(id, tx = prisma) {
    return tx.vote.findUnique({
      where: { id },
      include: {
        election: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
        candidate: {
          select: {
            id: true,
            fullName: true,
          },
        },
        voter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Get vote(s) cast by a specific voter in an election
   * @param {string} voterId 
   * @param {string} [electionId] 
   * @param {Object} [tx] 
   * @returns {Promise<Array>}
   */
  async getVoteByVoter(voterId, electionId = null, tx = prisma) {
    const where = { voterId };
    if (electionId) {
      where.electionId = electionId;
    }

    return tx.vote.findMany({
      where,
      include: {
        election: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
        candidate: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Check whether a voter has already cast a vote in an election
   * @param {string} voterId 
   * @param {string} electionId 
   * @param {Object} [tx] 
   * @returns {Promise<boolean>}
   */
  async hasAlreadyVoted(voterId, electionId, tx = prisma) {
    const [voteCount, registry] = await Promise.all([
      tx.vote.count({
        where: {
          voterId,
          electionId,
        },
      }),
      tx.voterRegistry.findUnique({
        where: {
          electionId_userId: {
            electionId,
            userId: voterId,
          },
        },
      }),
    ]);

    return voteCount > 0 || Boolean(registry?.hasVoted);
  }

  /**
   * Get paginated votes for a specific election
   * @param {string} electionId 
   * @param {Object} options - { candidateId, page, limit, sortBy, sortOrder }
   * @param {Object} [tx] 
   * @returns {Promise<Object>} - { data, votes, page, limit, total, totalPages }
   */
  async getVotesByElection(electionId, { candidateId, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = {}, tx = prisma) {
    const where = { electionId };

    if (candidateId) {
      where.candidateId = candidateId;
    }

    const { page: parsedPage, limit: parsedLimit, skip, take } = getPaginationParams({ page, limit });
    const direction = String(sortOrder).toLowerCase() === 'asc' ? 'asc' : 'desc';

    const [votes, total] = await Promise.all([
      tx.vote.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy]: direction },
        include: {
          candidate: {
            select: {
              id: true,
              fullName: true,
            },
          },
          voter: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      tx.vote.count({ where }),
    ]);

    const formatted = formatPaginatedResponse(votes, total, parsedPage, parsedLimit);
    return {
      ...formatted,
      votes: formatted.data,
    };
  }

  /**
   * Save or update transaction receipt for a vote
   * @param {string} voteId 
   * @param {string} receiptCode 
   * @param {string} [blockchainTransactionId] 
   * @param {Object} [tx] 
   * @returns {Promise<Object>}
   */
  async saveReceipt(voteId, receiptCode, blockchainTransactionId = null, tx = prisma) {
    const updateData = { transactionReceipt: receiptCode };
    if (blockchainTransactionId) {
      updateData.blockchainTransactionId = blockchainTransactionId;
    }

    return tx.vote.update({
      where: { id: voteId },
      data: updateData,
    });
  }

  /**
   * Get voter registry entry for a specific user and election
   * @param {string} electionId 
   * @param {string} userId 
   * @param {Object} [tx] 
   * @returns {Promise<Object|null>}
   */
  async getVoterRegistry(electionId, userId, tx = prisma) {
    return tx.voterRegistry.findUnique({
      where: {
        electionId_userId: {
          electionId,
          userId,
        },
      },
    });
  }

  /**
   * Mark a voter as having cast their vote in an election
   * @param {string} electionId 
   * @param {string} userId 
   * @param {Object} [tx] 
   * @returns {Promise<Object>}
   */
  async markVoterHasVoted(electionId, userId, tx = prisma) {
    return tx.voterRegistry.upsert({
      where: {
        electionId_userId: {
          electionId,
          userId,
        },
      },
      update: {
        hasVoted: true,
        votedAt: new Date(),
      },
      create: {
        electionId,
        userId,
        hasVoted: true,
        votedAt: new Date(),
      },
    });
  }

  /**
   * Fetch the latest block in the blockchain ledger
   * @param {Object} [tx] 
   * @returns {Promise<Object|null>}
   */
  async getLatestBlock(tx = prisma) {
    return tx.voteBlock.findFirst({
      orderBy: {
        id: 'desc',
      },
    });
  }

  /**
   * Create a new vote block in the ledger
   * @param {Object} blockData - { previousHash, hash, nonce, timestamp }
   * @param {Object} [tx] 
   * @returns {Promise<Object>}
   */
  async createBlock({ previousHash, hash, nonce = 0, timestamp }, tx = prisma) {
    return tx.voteBlock.create({
      data: {
        previousHash,
        hash,
        nonce,
        timestamp: BigInt(timestamp || Date.now()),
      },
    });
  }

  /**
   * Record an anonymized vote transaction in a block
   * @param {Object} transactionData - { blockId, electionId, positionId, candidateId, voteHash }
   * @param {Object} [tx] 
   * @returns {Promise<Object>}
   */
  async recordVoteTransaction({ blockId, electionId, positionId, candidateId, voteHash }, tx = prisma) {
    return tx.voteTransaction.create({
      data: {
        blockId: BigInt(blockId),
        electionId,
        positionId,
        candidateId,
        voteHash,
      },
    });
  }

  /**
   * Create a vote receipt for a voter
   * @param {string} userId 
   * @param {string} electionId 
   * @param {string} receiptCode 
   * @param {Object} [tx] 
   * @returns {Promise<Object>}
   */
  async createVoteReceipt(userId, electionId, receiptCode, tx = prisma) {
    return tx.voteReceipt.create({
      data: {
        userId,
        electionId,
        receiptCode,
      },
    });
  }

  /**
   * Get vote receipt by user and election
   * @param {string} userId 
   * @param {string} electionId 
   * @returns {Promise<Object|null>}
   */
  async getVoteReceipt(userId, electionId) {
    return prisma.voteReceipt.findUnique({
      where: {
        electionId_userId: {
          electionId,
          userId,
        },
      },
    });
  }

  /**
   * Retrieve vote receipt by receipt code
   * @param {string} receiptCode 
   * @returns {Promise<Object|null>}
   */
  async getVoteReceiptByCode(receiptCode) {
    return prisma.voteReceipt.findUnique({
      where: {
        receiptCode,
      },
      include: {
        election: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
    });
  }

  /**
   * Aggregate vote tallies for an election grouped by position and candidate
   * @param {string} electionId 
   * @returns {Promise<Array>}
   */
  async getElectionResults(electionId) {
    const votes = await prisma.voteTransaction.groupBy({
      by: ['positionId', 'candidateId'],
      where: {
        electionId,
      },
      _count: {
        id: true,
      },
    });

    const positions = await prisma.position.findMany({
      where: { electionId },
      include: {
        candidates: {
          select: {
            id: true,
            fullName: true,
            profileImage: true,
            photoUrl: true,
            approvalStatus: true,
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    const resultMap = new Map();
    votes.forEach((v) => {
      resultMap.set(`${v.positionId}:${v.candidateId}`, v._count.id);
    });

    return positions.map((pos) => {
      const candidatesWithVotes = pos.candidates.map((cand) => {
        const voteCount = resultMap.get(`${pos.id}:${cand.id}`) || 0;
        return {
          id: cand.id,
          fullName: cand.fullName || cand.user?.name || 'Unknown Candidate',
          profileImage: cand.profileImage || cand.photoUrl,
          voteCount,
        };
      });

      candidatesWithVotes.sort((a, b) => b.voteCount - a.voteCount);

      return {
        positionId: pos.id,
        positionTitle: pos.title,
        candidates: candidatesWithVotes,
        totalVotesCast: candidatesWithVotes.reduce((sum, c) => sum + c.voteCount, 0),
      };
    });
  }

  /**
   * Find vote transaction by vote hash
   * @param {string} voteHash 
   * @returns {Promise<Object|null>}
   */
  async getVoteTransactionByHash(voteHash) {
    return prisma.voteTransaction.findFirst({
      where: {
        voteHash,
      },
      include: {
        block: true,
        election: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
        position: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
  }
}

export const voteRepository = new VoteRepository();
export default voteRepository;
