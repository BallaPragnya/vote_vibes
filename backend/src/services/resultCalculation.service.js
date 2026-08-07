import AppError from '../utils/AppError.js';
import prisma from '../config/prisma.js';
import { calculateElectionStatus } from './electionState.service.js';
import { calculatePositionResults, summarizeElectionResults } from '../utils/resultCalculator.js';
import defaultVoteRepository from '../repositories/vote.repository.js';
import defaultElectionRepository from '../repositories/election.repository.js';

export class ResultCalculationService {
  /**
   * @param {Object} [electionRepo] 
   * @param {Object} [voteRepo] 
   */
  constructor(electionRepo = defaultElectionRepository, voteRepo = defaultVoteRepository) {
    this.electionRepository = electionRepo;
    this.voteRepository = voteRepo;
  }

  /**
   * Validate if election is eligible for result generation
   * Requirements:
   * 1. Election exists
   * 2. Status must be COMPLETED (not DRAFT, CANCELLED, ARCHIVED, UPCOMING, or ACTIVE)
   * 3. Voting must have ended (currentTime >= endTime)
   * 
   * @param {Object} election 
   * @param {Date|number|string} [now=new Date()] 
   */
  validateElectionEligibility(election, now = new Date()) {
    if (!election) {
      throw new AppError('Election not found.', 404, 'NotFoundError');
    }

    const currentTime = new Date(now);
    const endTime = new Date(election.endTime);

    // Rule 1: DRAFT, CANCELLED, ARCHIVED elections cannot generate results (Invalid elections)
    if (['DRAFT', 'CANCELLED', 'ARCHIVED'].includes(election.status)) {
      throw new AppError(
        `Election results cannot be generated for an election in '${election.status}' status.`,
        400,
        'InvalidStateError'
      );
    }

    // Rule 2: Determine dynamic state based on current time
    const computedStatus = calculateElectionStatus(election, currentTime);

    // Rule 3: Must be COMPLETED and currentTime >= endTime
    if (computedStatus !== 'COMPLETED' || currentTime < endTime) {
      throw new AppError(
        'Election results can only be generated after voting has ended and election status is COMPLETED.',
        400,
        'InvalidStateError'
      );
    }

    return true;
  }

  /**
   * Fetch positions and build vote tally map for an election
   * 
   * @param {string} electionId 
   * @returns {Promise<{ positions: Array, voteMap: Map<string, number> }>}
   */
  async getElectionDataAndTallies(electionId) {
    // Fetch election with positions and candidates
    const election = await prisma.election.findUnique({
      where: { id: electionId },
      include: {
        positions: {
          orderBy: { displayOrder: 'asc' },
          include: {
            candidates: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!election) {
      throw new AppError(`Election with ID '${electionId}' not found.`, 404, 'NotFoundError');
    }

    // Fetch vote transactions from blockchain transactions table
    const voteTxGroup = await prisma.voteTransaction.groupBy({
      by: ['positionId', 'candidateId'],
      where: { electionId },
      _count: { id: true },
    });

    // Also fetch raw votes table as fallback
    const rawVoteGroup = await prisma.vote.groupBy({
      by: ['candidateId'],
      where: { electionId },
      _count: { id: true },
    });

    const voteMap = new Map();

    // Populate from voteTransaction group
    voteTxGroup.forEach((row) => {
      voteMap.set(`${row.positionId}:${row.candidateId}`, row._count.id);
      voteMap.set(row.candidateId, row._count.id);
    });

    // Populate/merge from raw votes if transaction group had missing entries
    rawVoteGroup.forEach((row) => {
      if (!voteMap.has(row.candidateId)) {
        voteMap.set(row.candidateId, row._count.id);
      }
    });

    return { election, voteMap };
  }

  /**
   * Core workflow: Generate election results with full tallies, winners, tie handling, and zero-vote handling
   * 
   * @param {string} electionId 
   * @param {Object} [currentUser={}] 
   * @param {Date|number|string} [now=new Date()] 
   * @returns {Promise<Object>}
   */
  async generateElectionResults(electionId, currentUser = {}, now = new Date()) {
    if (!electionId || typeof electionId !== 'string' || electionId.trim() === '') {
      throw new AppError('Election ID is required.', 400, 'ValidationError');
    }

    const trimmedId = electionId.trim();
    const { election, voteMap } = await this.getElectionDataAndTallies(trimmedId);

    // Validate eligibility: status === COMPLETED and voting has ended
    this.validateElectionEligibility(election, now);

    // Calculate position results
    const positionResults = (election.positions || []).map((position) => {
      return calculatePositionResults(position, voteMap);
    });

    // Summarize election results
    const summary = summarizeElectionResults(election, positionResults);

    return summary;
  }

  /**
   * Get high-level winner summary for an election
   * 
   * @param {string} electionId 
   * @param {Object} [currentUser={}] 
   * @param {Date|number|string} [now=new Date()] 
   * @returns {Promise<Object>}
   */
  async getElectionResultSummary(electionId, currentUser = {}, now = new Date()) {
    const fullResults = await this.generateElectionResults(electionId, currentUser, now);

    const winnersSummary = fullResults.positionResults.map((pos) => ({
      positionId: pos.positionId,
      positionTitle: pos.positionTitle,
      winningStatus: pos.winningStatus,
      isTie: pos.isTie,
      totalVotesCast: pos.totalVotesCast,
      winners: pos.winners.map((w) => ({
        id: w.id,
        fullName: w.fullName,
        voteCount: w.voteCount,
        percentage: w.percentage,
      })),
    }));

    return {
      electionId: fullResults.electionId,
      electionTitle: fullResults.electionTitle,
      status: fullResults.status,
      summaryMetrics: fullResults.summaryMetrics,
      winners: winnersSummary,
    };
  }
}

export const resultCalculationService = new ResultCalculationService();
export default resultCalculationService;
