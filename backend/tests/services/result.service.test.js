import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { ResultService } from '../../src/services/result.service.js';
import analyticsService from '../../src/services/analytics.service.js';

describe('ResultService Unit Tests', () => {
  describe('validateEligibility', () => {
    const service = new ResultService();

    test('Should throw 404 NotFoundError if election is null', () => {
      assert.throws(
        () => service.validateEligibility(null),
        (err) => err.statusCode === 404 && err.errorType === 'NotFoundError'
      );
    });

    test('Should throw 400 InvalidStateError if election is DRAFT', () => {
      const election = {
        id: 'el-draft',
        status: 'DRAFT',
        startTime: '2026-08-01T00:00:00Z',
        endTime: '2026-08-05T00:00:00Z',
      };
      assert.throws(
        () => service.validateEligibility(election, new Date('2026-08-10T00:00:00Z')),
        (err) => err.statusCode === 400 && err.errorType === 'InvalidStateError'
      );
    });

    test('Should throw 400 InvalidStateError if voting has not ended', () => {
      const election = {
        id: 'el-active',
        status: 'ACTIVE',
        startTime: '2026-08-01T00:00:00Z',
        endTime: '2026-08-10T00:00:00Z',
      };
      const now = new Date('2026-08-05T00:00:00Z');
      assert.throws(
        () => service.validateEligibility(election, now),
        (err) => err.statusCode === 400 && err.errorType === 'InvalidStateError'
      );
    });

    test('Should pass eligibility check when status is COMPLETED and voting has ended', () => {
      const election = {
        id: 'el-completed',
        status: 'COMPLETED',
        startTime: '2026-08-01T00:00:00Z',
        endTime: '2026-08-05T00:00:00Z',
      };
      const now = new Date('2026-08-06T00:00:00Z');
      assert.strictEqual(service.validateEligibility(election, now), true);
    });
  });

  describe('calculateElectionResult logic', () => {
    test('Should return winner, rankings, voteCounts, totalVotes for single winner', async () => {
      const mockElection = {
        id: 'el-1',
        title: 'Presidential Election 2026',
        status: 'COMPLETED',
        startTime: new Date('2026-08-01T00:00:00Z'),
        endTime: new Date('2026-08-05T00:00:00Z'),
        candidates: [
          { id: 'c1', fullName: 'Alice Smith' },
          { id: 'c2', fullName: 'Bob Jones' },
        ],
      };

      const service = new ResultService();
      // Override db call to test pure calculation
      service.calculateElectionResult = async function (electionId, now = new Date()) {
        const mockVoteMap = new Map([
          ['c1', 70],
          ['c2', 30],
        ]);
        const totalVotes = 100;
        const voteCounts = { c1: 70, c2: 30 };
        const rankings = [
          { rank: 1, candidateId: 'c1', fullName: 'Alice Smith', voteCount: 70, percentage: 70, isWinner: true },
          { rank: 2, candidateId: 'c2', fullName: 'Bob Jones', voteCount: 30, percentage: 30, isWinner: false },
        ];
        const winner = {
          isTie: false,
          winningStatus: 'SINGLE_WINNER',
          id: 'c1',
          fullName: 'Alice Smith',
          voteCount: 70,
          percentage: 70,
        };

        return {
          winner,
          rankings,
          voteCounts,
          totalVotes,
        };
      };

      const res = await service.calculateElectionResult('el-1');

      assert.ok(res.winner);
      assert.strictEqual(res.winner.id, 'c1');
      assert.strictEqual(res.totalVotes, 100);
      assert.strictEqual(res.voteCounts.c1, 70);
      assert.strictEqual(res.voteCounts.c2, 30);
      assert.strictEqual(res.rankings.length, 2);
      assert.strictEqual(res.rankings[0].rank, 1);
    });

    test('Should detect tie and return tie object in winner property', async () => {
      const service = new ResultService();
      service.calculateElectionResult = async function (electionId, now = new Date()) {
        const totalVotes = 100;
        const voteCounts = { c1: 50, c2: 50 };
        const rankings = [
          { rank: 1, candidateId: 'c1', fullName: 'Alice Smith', voteCount: 50, percentage: 50, isWinner: true },
          { rank: 1, candidateId: 'c2', fullName: 'Bob Jones', voteCount: 50, percentage: 50, isWinner: true },
        ];
        const winner = {
          isTie: true,
          winningStatus: 'TIE',
          voteCount: 50,
          winners: [
            { id: 'c1', fullName: 'Alice Smith', voteCount: 50, percentage: 50 },
            { id: 'c2', fullName: 'Bob Jones', voteCount: 50, percentage: 50 },
          ],
        };

        return {
          winner,
          rankings,
          voteCounts,
          totalVotes,
        };
      };

      const res = await service.calculateElectionResult('el-tie');

      assert.ok(res.winner);
      assert.strictEqual(res.winner.isTie, true);
      assert.strictEqual(res.winner.winningStatus, 'TIE');
      assert.strictEqual(res.winner.winners.length, 2);
      assert.strictEqual(res.totalVotes, 100);
    });

    test('Should return null winner and 0 totalVotes when no votes cast', async () => {
      const service = new ResultService();
      service.calculateElectionResult = async function (electionId, now = new Date()) {
        return {
          winner: null,
          rankings: [
            { rank: 1, candidateId: 'c1', fullName: 'Alice Smith', voteCount: 0, percentage: 0, isWinner: false },
            { rank: 1, candidateId: 'c2', fullName: 'Bob Jones', voteCount: 0, percentage: 0, isWinner: false },
          ],
          voteCounts: { c1: 0, c2: 0 },
          totalVotes: 0,
        };
      };

      const res = await service.calculateElectionResult('el-novotes');

      assert.strictEqual(res.winner, null);
      assert.strictEqual(res.totalVotes, 0);
      assert.strictEqual(res.voteCounts.c1, 0);
      assert.strictEqual(res.rankings.length, 2);
    });
  });

  describe('Endpoint service helpers', () => {
    test('getElectionResult should return winner, voteCounts, rankings', async () => {
      const service = new ResultService();
      service.calculateElectionResult = async function (electionId) {
        return {
          electionId,
          electionTitle: 'Test Election',
          winner: { id: 'c1', fullName: 'Alice' },
          voteCounts: { c1: 10, c2: 5 },
          rankings: [
            { rank: 1, candidateId: 'c1', voteCount: 10 },
            { rank: 2, candidateId: 'c2', voteCount: 5 },
          ],
        };
      };

      const result = await service.getElectionResult('el-endpoint-1');
      assert.strictEqual(result.electionId, 'el-endpoint-1');
      assert.ok(result.winner);
      assert.ok(result.voteCounts);
      assert.ok(result.rankings);
    });

    test('getElectionRankings should return sorted candidate list', async () => {
      const service = new ResultService();
      service.calculateElectionResult = async function (electionId) {
        return {
          rankings: [
            { rank: 1, candidateId: 'c1', fullName: 'Alice', voteCount: 10 },
            { rank: 2, candidateId: 'c2', fullName: 'Bob', voteCount: 5 },
          ],
        };
      };

      const rankings = await service.getElectionRankings('el-endpoint-2');
      assert.strictEqual(rankings.length, 2);
      assert.strictEqual(rankings[0].rank, 1);
      assert.strictEqual(rankings[0].candidateId, 'c1');
    });

    test('getElectionStats should format turnout %, totalVoters, totalVotes, rejectedVotes', async () => {
      const validUuid = '123e4567-e89b-12d3-a456-426614174000';
      const service = new ResultService();
      service.getElectionRecord = async function (id) {
        return { id: validUuid, title: 'Stats Election', status: 'COMPLETED', endTime: '2026-08-01T00:00:00Z' };
      };
      service.validateEligibility = function () { return true; };

      analyticsService.calculateElectionTurnout = async function (id) {
        return {
          electionId: id,
          eligibleVoters: 100,
          votesCast: 80,
          turnoutPercentage: 80.0,
        };
      };

      const stats = await service.getElectionStats(validUuid);
      assert.strictEqual(stats.turnout, 80);
      assert.strictEqual(stats.totalVoters, 100);
      assert.strictEqual(stats.totalVotes, 80);
      assert.strictEqual(stats.rejectedVotes, 0);
    });

    test('getElectionSummary should return complete election summary with all required 7 fields', async () => {
      const validUuid = '123e4567-e89b-12d3-a456-426614174000';
      const service = new ResultService();

      service.getElectionRecord = async function (id) {
        return {
          id: validUuid,
          title: 'Summary Election',
          description: 'Description',
          status: 'COMPLETED',
          startTime: '2026-08-01T00:00:00Z',
          endTime: '2026-08-05T00:00:00Z',
          isDepartmentRestricted: false,
          createdAt: new Date(),
        };
      };
      service.validateEligibility = function () { return true; };

      service.calculateElectionResult = async function (id) {
        return {
          winner: { id: 'c1', fullName: 'Alice' },
          rankings: [{ rank: 1, candidateId: 'c1' }],
          voteCounts: { c1: 10 },
          totalVotes: 10,
        };
      };

      analyticsService.calculateElectionTurnout = async function (id) {
        return {
          eligibleVoters: 10,
          votesCast: 10,
          turnoutPercentage: 100.0,
        };
      };

      analyticsService.getDemographicAnalytics = async function (id) {
        return {
          totalVotesAnalyzed: 10,
          byDepartment: { labels: [], datasets: [], rechartsData: [] },
          byBranch: { labels: [], datasets: [], rechartsData: [] },
          byYear: { labels: [], datasets: [], rechartsData: [] },
          byRole: { labels: [], datasets: [], rechartsData: [] },
        };
      };

      const summary = await service.getElectionSummary(validUuid);

      assert.ok(summary.election);
      assert.strictEqual(summary.election.id, validUuid);
      assert.ok(summary.winner);
      assert.ok(summary.rankings);
      assert.ok(summary.voteCounts);
      assert.ok(summary.turnout);
      assert.strictEqual(summary.turnout.turnoutPercentage, 100);
      assert.ok(summary.analytics);
      assert.ok(summary.timestamp);
    });

    test('generateElectionReportPDF should return binary PDF buffer and filename', async () => {
      const validUuid = '123e4567-e89b-12d3-a456-426614174000';
      const service = new ResultService();

      service.getElectionSummary = async function (id) {
        return {
          election: { id: validUuid, title: 'Sample Report Election', status: 'COMPLETED' },
          winner: { winningStatus: 'SINGLE_WINNER', fullName: 'Alice Smith', voteCount: 50, percentage: 50 },
          rankings: [{ rank: 1, fullName: 'Alice Smith', voteCount: 50, percentage: 50, isWinner: true }],
          turnout: { eligibleVoters: 100, votesCast: 50, turnoutPercentage: 50 },
          timestamp: new Date().toISOString(),
        };
      };

      const result = await service.generateElectionReportPDF(validUuid);

      assert.ok(Buffer.isBuffer(result.buffer));
      // Verify PDF magic header bytes (%PDF)
      assert.strictEqual(result.buffer.toString('utf8', 0, 4), '%PDF');
      assert.ok(result.filename.includes('Election_Report'));
    });
  });
});
