import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { calculateElectionStatus, enrichWithComputedStatus } from '../../src/services/electionState.service.js';

describe('ElectionStateService Unit Tests', () => {
  describe('calculateElectionStatus', () => {
    test('Should return UPCOMING if current time < startDate', () => {
      const now = new Date('2026-08-01T10:00:00Z');
      const election = {
        status: 'PUBLISHED',
        startDate: '2026-08-05T00:00:00Z',
        endDate: '2026-08-10T00:00:00Z',
      };

      const computed = calculateElectionStatus(election, now);
      assert.strictEqual(computed, 'UPCOMING');
    });

    test('Should return ACTIVE if current time >= startDate and <= endDate', () => {
      const now = new Date('2026-08-07T12:00:00Z');
      const election = {
        status: 'UPCOMING',
        startDate: '2026-08-05T00:00:00Z',
        endDate: '2026-08-10T00:00:00Z',
      };

      const computed = calculateElectionStatus(election, now);
      assert.strictEqual(computed, 'ACTIVE');
    });

    test('Should return COMPLETED if current time > endDate', () => {
      const now = new Date('2026-08-15T12:00:00Z');
      const election = {
        status: 'ACTIVE',
        startDate: '2026-08-05T00:00:00Z',
        endDate: '2026-08-10T00:00:00Z',
      };

      const computed = calculateElectionStatus(election, now);
      assert.strictEqual(computed, 'COMPLETED');
    });

    test('Should preserve manual ARCHIVED status regardless of time', () => {
      const now = new Date('2026-08-07T12:00:00Z');
      const election = {
        status: 'ARCHIVED',
        startDate: '2026-08-05T00:00:00Z',
        endDate: '2026-08-10T00:00:00Z',
      };

      const computed = calculateElectionStatus(election, now);
      assert.strictEqual(computed, 'ARCHIVED');
    });

    test('Should preserve manual DRAFT status regardless of time', () => {
      const now = new Date('2026-08-07T12:00:00Z');
      const election = {
        status: 'DRAFT',
        startDate: '2026-08-05T00:00:00Z',
        endDate: '2026-08-10T00:00:00Z',
      };

      const computed = calculateElectionStatus(election, now);
      assert.strictEqual(computed, 'DRAFT');
    });
  });

  describe('enrichWithComputedStatus', () => {
    test('Should attach computedStatus property to single election', () => {
      const now = new Date('2026-08-07T12:00:00Z');
      const election = {
        id: 'el-1',
        status: 'UPCOMING',
        startDate: '2026-08-05T00:00:00Z',
        endDate: '2026-08-10T00:00:00Z',
      };

      const enriched = enrichWithComputedStatus(election, now);
      assert.strictEqual(enriched.computedStatus, 'ACTIVE');
      assert.strictEqual(enriched.status, 'ACTIVE');
    });

    test('Should enrich array of elections', () => {
      const now = new Date('2026-08-07T12:00:00Z');
      const list = [
        { id: '1', status: 'UPCOMING', startDate: '2026-08-01Z', endDate: '2026-08-05Z' }, // COMPLETED
        { id: '2', status: 'UPCOMING', startDate: '2026-08-05Z', endDate: '2026-08-10Z' }, // ACTIVE
      ];

      const enrichedList = enrichWithComputedStatus(list, now);
      assert.strictEqual(enrichedList[0].computedStatus, 'COMPLETED');
      assert.strictEqual(enrichedList[1].computedStatus, 'ACTIVE');
    });
  });
});
