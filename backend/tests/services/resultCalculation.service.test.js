import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { ResultCalculationService } from '../../src/services/resultCalculation.service.js';

describe('ResultCalculationService Unit Tests', () => {
  describe('validateElectionEligibility', () => {
    const service = new ResultCalculationService();

    test('Should throw 404 NotFoundError if election is null or undefined', () => {
      assert.throws(
        () => service.validateElectionEligibility(null),
        (err) => err.statusCode === 404 && err.errorType === 'NotFoundError'
      );
    });

    test('Should throw 400 InvalidStateError for DRAFT elections', () => {
      const election = {
        id: 'el-draft',
        status: 'DRAFT',
        startTime: '2026-08-01T00:00:00Z',
        endTime: '2026-08-05T00:00:00Z',
      };
      assert.throws(
        () => service.validateElectionEligibility(election, new Date('2026-08-10T00:00:00Z')),
        (err) => err.statusCode === 400 && err.errorType === 'InvalidStateError'
      );
    });

    test('Should throw 400 InvalidStateError for CANCELLED or ARCHIVED elections', () => {
      const cancelledElection = {
        id: 'el-cancelled',
        status: 'CANCELLED',
        startTime: '2026-08-01T00:00:00Z',
        endTime: '2026-08-05T00:00:00Z',
      };
      assert.throws(
        () => service.validateElectionEligibility(cancelledElection, new Date('2026-08-10T00:00:00Z')),
        (err) => err.statusCode === 400 && err.errorType === 'InvalidStateError'
      );
    });

    test('Should throw 400 InvalidStateError if voting has not ended yet', () => {
      const activeElection = {
        id: 'el-active',
        status: 'ACTIVE',
        startTime: '2026-08-01T00:00:00Z',
        endTime: '2026-08-10T00:00:00Z',
      };
      // Current time is before endTime
      const nowDuringVoting = new Date('2026-08-05T12:00:00Z');

      assert.throws(
        () => service.validateElectionEligibility(activeElection, nowDuringVoting),
        (err) => err.statusCode === 400 && err.errorType === 'InvalidStateError'
      );
    });

    test('Should pass eligibility check when status is COMPLETED and current time >= endTime', () => {
      const completedElection = {
        id: 'el-completed',
        status: 'COMPLETED',
        startTime: '2026-08-01T00:00:00Z',
        endTime: '2026-08-05T00:00:00Z',
      };
      const nowAfterVoting = new Date('2026-08-06T00:00:00Z');

      const isEligible = service.validateElectionEligibility(completedElection, nowAfterVoting);
      assert.strictEqual(isEligible, true);
    });
  });

  describe('generateElectionResults with mock data', () => {
    test('Should calculate results for COMPLETED election with mock tallies', async () => {
      const mockElection = {
        id: 'el-mock-1',
        title: 'Student Council Election 2026',
        status: 'COMPLETED',
        startTime: new Date('2026-08-01T00:00:00Z'),
        endTime: new Date('2026-08-05T00:00:00Z'),
        positions: [
          {
            id: 'pos-1',
            title: 'President',
            displayOrder: 1,
            candidates: [
              { id: 'cand-1', fullName: 'Alice Smith', user: { name: 'Alice Smith' } },
              { id: 'cand-2', fullName: 'Bob Jones', user: { name: 'Bob Jones' } },
            ],
          },
        ],
      };

      const mockVoteMap = new Map([
        ['pos-1:cand-1', 60],
        ['pos-1:cand-2', 40],
      ]);

      const service = new ResultCalculationService();
      service.getElectionDataAndTallies = async () => ({
        election: mockElection,
        voteMap: mockVoteMap,
      });

      const now = new Date('2026-08-06T10:00:00Z');
      const results = await service.generateElectionResults('el-mock-1', {}, now);

      assert.strictEqual(results.electionId, 'el-mock-1');
      assert.strictEqual(results.status, 'COMPLETED');
      assert.strictEqual(results.summaryMetrics.totalVotesCast, 100);
      assert.strictEqual(results.positionResults.length, 1);

      const posRes = results.positionResults[0];
      assert.strictEqual(posRes.winningStatus, 'SINGLE_WINNER');
      assert.strictEqual(posRes.winners[0].id, 'cand-1');
      assert.strictEqual(posRes.candidates[0].percentage, 60);
      assert.strictEqual(posRes.candidates[1].percentage, 40);
    });

    test('Should calculate results with tie handling in service', async () => {
      const mockElection = {
        id: 'el-mock-tie',
        title: 'Engineering Rep Election',
        status: 'COMPLETED',
        startTime: new Date('2026-08-01T00:00:00Z'),
        endTime: new Date('2026-08-05T00:00:00Z'),
        positions: [
          {
            id: 'pos-2',
            title: 'Representative',
            displayOrder: 1,
            candidates: [
              { id: 'c1', fullName: 'Candidate One' },
              { id: 'c2', fullName: 'Candidate Two' },
            ],
          },
        ],
      };

      const mockVoteMap = new Map([
        ['pos-2:c1', 50],
        ['pos-2:c2', 50],
      ]);

      const service = new ResultCalculationService();
      service.getElectionDataAndTallies = async () => ({
        election: mockElection,
        voteMap: mockVoteMap,
      });

      const now = new Date('2026-08-06T10:00:00Z');
      const results = await service.generateElectionResults('el-mock-tie', {}, now);

      const posRes = results.positionResults[0];
      assert.strictEqual(posRes.winningStatus, 'TIE');
      assert.strictEqual(posRes.isTie, true);
      assert.strictEqual(posRes.winners.length, 2);
    });

    test('Should generate summary metrics correctly via getElectionResultSummary', async () => {
      const mockElection = {
        id: 'el-mock-summary',
        title: 'Campus Election 2026',
        status: 'COMPLETED',
        startTime: new Date('2026-08-01T00:00:00Z'),
        endTime: new Date('2026-08-05T00:00:00Z'),
        positions: [
          {
            id: 'pos-1',
            title: 'President',
            candidates: [
              { id: 'c1', fullName: 'Alice Smith' },
              { id: 'c2', fullName: 'Bob Jones' },
            ],
          },
        ],
      };

      const mockVoteMap = new Map([
        ['pos-1:c1', 80],
        ['pos-1:c2', 20],
      ]);

      const service = new ResultCalculationService();
      service.getElectionDataAndTallies = async () => ({
        election: mockElection,
        voteMap: mockVoteMap,
      });

      const now = new Date('2026-08-06T10:00:00Z');
      const summary = await service.getElectionResultSummary('el-mock-summary', {}, now);

      assert.strictEqual(summary.electionId, 'el-mock-summary');
      assert.strictEqual(summary.winners.length, 1);
      assert.strictEqual(summary.winners[0].winners[0].id, 'c1');
    });
  });
});
