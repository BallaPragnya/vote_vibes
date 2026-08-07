import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { AnalyticsService } from '../../src/services/analytics.service.js';

describe('AnalyticsService Unit Tests', () => {
  describe('calculateElectionTurnout', () => {
    test('Should throw 400 ValidationError if electionId is missing or empty', async () => {
      const service = new AnalyticsService();
      await assert.rejects(
        async () => service.calculateElectionTurnout(''),
        (err) => err.statusCode === 400 && err.errorType === 'ValidationError'
      );
    });

    test('Should throw 404 NotFoundError if election does not exist', async () => {
      const service = new AnalyticsService();
      const nonExistentUuid = '00000000-0000-0000-0000-000000000000';
      await assert.rejects(
        async () => service.calculateElectionTurnout(nonExistentUuid),
        (err) => err.statusCode === 404 && err.errorType === 'NotFoundError'
      );
    });

    test('Should calculate turnout correctly with rounded percentage', async () => {
      const service = new AnalyticsService();

      // Mock database calls via transaction parameter
      const mockTx = {
        election: {
          findUnique: async () => ({
            id: '123e4567-e89b-12d3-a456-426614174000',
            title: 'Sample Campus Election',
            isDepartmentRestricted: false,
          }),
        },
        voterRegistry: {
          count: async () => 150,
        },
        vote: {
          count: async () => 123,
        },
      };

      const res = await service.calculateElectionTurnout('123e4567-e89b-12d3-a456-426614174000', mockTx);

      assert.strictEqual(res.eligibleVoters, 150);
      assert.strictEqual(res.votesCast, 123);
      // (123 / 150) * 100 = 82
      assert.strictEqual(res.turnoutPercentage, 82);
    });

    test('Should handle elections with zero voters without division by zero errors', async () => {
      const service = new AnalyticsService();

      const mockTx = {
        election: {
          findUnique: async () => ({
            id: '123e4567-e89b-12d3-a456-426614174001',
            title: 'Zero Voter Test Election',
            isDepartmentRestricted: false,
          }),
        },
        voterRegistry: {
          count: async () => 0,
        },
        user: {
          count: async () => 0,
        },
        vote: {
          count: async () => 0,
        },
      };

      const res = await service.calculateElectionTurnout('123e4567-e89b-12d3-a456-426614174001', mockTx);

      assert.strictEqual(res.eligibleVoters, 0);
      assert.strictEqual(res.votesCast, 0);
      assert.strictEqual(res.turnoutPercentage, 0);
    });
  });

  describe('getDemographicAnalytics', () => {
    test('Should aggregate votes by department, branch, year, and role formatted for Chart.js/Recharts', async () => {
      const service = new AnalyticsService();

      const mockTx = {
        election: {
          findUnique: async () => ({
            id: '123e4567-e89b-12d3-a456-426614174002',
            title: 'Demographics Test Election',
            status: 'COMPLETED',
          }),
        },
        vote: {
          findMany: async () => [
            {
              voter: {
                studentIdNumber: '2023CSE001',
                department: { id: 'd1', code: 'CSE', name: 'Computer Science' },
                role: { id: 'r1', name: 'STUDENT' },
              },
            },
            {
              voter: {
                studentIdNumber: '2023CSE002',
                department: { id: 'd1', code: 'CSE', name: 'Computer Science' },
                role: { id: 'r1', name: 'STUDENT' },
              },
            },
            {
              voter: {
                studentIdNumber: '2024ECE001',
                department: { id: 'd2', code: 'ECE', name: 'Electronics' },
                role: { id: 'r1', name: 'STUDENT' },
              },
            },
          ],
        },
      };

      const res = await service.getDemographicAnalytics('123e4567-e89b-12d3-a456-426614174002', mockTx);

      assert.strictEqual(res.totalVotesAnalyzed, 3);

      // Check byDepartment
      assert.ok(res.byDepartment.labels.includes('Computer Science'));
      assert.ok(res.byDepartment.labels.includes('Electronics'));
      assert.strictEqual(res.byDepartment.datasets[0].data[0], 2);
      assert.strictEqual(res.byDepartment.rechartsData[0].votes, 2);

      // Check byBranch
      assert.ok(res.byBranch.labels.includes('CSE'));
      assert.ok(res.byBranch.labels.includes('ECE'));

      // Check byYear
      assert.ok(res.byYear.labels.includes('Year 2023'));
      assert.ok(res.byYear.labels.includes('Year 2024'));

      // Check byRole
      assert.ok(res.byRole.labels.includes('STUDENT'));
    });
  });
});
