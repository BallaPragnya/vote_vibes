import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { ElectionService } from '../../src/services/election.service.js';

describe('ElectionService Unit Tests (Mocked Repositories)', () => {
  describe('createElection', () => {
    test('Should throw 400 ValidationError if endTime <= startTime', async () => {
      const authService = new ElectionService();
      const now = new Date();

      await assert.rejects(
        async () => {
          await authService.createElection({
            title: 'Test',
            startTime: now,
            endTime: new Date(now.getTime() - 1000), // End before start
            createdById: 'user-id',
          });
        },
        (err) => {
          assert.strictEqual(err.statusCode, 400);
          assert.strictEqual(err.message, 'End date must be strictly after start date.');
          return true;
        }
      );
    });

    test('Should create election record with DRAFT status', async () => {
      let createdPayload = null;
      const mockElectionRepo = {
        create: async (data) => {
          createdPayload = data;
          return { id: 'election-uuid', ...data };
        },
      };

      const electionService = new ElectionService(mockElectionRepo);
      const startTime = new Date(Date.now() + 10000);
      const endTime = new Date(Date.now() + 50000);

      const result = await electionService.createElection({
        title: 'Presidential Election 2026',
        description: 'Annual election',
        startTime,
        endTime,
        isDepartmentRestricted: false,
        createdById: 'admin-id',
      });

      assert.strictEqual(result.id, 'election-uuid');
      assert.strictEqual(createdPayload.title, 'Presidential Election 2026');
      assert.strictEqual(createdPayload.status, 'DRAFT');
    });
  });

  describe('getElectionById', () => {
    test('Should throw 404 NotFoundError if election does not exist', async () => {
      const mockElectionRepo = {
        findById: async () => null,
      };

      const electionService = new ElectionService(mockElectionRepo);

      await assert.rejects(
        async () => {
          await electionService.getElectionById('non-existent-id');
        },
        (err) => {
          assert.strictEqual(err.statusCode, 404);
          assert.strictEqual(err.message, 'Election not found.');
          return true;
        }
      );
    });
  });

  describe('updateElection', () => {
    test('Should throw 400 InvalidStateError if election status is not DRAFT', async () => {
      const mockElectionRepo = {
        findById: async (id) => ({
          id,
          title: 'Active Election',
          status: 'ACTIVE',
        }),
      };

      const electionService = new ElectionService(mockElectionRepo);

      await assert.rejects(
        async () => {
          await electionService.updateElection('active-election-id', { title: 'New Title' });
        },
        (err) => {
          assert.strictEqual(err.statusCode, 400);
          assert.ok(err.message.includes('Only DRAFT elections can be modified.'));
          return true;
        }
      );
    });
  });

  describe('changeElectionStatus', () => {
    test('Should throw 400 InvalidStatusTransitionError on invalid transition', async () => {
      const mockElectionRepo = {
        findById: async (id) => ({
          id,
          title: 'Active Election',
          status: 'ACTIVE',
        }),
      };

      const electionService = new ElectionService(mockElectionRepo);

      await assert.rejects(
        async () => {
          await electionService.changeElectionStatus('active-election-id', 'DRAFT');
        },
        (err) => {
          assert.strictEqual(err.statusCode, 400);
          assert.strictEqual(err.message, "Cannot transition election from 'ACTIVE' to 'DRAFT'.");
          return true;
        }
      );
    });
  });
});
