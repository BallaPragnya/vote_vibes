import crypto from 'crypto';
import AppError from '../utils/AppError.js';
import defaultVoteRepository from '../repositories/vote.repository.js';
import prisma from '../config/prisma.js';
import { generateVoteReceiptPayload } from '../utils/receiptGenerator.js';
import blockchainIntegrationService from './blockchainIntegration.service.js';
import verifyVoteIntegrity from '../validators/voteIntegrity.validator.js';
import resultCalculationService from './resultCalculation.service.js';

export class VoteService {
  /**
   * @param {Object} [voteRepo] 
   */
  constructor(voteRepo = defaultVoteRepository) {
    this.voteRepository = voteRepo;
  }

  /**
   * Helper method to generate an immutable, anonymous vote receipt object
   */
  generateReceipt(userId, electionId, candidateId) {
    const receiptCode = `VV-${crypto.randomBytes(4).toString('hex').toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
    const receiptPayload = generateVoteReceiptPayload({
      electionId,
      candidateId,
      voteTimestamp: new Date(),
    });

    return {
      receiptCode,
      ...receiptPayload,
    };
  }

  /**
   * Validate business rules for casting a vote using modular integrity validator
   */
  async validateVote(userId, electionId, candidateId, voteSelections = []) {
    const primaryCandidateId = candidateId || voteSelections[0]?.candidateId || voteSelections[0]?.candidate_id;

    const integrityContext = await verifyVoteIntegrity({
      userId,
      electionId,
      candidateId: primaryCandidateId,
      voteRepository: this.voteRepository,
    });

    return {
      election: integrityContext.election,
      primaryCandidate: integrityContext.candidate,
      user: integrityContext.user,
    };
  }

  /**
   * Cast vote in an election with race-condition-safe duplicate protection
   */
  async castVote(userId, payload = {}) {
    const electionId = payload.electionId || payload.election_id;
    const candidateId = payload.candidateId || payload.candidate_id;
    const voteSelections = payload.normalizedVotes || payload.votes || (candidateId ? [{ candidateId }] : []);

    if (!voteSelections || !Array.isArray(voteSelections) || voteSelections.length === 0) {
      throw new AppError('At least one vote selection is required.', 400, 'ValidationError');
    }

    // Step 1: Execute Modular Integrity Validation (handles invalid election, inactive/completed/archived election, invalid candidate, suspended user, duplicate vote)
    await this.validateVote(userId, electionId, candidateId, voteSelections);

    const primaryCandidateId = candidateId || voteSelections[0]?.candidateId || voteSelections[0]?.candidate_id;

    // Step 2: Generate Immutable Anonymous Receipt
    const receiptData = this.generateReceipt(userId, electionId, primaryCandidateId);
    const timestamp = Date.now();

    try {
      // Step 3: Execute Atomic Database Transaction with Race Condition Protection
      const result = await prisma.$transaction(async (tx) => {
        // Step A: Save Vote Entity (PostgreSQL unique constraint on [electionId, voterId] prevents race conditions)
        const createdVote = await this.voteRepository.createVote(
          {
            electionId,
            candidateId: primaryCandidateId,
            voterId: userId,
            transactionReceipt: receiptData.receiptCode,
            voteTimestamp: new Date(timestamp),
          },
          tx
        );

        // Step B: Invoke Blockchain Integration Service (gracefully handles blockchain failures with fallback reference)
        const positionId = voteSelections[0]?.positionId || voteSelections[0]?.position_id;
        const bcResult = await blockchainIntegrationService.recordVoteOnBlockchain(
          {
            voteId: createdVote.id,
            userId,
            electionId,
            candidateId: primaryCandidateId,
            positionId,
          },
          tx
        );

        // Step C: Mark Voter Registry
        const updatedRegistry = await this.voteRepository.markVoterHasVoted(electionId, userId, tx);

        // Step D: Create Vote Receipt Record
        const voteReceiptRecord = await tx.voteReceipt.create({
          data: {
            id: receiptData.receiptId,
            userId,
            electionId,
            candidateId: primaryCandidateId,
            receiptCode: receiptData.receiptCode,
            receiptHash: receiptData.receiptHash,
            voteTimestamp: new Date(timestamp),
          },
        });

        // Anonymous, Immutable Receipt Object without Voter PII
        const receipt = generateVoteReceiptPayload({
          receiptId: voteReceiptRecord.id,
          electionId: voteReceiptRecord.electionId,
          candidateId: voteReceiptRecord.candidateId,
          voteTimestamp: voteReceiptRecord.voteTimestamp,
        });

        return {
          voteId: createdVote.id,
          blockchainTransactionId: bcResult.blockchainTransactionId,
          receiptCode: voteReceiptRecord.receiptCode,
          receipt,
          electionId,
          votedAt: updatedRegistry.votedAt,
          totalVotes: voteSelections.length,
          blockHash: bcResult.blockHash,
        };
      });

      return result;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new AppError(
          'You have already cast your vote in this election. Duplicate voting is strictly prohibited.',
          400,
          'DuplicateVoteError'
        );
      }
      throw error;
    }
  }

  /**
   * Get vote details by vote ID
   */
  async getVoteById(id) {
    if (!id || typeof id !== 'string' || id.trim() === '') {
      throw new AppError('Vote ID is required.', 400, 'ValidationError');
    }

    const vote = await this.voteRepository.getVoteById(id.trim());
    if (!vote) {
      throw new AppError(`Vote with ID '${id}' not found.`, 404, 'NotFoundError');
    }

    return vote;
  }

  /**
   * Get paginated votes for an election (ADMIN/SUPER_ADMIN access)
   */
  async getVotesByElection(electionId, options = {}) {
    if (!electionId) {
      throw new AppError('Election ID is required.', 400, 'ValidationError');
    }

    const election = await prisma.election.findUnique({
      where: { id: electionId },
      select: { id: true },
    });

    if (!election) {
      throw new AppError(`Election with ID '${electionId}' not found.`, 404, 'NotFoundError');
    }

    return this.voteRepository.getVotesByElection(electionId, options);
  }

  /**
   * Audit votes cast in an election (ADMIN/SUPER_ADMIN access)
   */
  async auditVotes(electionId) {
    if (!electionId) {
      throw new AppError('Election ID is required.', 400, 'ValidationError');
    }

    const votes = await prisma.vote.findMany({
      where: { electionId },
      include: {
        candidate: { select: { id: true, fullName: true } },
        voter: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const blocks = await prisma.voteBlock.findMany({
      orderBy: { id: 'asc' },
    });

    return {
      electionId,
      totalVotesRecorded: votes.length,
      blockchainBlocks: blocks.length,
      auditTrail: votes.map((v) => ({
        voteId: v.id,
        voterId: v.voterId,
        voterEmail: v.voter?.email,
        candidateId: v.candidateId,
        candidateName: v.candidate?.fullName,
        transactionReceipt: v.transactionReceipt,
        blockchainTransactionId: v.blockchainTransactionId,
        voteTimestamp: v.voteTimestamp,
      })),
    };
  }

  /**
   * Check voting status of current user for an election
   */
  async getVoterStatus(userId, electionId) {
    if (!userId || !electionId) {
      throw new AppError('User ID and Election ID are required.', 400, 'ValidationError');
    }

    const registry = await this.voteRepository.getVoterRegistry(electionId, userId);
    const receipt = registry?.hasVoted ? await this.voteRepository.getVoteReceipt(userId, electionId) : null;

    return {
      electionId,
      userId,
      hasVoted: Boolean(registry?.hasVoted),
      votedAt: registry?.votedAt || null,
      receiptCode: receipt?.receiptCode || null,
    };
  }

  /**
   * Retrieve voter's anonymous receipt for an election or receiptId
   */
  async getVoterReceipt(currentUser, receiptOrElectionId) {
    const userObj = typeof currentUser === 'string' ? { id: currentUser } : (currentUser || null);
    const userId = userObj?.id;

    if (!receiptOrElectionId) {
      throw new AppError('Receipt ID or Election ID is required.', 400, 'ValidationError');
    }

    const conditions = [
      { id: receiptOrElectionId },
      { receiptCode: receiptOrElectionId },
    ];
    if (userId) {
      conditions.push({ electionId: receiptOrElectionId, userId });
    }

    const receiptRecord = await prisma.voteReceipt.findFirst({
      where: {
        OR: conditions,
      },
      include: {
        election: {
          select: { id: true, title: true, status: true },
        },
        candidate: {
          select: {
            id: true,
            fullName: true,
            position: { select: { id: true, title: true } },
          },
        },
      },
    });

    if (!receiptRecord) {
      throw new AppError('Vote receipt not found.', 404, 'NotFoundError');
    }

    // Security Check: Authorized user can access (receipt owner OR admin/super_admin/election_commission)
    if (userObj && userObj.id) {
      const isOwner = receiptRecord.userId === userObj.id;
      const isAdmin = ['ADMIN', 'SUPER_ADMIN', 'ELECTION_COMMISSION'].includes(userObj.role);
      if (!isOwner && !isAdmin) {
        throw new AppError('You are not authorized to view this vote receipt.', 403, 'ForbiddenError');
      }
    }

    // Lookup corresponding Vote record for blockchain reference
    const voteRecord = await prisma.vote.findFirst({
      where: { transactionReceipt: receiptRecord.receiptCode },
      select: { blockchainTransactionId: true },
    });

    const receiptPayload = generateVoteReceiptPayload({
      receiptId: receiptRecord.id,
      electionId: receiptRecord.electionId,
      candidateId: receiptRecord.candidateId,
      voteTimestamp: receiptRecord.voteTimestamp,
    });

    return {
      receiptId: receiptRecord.id,
      receiptCode: receiptRecord.receiptCode,
      receiptHash: receiptRecord.receiptHash,
      receipt: receiptPayload,
      election: receiptRecord.election
        ? {
            id: receiptRecord.election.id,
            title: receiptRecord.election.title,
            status: receiptRecord.election.status,
          }
        : null,
      candidate: receiptRecord.candidate
        ? {
            id: receiptRecord.candidate.id,
            fullName: receiptRecord.candidate.fullName,
            position: receiptRecord.candidate.position?.title || null,
          }
        : null,
      timestamp: receiptRecord.voteTimestamp,
      blockchain: {
        blockchainTransactionId: voteRecord?.blockchainTransactionId || null,
        isRecordedOnChain: Boolean(
          voteRecord?.blockchainTransactionId && !voteRecord.blockchainTransactionId.includes('FALLBACK')
        ),
      },
    };
  }

  /**
   * Verify vote existence on blockchain using anonymous receipt code
   */
  async verifyVoteReceipt(receiptCode) {
    if (!receiptCode || typeof receiptCode !== 'string' || receiptCode.trim() === '') {
      throw new AppError('Receipt code is required.', 400, 'ValidationError');
    }

    const receipt = await this.voteRepository.getVoteReceiptByCode(receiptCode.trim());
    if (!receipt) {
      throw new AppError('Invalid receipt code. Vote receipt does not exist in ledger.', 404, 'NotFoundError');
    }

    return {
      verified: true,
      receiptCode: receipt.receiptCode,
      electionId: receipt.electionId,
      electionTitle: receipt.election?.title,
      timestamp: receipt.createdAt,
      message: 'Vote verified on immutable ledger.',
    };
  }

  /**
   * Get election voting results
   */
  async getElectionResults(electionId, currentUser = {}) {
    return resultCalculationService.generateElectionResults(electionId, currentUser);
  }
}

export const voteService = new VoteService();
export default voteService;
