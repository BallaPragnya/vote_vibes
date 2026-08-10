import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import resultService, { ResultService } from '../../src/services/result.service.js';
import analyticsService, { AnalyticsService } from '../../src/services/analytics.service.js';
import { ExportService } from '../../src/services/export.service.js';
import { calculatePositionResults } from '../../src/utils/resultCalculator.js';

describe('Result APIs Comprehensive Backend Test Suite', () => {
  const sampleUuid = '123e4567-e89b-12d3-a456-426614174000';

  // 1. Winner Calculation Test
  describe('Winner Calculation', () => {
    test('Should accurately calculate single winner with majority vote tally', async () => {
      const service = new ResultService();

      service.getElectionRecord = async () => ({
        id: sampleUuid,
        title: 'Presidential Election',
        status: 'COMPLETED',
        endTime: '2026-08-01T00:00:00Z',
        candidates: [
          { id: 'c1', fullName: 'Candidate One' },
          { id: 'c2', fullName: 'Candidate Two' },
        ],
      });
      service.validateEligibility = () => true;

      // Mock vote tallies via fetchVoteCountsMap
      service.fetchVoteCountsMap = async () => new Map([
        ['c1', 750],
        ['c2', 250],
      ]);

      const res = await service.calculateElectionResult(sampleUuid);

      assert.strictEqual(res.totalVotes, 1000);
      assert.ok(res.winner);
      assert.strictEqual(res.winner.isTie, false);
      assert.strictEqual(res.winner.id, 'c1');
      assert.strictEqual(res.winner.voteCount, 750);
      assert.strictEqual(res.winner.percentage, 75);
    });
  });

  // 2. Tie Handling Test
  describe('Tie Handling', () => {
    test('Should detect tie when candidates receive identical top vote counts', async () => {
      const service = new ResultService();

      service.getElectionRecord = async () => ({
        id: sampleUuid,
        title: 'Tied Election',
        status: 'COMPLETED',
        endTime: '2026-08-01T00:00:00Z',
        candidates: [
          { id: 'c1', fullName: 'Alice Smith' },
          { id: 'c2', fullName: 'Bob Jones' },
          { id: 'c3', fullName: 'Charlie Brown' },
        ],
      });
      service.validateEligibility = () => true;

      service.fetchVoteCountsMap = async () => new Map([
        ['c1', 500],
        ['c2', 500],
        ['c3', 100],
      ]);

      const res = await service.calculateElectionResult(sampleUuid);

      assert.strictEqual(res.isTie, true);
      assert.ok(res.winner);
      assert.strictEqual(res.winner.isTie, true);
      assert.strictEqual(res.winner.winningStatus, 'TIE');
      assert.strictEqual(res.winner.winners.length, 2);
      assert.strictEqual(res.rankings[0].rank, 1);
      assert.strictEqual(res.rankings[1].rank, 1);
      assert.strictEqual(res.rankings[2].rank, 3);
    });
  });

  // 3. No Votes Test
  describe('No Votes Handling', () => {
    test('Should handle zero votes gracefully with null winner and 0% turnout', async () => {
      const service = new ResultService();

      service.getElectionRecord = async () => ({
        id: sampleUuid,
        title: 'Zero Votes Election',
        status: 'COMPLETED',
        endTime: '2026-08-01T00:00:00Z',
        candidates: [
          { id: 'c1', fullName: 'Candidate One' },
          { id: 'c2', fullName: 'Candidate Two' },
        ],
      });
      service.validateEligibility = () => true;

      service.fetchVoteCountsMap = async () => new Map();

      const res = await service.calculateElectionResult(sampleUuid);

      assert.strictEqual(res.totalVotes, 0);
      assert.strictEqual(res.winner, null);
      assert.strictEqual(res.rankings[0].voteCount, 0);
      assert.strictEqual(res.rankings[0].percentage, 0);
    });
  });

  // 4. Large Elections Scale Test
  describe('Large Elections Scale Test', () => {

    test('Should handle large scale election with 1,000 candidates efficiently', () => {
      const candidates = [];
      const voteMap = new Map();

      for (let i = 1; i <= 1000; i++) {
        const id = `cand-${i}`;
        candidates.push({ id, fullName: `Candidate ${i}` });
        voteMap.set(`pos-large:${id}`, i * 5); // 5, 10, 15... 5000 votes
      }

      const position = {
        id: 'pos-large',
        title: 'University General Election',
        candidates,
      };

      const startTime = Date.now();
      const res = calculatePositionResults(position, voteMap);
      const durationMs = Date.now() - startTime;

      assert.strictEqual(res.candidates.length, 1000);
      assert.strictEqual(res.winningStatus, 'SINGLE_WINNER');
      assert.strictEqual(res.winners[0].id, 'cand-1000');
      assert.ok(durationMs < 1000, `Calculation took ${durationMs}ms, expected under 1000ms`);
    });
  });

  // 5. Statistics & Turnout Test
  describe('Statistics & Turnout Calculation', () => {
    test('Should calculate turnout percentage and voter metrics accurately', async () => {
      const analytics = new AnalyticsService();

      const mockTx = {
        election: {
          findUnique: async () => ({
            id: sampleUuid,
            title: 'Turnout Test Election',
          }),
        },
        voterRegistry: {
          count: async () => 2500,
        },
        vote: {
          count: async () => 1875,
        },
      };

      const res = await analytics.calculateElectionTurnout(sampleUuid, mockTx);

      assert.strictEqual(res.eligibleVoters, 2500);
      assert.strictEqual(res.votesCast, 1875);
      // (1875 / 2500) * 100 = 75
      assert.strictEqual(res.turnoutPercentage, 75);
    });
  });

  // 6. Single-Request Summary Endpoint Test
  describe('Summary Endpoint', () => {
    test('Should return single-request summary payload with all 7 components', async () => {
      const resultSvc = new ResultService();

      resultSvc.getElectionRecord = async () => ({
        id: sampleUuid,
        title: 'Summary Test Election',
        description: 'Test description',
        status: 'COMPLETED',
        startTime: '2026-08-01T00:00:00Z',
        endTime: '2026-08-05T00:00:00Z',
        isDepartmentRestricted: false,
        createdAt: new Date(),
      });
      resultSvc.validateEligibility = () => true;

      resultSvc.calculateElectionResult = async () => ({
        winner: { id: 'c1', fullName: 'Winner Candidate' },
        rankings: [{ rank: 1, candidateId: 'c1' }],
        voteCounts: { c1: 100 },
        totalVotes: 100,
      });

      analyticsService.calculateElectionTurnout = async () => ({
        eligibleVoters: 100,
        votesCast: 100,
        turnoutPercentage: 100.0,
      });

      analyticsService.getDemographicAnalytics = async () => ({
        totalVotesAnalyzed: 100,
        byDepartment: { labels: [], datasets: [], rechartsData: [] },
        byBranch: { labels: [], datasets: [], rechartsData: [] },
        byYear: { labels: [], datasets: [], rechartsData: [] },
        byRole: { labels: [], datasets: [], rechartsData: [] },
      });

      const summary = await resultSvc.getElectionSummary(sampleUuid);

      assert.ok(summary.election);
      assert.ok(summary.winner);
      assert.ok(summary.rankings);
      assert.ok(summary.voteCounts);
      assert.ok(summary.turnout);
      assert.ok(summary.analytics);
      assert.ok(summary.timestamp);
    });
  });

  // 7. PDF Generation Test
  describe('PDF Generation', () => {
    test('Should generate valid PDF buffer with %PDF header for downloadable report', async () => {
      const resultSvc = new ResultService();

      resultSvc.getElectionSummary = async () => ({
        election: { id: sampleUuid, title: 'PDF Test Election', status: 'COMPLETED' },
        winner: { winningStatus: 'SINGLE_WINNER', fullName: 'Alice Smith', voteCount: 100, percentage: 100 },
        rankings: [{ rank: 1, fullName: 'Alice Smith', voteCount: 100, percentage: 100, isWinner: true }],
        turnout: { eligibleVoters: 100, votesCast: 100, turnoutPercentage: 100 },
        timestamp: new Date().toISOString(),
      });

      const pdfData = await resultSvc.generateElectionReportPDF(sampleUuid);

      assert.ok(Buffer.isBuffer(pdfData.buffer));
      assert.strictEqual(pdfData.buffer.toString('utf8', 0, 4), '%PDF');
      assert.ok(pdfData.filename.includes('Election_Report'));
    });
  });

  // 8. Export Service Formats Test
  describe('Export Service Formats', () => {
    test('Should export results in PDF, JSON, CSV, and Excel formats', async () => {
      const exportSvc = new ExportService();

      resultService.getElectionSummary = async () => ({
        election: { id: sampleUuid, title: 'Export Test Election', status: 'COMPLETED' },
        winner: { winningStatus: 'SINGLE_WINNER', fullName: 'Alice Smith', voteCount: 100, percentage: 100 },
        rankings: [{ rank: 1, fullName: 'Alice Smith', candidateId: 'c1', voteCount: 100, percentage: 100, isWinner: true }],
        turnout: { eligibleVoters: 100, votesCast: 100, turnoutPercentage: 100 },
        timestamp: new Date().toISOString(),
      });

      resultService.generateElectionReportPDF = async () => ({
        buffer: Buffer.from('%PDF-1.4 Mock PDF Content'),
        filename: 'Report.pdf',
        electionId: sampleUuid,
      });

      const pdfRes = await exportSvc.exportElectionResults(sampleUuid, 'pdf');
      assert.strictEqual(pdfRes.contentType, 'application/pdf');

      const jsonRes = await exportSvc.exportElectionResults(sampleUuid, 'json');
      assert.strictEqual(jsonRes.contentType, 'application/json');

      const csvRes = await exportSvc.exportElectionResults(sampleUuid, 'csv');
      assert.strictEqual(csvRes.contentType, 'text/csv');

      const excelRes = await exportSvc.exportElectionResults(sampleUuid, 'excel');
      assert.strictEqual(excelRes.contentType, 'application/vnd.ms-excel');
    });
  });
});
