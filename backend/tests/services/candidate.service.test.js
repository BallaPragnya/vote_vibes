import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { CandidateService } from '../../src/services/candidate.service.js';

describe('CandidateService Unit Tests (Mocked Repositories)', () => {
  const mockRepo = {
    createCandidate: async (data) => ({ id: 'cand-1', ...data }),
    getCandidateById: async (id) => (id === 'cand-1' ? { id: 'cand-1', userId: 'user-1', nominationStatus: 'PENDING', approvalStatus: 'PENDING', status: 'PENDING' } : id === 'cand-approved' ? { id: 'cand-approved', userId: 'user-1', nominationStatus: 'APPROVED', approvalStatus: 'APPROVED', status: 'APPROVED' } : null),
    findByElectionAndUser: async () => null,
    findByPositionAndUser: async () => null,
    getCandidates: async () => ({ candidates: [{ id: 'cand-1' }], total: 1 }),
    getAllCandidates: async () => ({ candidates: [{ id: 'cand-1' }], total: 1 }),
    updateCandidate: async (id, data) => ({ id, ...data }),
    approveCandidate: async (id) => ({ id, nominationStatus: 'APPROVED', approvalStatus: 'APPROVED', status: 'APPROVED' }),
    rejectCandidate: async (id) => ({ id, nominationStatus: 'REJECTED', approvalStatus: 'REJECTED', status: 'REJECTED' }),
    deleteCandidate: async (id) => ({ id }),
  };

  const service = new CandidateService(mockRepo);

  describe('getCandidate', () => {
    test('Should throw 404 NotFoundError if candidate does not exist', async () => {
      await assert.rejects(
        async () => {
          await service.getCandidate('non-existent-id');
        },
        (err) => {
          assert.strictEqual(err.statusCode, 404);
          assert.strictEqual(err.message, 'Candidate not found.');
          return true;
        }
      );
    });

    test('Should return candidate details if found', async () => {
      const result = await service.getCandidate('cand-1');
      assert.strictEqual(result.id, 'cand-1');
    });
  });

  describe('approveCandidate & rejectCandidate', () => {
    test('Should approve candidate nomination', async () => {
      const result = await service.approveCandidate('cand-1');
      assert.strictEqual(result.approvalStatus, 'APPROVED');
      assert.strictEqual(result.nominationStatus, 'APPROVED');
    });

    test('Should reject candidate nomination', async () => {
      const result = await service.rejectCandidate('cand-1');
      assert.strictEqual(result.approvalStatus, 'REJECTED');
      assert.strictEqual(result.nominationStatus, 'REJECTED');
    });
  });

  describe('updateCandidate', () => {
    test('Should prevent candidate owner from updating after approval', async () => {
      await assert.rejects(
        async () => {
          await service.updateCandidate('cand-approved', { manifesto: 'New manifesto' }, { id: 'user-1', role: 'STUDENT' });
        },
        (err) => {
          assert.strictEqual(err.statusCode, 400);
          assert.strictEqual(err.errorType, 'InvalidStateError');
          assert.strictEqual(err.message, 'Candidate details cannot be modified after nomination approval.');
          return true;
        }
      );
    });

    test('Should allow ADMIN to update candidate details even after approval', async () => {
      const updated = await service.updateCandidate('cand-approved', { manifesto: 'Admin edited manifesto' }, { id: 'admin-1', role: 'ADMIN' });
      assert.strictEqual(updated.manifesto, 'Admin edited manifesto');
    });
  });

  describe('deleteCandidate', () => {
    test('Should throw 403 ForbiddenError if user is not owner and not authorized role', async () => {
      await assert.rejects(
        async () => {
          await service.deleteCandidate('cand-1', { id: 'user-other', role: 'STUDENT' });
        },
        (err) => {
          assert.strictEqual(err.statusCode, 403);
          return true;
        }
      );
    });

    test('Should allow owner to delete candidacy', async () => {
      const result = await service.deleteCandidate('cand-1', { id: 'user-1', role: 'STUDENT' });
      assert.strictEqual(result.id, 'cand-1');
    });
  });
});
