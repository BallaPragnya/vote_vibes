import AppError from '../utils/AppError.js';
import prisma from '../config/prisma.js';

export class AnalyticsService {
  /**
   * Calculate voter turnout statistics for an election
   * 
   * @param {string} electionId 
   * @param {Object} [tx=prisma] 
   * @returns {Promise<Object>}
   */
  async calculateElectionTurnout(electionId, tx = prisma) {
    if (!electionId || typeof electionId !== 'string' || electionId.trim() === '') {
      throw new AppError('Election ID is required.', 400, 'ValidationError');
    }

    const trimmedId = electionId.trim();

    const election = await tx.election.findUnique({
      where: { id: trimmedId },
      include: {
        departments: true,
      },
    });

    if (!election) {
      throw new AppError(`Election with ID '${trimmedId}' not found.`, 404, 'NotFoundError');
    }

    let eligibleVoters = await tx.voterRegistry.count({
      where: { electionId: trimmedId },
    });

    if (eligibleVoters === 0) {
      if (election.isDepartmentRestricted && Array.isArray(election.departments) && election.departments.length > 0) {
        const departmentIds = election.departments.map((d) => d.departmentId);
        eligibleVoters = await tx.user.count({
          where: {
            status: 'VERIFIED',
            departmentId: { in: departmentIds },
          },
        });
      } else {
        eligibleVoters = await tx.user.count({
          where: { status: 'VERIFIED' },
        });
      }
    }

    const votesCast = await tx.vote.count({
      where: { electionId: trimmedId },
    });

    const turnoutPercentage = eligibleVoters > 0
      ? Number(((votesCast / eligibleVoters) * 100).toFixed(2))
      : 0;

    return {
      electionId: election.id,
      electionTitle: election.title,
      eligibleVoters,
      votesCast,
      turnoutPercentage,
      totalVoters: eligibleVoters,
      totalVotes: votesCast,
      turnout: turnoutPercentage,
    };
  }

  async calculateTurnout(electionId, tx = prisma) {
    return this.calculateElectionTurnout(electionId, tx);
  }

  /**
   * Helper function to extract academic year from student ID or timestamp
   */
  _extractYear(studentIdNumber, createdAt) {
    if (studentIdNumber && typeof studentIdNumber === 'string') {
      // Look for 4-digit year e.g. 2023, 2024, 2025 anywhere in string
      const year4Match = studentIdNumber.match(/(20\d{2})/);
      if (year4Match) return `Year ${year4Match[1]}`;

      // Look for 2-digit year prefix e.g. 23CSE101 -> 2023
      const year2Match = studentIdNumber.match(/^(\d{2})[a-zA-Z]/);
      if (year2Match) return `Year 20${year2Match[1]}`;
    }

    if (createdAt) {
      const createdYear = new Date(createdAt).getFullYear();
      return `Year ${createdYear}`;
    }

    return 'Unspecified Year';
  }

  /**
   * Helper to format grouped map into Chart.js and Recharts ready payloads
   */
  _formatChartPayload(groupedMap, totalVotes) {
    const labels = Array.from(groupedMap.keys());
    const data = labels.map((label) => groupedMap.get(label));

    const rechartsData = labels.map((label) => {
      const votes = groupedMap.get(label);
      const percentage = totalVotes > 0 ? Number(((votes / totalVotes) * 100).toFixed(2)) : 0;
      return {
        name: label,
        votes,
        value: votes,
        percentage,
      };
    });

    return {
      labels,
      datasets: [
        {
          label: 'Votes',
          data,
        },
      ],
      rechartsData,
    };
  }

  /**
   * Calculate demographic breakdown of votes cast in an election.
   * Only calculates dimensions available in the database schema:
   * - Votes by Department
   * - Votes by Year / Batch
   * - Votes by Branch / Code
   * - Votes by Role
   * 
   * Returns data structured for Chart.js (labels + datasets) and Recharts (rechartsData).
   * 
   * @param {string} electionId 
   * @param {Object} [tx=prisma] 
   * @returns {Promise<Object>}
   */
  async getDemographicAnalytics(electionId, tx = prisma) {
    if (!electionId || typeof electionId !== 'string' || electionId.trim() === '') {
      throw new AppError('Election ID is required.', 400, 'ValidationError');
    }

    const trimmedId = electionId.trim();

    const election = await tx.election.findUnique({
      where: { id: trimmedId },
      select: { id: true, title: true, status: true },
    });

    if (!election) {
      throw new AppError(`Election with ID '${trimmedId}' not found.`, 404, 'NotFoundError');
    }

    // Fetch votes cast with voter demographic relations
    const votes = await tx.vote.findMany({
      where: { electionId: trimmedId },
      include: {
        voter: {
          select: {
            id: true,
            studentIdNumber: true,
            createdAt: true,
            department: {
              select: {
                id: true,
                code: true,
                name: true,
              },
            },
            role: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    const totalVotesAnalyzed = votes.length;

    // Grouping maps
    const deptMap = new Map();
    const yearMap = new Map();
    const branchMap = new Map();
    const roleMap = new Map();

    votes.forEach((vote) => {
      const voter = vote.voter || {};

      // 1. Department dimension
      const deptName = voter.department?.name || 'Unassigned Department';
      deptMap.set(deptName, (deptMap.get(deptName) || 0) + 1);

      // 2. Branch dimension
      const branchCode = voter.department?.code || voter.department?.name || 'General';
      branchMap.set(branchCode, (branchMap.get(branchCode) || 0) + 1);

      // 3. Year / Batch dimension
      const yearLabel = this._extractYear(voter.studentIdNumber, voter.createdAt);
      yearMap.set(yearLabel, (yearMap.get(yearLabel) || 0) + 1);

      // 4. Role dimension
      const roleName = voter.role?.name || 'VOTER';
      roleMap.set(roleName, (roleMap.get(roleName) || 0) + 1);
    });

    return {
      electionId: election.id,
      electionTitle: election.title,
      totalVotesAnalyzed,
      byDepartment: this._formatChartPayload(deptMap, totalVotesAnalyzed),
      byBranch: this._formatChartPayload(branchMap, totalVotesAnalyzed),
      byYear: this._formatChartPayload(yearMap, totalVotesAnalyzed),
      byRole: this._formatChartPayload(roleMap, totalVotesAnalyzed),
      // Gender dimension note for schema transparency
      byGender: {
        labels: [],
        datasets: [{ label: 'Votes', data: [] }],
        rechartsData: [],
        note: 'Gender dimension is not stored in current database schema.',
      },
    };
  }
}

export const analyticsService = new AnalyticsService();
export default analyticsService;
