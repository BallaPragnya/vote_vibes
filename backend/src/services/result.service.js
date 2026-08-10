import AppError from '../utils/AppError.js';
import prisma from '../config/prisma.js';
import { calculateElectionStatus } from './electionState.service.js';
import analyticsService from './analytics.service.js';
import { generateElectionReportPDF as buildPDFBuffer } from '../utils/pdfReportGenerator.js';

export class ResultService {
  /**
   * Validate if election exists and is eligible for result calculation
   * 
   * @param {Object} election 
   * @param {Date|number|string} [now=new Date()] 
   */
  validateEligibility(election, now = new Date()) {
    if (!election) {
      throw new AppError('Election not found.', 404, 'NotFoundError');
    }

    const currentTime = new Date(now);
    const endTime = new Date(election.endTime);

    if (['DRAFT', 'CANCELLED', 'ARCHIVED'].includes(election.status)) {
      throw new AppError(
        `Election results cannot be calculated for an election in '${election.status}' status.`,
        400,
        'InvalidStateError'
      );
    }

    const computedStatus = calculateElectionStatus(election, currentTime);
    if (computedStatus !== 'COMPLETED' || currentTime < endTime) {
      throw new AppError(
        'Election results can only be calculated when election status is COMPLETED and voting has ended.',
        400,
        'InvalidStateError'
      );
    }

    return true;
  }

  /**
   * Helper to fetch election record with positions & candidates
   */
  async getElectionRecord(electionId, tx = prisma) {
    if (!electionId || typeof electionId !== 'string' || electionId.trim() === '') {
      throw new AppError('Election ID is required.', 400, 'ValidationError');
    }

    const trimmedId = electionId.trim();
    const election = await tx.election.findUnique({
      where: { id: trimmedId },
      include: {
        positions: {
          orderBy: { displayOrder: 'asc' },
          include: {
            candidates: {
              include: {
                user: {
                  select: { id: true, name: true, email: true },
                },
              },
            },
          },
        },
        candidates: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });

    if (!election) {
      throw new AppError(`Election with ID '${trimmedId}' not found.`, 404, 'NotFoundError');
    }

    return election;
  }

  /**
   * Calculate winner, candidate-wise vote counts, total votes, and rankings for an election
   * 
   * @param {string} electionId 
   * @param {Date|number|string} [now=new Date()] 
   * @returns {Promise<Object>}
   */
  /**
   * Helper method to fetch candidate-wise vote count map
   * 
   * @param {string} electionId 
   * @param {Object} [tx=prisma] 
   * @returns {Promise<Map<string, number>>}
   */
  async fetchVoteCountsMap(electionId, tx = prisma) {
    const voteTxGroup = await tx.voteTransaction.groupBy({
      by: ['candidateId'],
      where: { electionId },
      _count: { id: true },
    });

    const rawVoteGroup = await tx.vote.groupBy({
      by: ['candidateId'],
      where: { electionId },
      _count: { id: true },
    });

    const voteCountsMap = new Map();

    voteTxGroup.forEach((row) => {
      voteCountsMap.set(row.candidateId, row._count.id);
    });

    rawVoteGroup.forEach((row) => {
      if (!voteCountsMap.has(row.candidateId)) {
        voteCountsMap.set(row.candidateId, row._count.id);
      }
    });

    return voteCountsMap;
  }

  /**
   * Calculate winner, candidate-wise vote counts, total votes, and rankings for an election
   * 
   * @param {string} electionId 
   * @param {Date|number|string} [now=new Date()] 
   * @param {Object} [tx=prisma] 
   * @returns {Promise<Object>}
   */
  async calculateElectionResult(electionId, now = new Date(), tx = prisma) {
    const election = await this.getElectionRecord(electionId, tx);
    this.validateEligibility(election, now);

    const trimmedId = election.id;
    const voteCountsMap = await this.fetchVoteCountsMap(trimmedId, tx);

    // Extract all candidates in election
    let candidateList = [];
    if (Array.isArray(election.candidates) && election.candidates.length > 0) {
      candidateList = election.candidates;
    } else if (Array.isArray(election.positions)) {
      election.positions.forEach((pos) => {
        if (Array.isArray(pos.candidates)) {
          candidateList.push(...pos.candidates);
        }
      });
    }

    // Deduplicate candidates
    const candidateMap = new Map();
    candidateList.forEach((c) => candidateMap.set(c.id, c));
    const uniqueCandidates = Array.from(candidateMap.values());

    // Build candidate-wise vote count map and total votes count
    let totalVotes = 0;
    const voteCounts = {};

    const candidateMetrics = uniqueCandidates.map((cand) => {
      const count = voteCountsMap.get(cand.id) || 0;
      totalVotes += count;
      voteCounts[cand.id] = count;

      return {
        id: cand.id,
        fullName: cand.fullName || cand.name || cand.user?.name || 'Unknown Candidate',
        profileImage: cand.profileImage || cand.photoUrl || null,
        positionId: cand.positionId || null,
        voteCount: count,
        percentage: 0,
      };
    });

    // Calculate vote percentages
    candidateMetrics.forEach((cand) => {
      cand.percentage = totalVotes > 0
        ? Number(((cand.voteCount / totalVotes) * 100).toFixed(2))
        : 0;
    });

    // Rank candidates by voteCount descending, then fullName ascending
    candidateMetrics.sort((a, b) => {
      if (b.voteCount !== a.voteCount) {
        return b.voteCount - a.voteCount;
      }
      return a.fullName.localeCompare(b.fullName);
    });

    // Compute rank numbers (1, 2, 3...) with equal ranks for ties
    let currentRank = 1;
    const rankings = candidateMetrics.map((cand, index) => {
      if (index > 0 && cand.voteCount < candidateMetrics[index - 1].voteCount) {
        currentRank = index + 1;
      }
      return {
        rank: currentRank,
        candidateId: cand.id,
        fullName: cand.fullName,
        profileImage: cand.profileImage,
        positionId: cand.positionId,
        voteCount: cand.voteCount,
        percentage: cand.percentage,
        isWinner: false,
      };
    });

    // Determine Winner and Detect Ties
    let winner = null;
    let isTie = false;

    if (totalVotes > 0 && rankings.length > 0) {
      const topVoteCount = rankings[0].voteCount;
      const topRanked = rankings.filter((r) => r.voteCount === topVoteCount);

      if (topRanked.length > 1) {
        isTie = true;
        topRanked.forEach((r) => { r.isWinner = true; });
        winner = {
          isTie: true,
          winningStatus: 'TIE',
          voteCount: topVoteCount,
          winners: topRanked.map((w) => ({
            id: w.candidateId,
            fullName: w.fullName,
            voteCount: w.voteCount,
            percentage: w.percentage,
          })),
        };
      } else if (topRanked.length === 1) {
        topRanked[0].isWinner = true;
        winner = {
          isTie: false,
          winningStatus: 'SINGLE_WINNER',
          id: topRanked[0].candidateId,
          fullName: topRanked[0].fullName,
          voteCount: topRanked[0].voteCount,
          percentage: topRanked[0].percentage,
        };
      }
    }

    return {
      electionId: election.id,
      electionTitle: election.title,
      status: election.status,
      winner,
      rankings,
      voteCounts,
      totalVotes,
      isTie,
    };
  }

  /**
   * Endpoint Handler helper for GET /results/:id
   * Returns { winner, voteCounts, rankings }
   */
  async getElectionResult(electionId, now = new Date()) {
    const fullResult = await this.calculateElectionResult(electionId, now);

    return {
      electionId: fullResult.electionId,
      electionTitle: fullResult.electionTitle,
      winner: fullResult.winner,
      voteCounts: fullResult.voteCounts,
      rankings: fullResult.rankings,
    };
  }

  /**
   * Endpoint Handler helper for GET /results/:id/stats
   * Returns { turnout, totalVoters, totalVotes, rejectedVotes }
   */
  async getElectionStats(electionId, now = new Date()) {
    const election = await this.getElectionRecord(electionId);
    this.validateEligibility(election, now);

    const turnoutData = await analyticsService.calculateElectionTurnout(election.id);

    return {
      electionId: election.id,
      electionTitle: election.title,
      turnout: turnoutData.turnoutPercentage,
      totalVoters: turnoutData.eligibleVoters,
      totalVotes: turnoutData.votesCast,
      rejectedVotes: 0, // All votes on immutable ledger are verified and valid
    };
  }

  /**
   * Endpoint Handler helper for GET /results/:id/rankings
   * Returns sorted candidates list
   */
  async getElectionRankings(electionId, now = new Date()) {
    const fullResult = await this.calculateElectionResult(electionId, now);
    return fullResult.rankings;
  }

  /**
   * Endpoint Handler helper for GET /results/:id/summary
   * Returns complete election summary for single-request frontend rendering
   * 
   * Includes:
   * - election: Election object details
   * - winner: Winner object or tie details
   * - rankings: Sorted candidate rankings
   * - voteCounts: Candidate-wise vote count map
   * - turnout: Turnout metrics (eligibleVoters, votesCast, turnoutPercentage)
   * - analytics: Demographic analytics breakdown
   * - timestamp: ISO timestamp of report generation
   */
  async getElectionSummary(electionId, now = new Date()) {
    const election = await this.getElectionRecord(electionId);
    this.validateEligibility(election, now);

    const [fullResult, turnoutData, analyticsData] = await Promise.all([
      this.calculateElectionResult(electionId, now),
      analyticsService.calculateElectionTurnout(election.id),
      analyticsService.getDemographicAnalytics(election.id),
    ]);

    return {
      election: {
        id: election.id,
        title: election.title,
        description: election.description,
        status: election.status,
        startTime: election.startTime,
        endTime: election.endTime,
        isDepartmentRestricted: election.isDepartmentRestricted,
        createdAt: election.createdAt,
      },
      winner: fullResult.winner,
      rankings: fullResult.rankings,
      voteCounts: fullResult.voteCounts,
      turnout: {
        eligibleVoters: turnoutData.eligibleVoters,
        votesCast: turnoutData.votesCast,
        turnoutPercentage: turnoutData.turnoutPercentage,
        totalVoters: turnoutData.eligibleVoters,
        totalVotes: turnoutData.votesCast,
        rejectedVotes: 0,
      },
      analytics: {
        totalVotesAnalyzed: analyticsData.totalVotesAnalyzed,
        byDepartment: analyticsData.byDepartment,
        byBranch: analyticsData.byBranch,
        byYear: analyticsData.byYear,
        byRole: analyticsData.byRole,
      },
      timestamp: new Date(now).toISOString(),
    };
  }

  /**
   * Generate professional election report PDF buffer
   * Handles missing election gracefully via 404 AppError
   * 
   * @param {string} electionId 
   * @param {Date|number|string} [now=new Date()] 
   * @returns {Promise<{ buffer: Buffer, filename: string }>}
   */
  async generateElectionReportPDF(electionId, now = new Date()) {
    const summary = await this.getElectionSummary(electionId, now);
    const buffer = await buildPDFBuffer(summary);

    const safeTitle = (summary.election.title || 'Election').replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `Election_Report_${safeTitle}_${summary.election.id.slice(0, 8)}.pdf`;

    return {
      buffer,
      filename,
      electionId: summary.election.id,
    };
  }
}

export const resultService = new ResultService();
export default resultService;
