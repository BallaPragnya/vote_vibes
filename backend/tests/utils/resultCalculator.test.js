import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { calculatePositionResults, summarizeElectionResults } from '../../src/utils/resultCalculator.js';

describe('resultCalculator Utility Unit Tests', () => {
  describe('calculatePositionResults', () => {
    test('Should return NO_VOTES status when total votes cast is zero', () => {
      const position = {
        id: 'pos-1',
        title: 'President',
        candidates: [
          { id: 'c1', fullName: 'Alice Smith' },
          { id: 'c2', fullName: 'Bob Jones' },
        ],
      };
      const voteMap = new Map();

      const result = calculatePositionResults(position, voteMap);

      assert.strictEqual(result.totalVotesCast, 0);
      assert.strictEqual(result.winningStatus, 'NO_VOTES');
      assert.strictEqual(result.isTie, false);
      assert.strictEqual(result.winners.length, 0);
      assert.strictEqual(result.candidates[0].percentage, 0);
      assert.strictEqual(result.candidates[1].percentage, 0);
    });

    test('Should calculate single winner correctly with percentages', () => {
      const position = {
        id: 'pos-1',
        title: 'President',
        candidates: [
          { id: 'c1', fullName: 'Alice Smith' },
          { id: 'c2', fullName: 'Bob Jones' },
        ],
      };
      const voteMap = new Map([
        ['pos-1:c1', 75],
        ['pos-1:c2', 25],
      ]);

      const result = calculatePositionResults(position, voteMap);

      assert.strictEqual(result.totalVotesCast, 100);
      assert.strictEqual(result.winningStatus, 'SINGLE_WINNER');
      assert.strictEqual(result.isTie, false);
      assert.strictEqual(result.winners.length, 1);
      assert.strictEqual(result.winners[0].id, 'c1');
      assert.strictEqual(result.candidates[0].percentage, 75);
      assert.strictEqual(result.candidates[1].percentage, 25);
    });

    test('Should handle tied winners when multiple candidates have identical highest votes', () => {
      const position = {
        id: 'pos-1',
        title: 'Vice President',
        candidates: [
          { id: 'c1', fullName: 'Alice Smith' },
          { id: 'c2', fullName: 'Bob Jones' },
          { id: 'c3', fullName: 'Charlie Brown' },
        ],
      };
      const voteMap = new Map([
        ['pos-1:c1', 50],
        ['pos-1:c2', 50],
        ['pos-1:c3', 20],
      ]);

      const result = calculatePositionResults(position, voteMap);

      assert.strictEqual(result.totalVotesCast, 120);
      assert.strictEqual(result.winningStatus, 'TIE');
      assert.strictEqual(result.isTie, true);
      assert.strictEqual(result.winners.length, 2);
      const winnerIds = result.winners.map((w) => w.id);
      assert.ok(winnerIds.includes('c1'));
      assert.ok(winnerIds.includes('c2'));
    });

    test('Should return NO_CANDIDATES when position has no candidates', () => {
      const position = {
        id: 'pos-empty',
        title: 'Secretary',
        candidates: [],
      };
      const voteMap = new Map();

      const result = calculatePositionResults(position, voteMap);

      assert.strictEqual(result.winningStatus, 'NO_CANDIDATES');
      assert.strictEqual(result.totalVotesCast, 0);
      assert.strictEqual(result.winners.length, 0);
    });
  });

  describe('summarizeElectionResults', () => {
    test('Should produce correct summary metrics across positions', () => {
      const election = {
        id: 'el-1',
        title: 'Campus Election 2026',
        status: 'COMPLETED',
      };

      const positionResults = [
        {
          positionId: 'pos-1',
          positionTitle: 'President',
          totalVotesCast: 100,
          isTie: false,
          candidates: [{ id: 'c1' }, { id: 'c2' }],
        },
        {
          positionId: 'pos-2',
          positionTitle: 'Vice President',
          totalVotesCast: 120,
          isTie: true,
          candidates: [{ id: 'c3' }, { id: 'c4' }, { id: 'c5' }],
        },
      ];

      const summary = summarizeElectionResults(election, positionResults);

      assert.strictEqual(summary.electionId, 'el-1');
      assert.strictEqual(summary.summaryMetrics.totalVotesCast, 220);
      assert.strictEqual(summary.summaryMetrics.totalPositions, 2);
      assert.strictEqual(summary.summaryMetrics.totalCandidates, 5);
      assert.strictEqual(summary.summaryMetrics.hasTies, true);
      assert.strictEqual(summary.summaryMetrics.hasNoVotes, false);
    });
  });
});
