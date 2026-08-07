import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import prisma from '../../src/config/prisma.js';
import {
  validateCreateCandidate,
  validateUpdateCandidate,
  validateApproveCandidate,
} from '../../src/validators/candidate.validator.js';

describe('Candidate Validator Unit Tests', () => {
  const mockRes = {};
  const validUUID = 'a1b2c3d4-e5f6-47a8-b9c0-d1e2f3a4b5c6';
  const uniqueId = Date.now();
  let testElection;
  let testUser;

  before(async () => {
    const role = await prisma.role.upsert({
      where: { name: 'ADMIN' },
      update: {},
      create: { name: 'ADMIN' },
    });

    testUser = await prisma.user.create({
      data: {
        name: 'Validator Candidate User',
        email: `validator_user_${uniqueId}@college.edu`,
        password: 'hashedPassword123',
        roleId: role.id,
      },
    });

    testElection = await prisma.election.create({
      data: {
        title: `Validator Candidate Election ${uniqueId}`,
        startTime: new Date(Date.now() + 3600000),
        endTime: new Date(Date.now() + 86400000),
        createdById: testUser.id,
      },
    });
  });

  after(async () => {
    if (testElection?.id) {
      await prisma.election.delete({ where: { id: testElection.id } });
    }
    if (testUser?.id) {
      await prisma.user.delete({ where: { id: testUser.id } });
    }
  });

  describe('validateCreateCandidate', () => {
    test('Should fail if electionId is missing', async () => {
      const req = {
        body: {
          userId: testUser.id,
          fullName: 'John Doe',
          manifesto: 'I promise to improve student services.',
        },
      };

      await validateCreateCandidate(req, mockRes, (err) => {
        assert.ok(err);
        assert.strictEqual(err.statusCode, 400);
        assert.strictEqual(err.errorType, 'ValidationError');
        assert.strictEqual(err.message, 'Election ID is required.');
      });
    });

    test('Should fail if election does not exist in database', async () => {
      const req = {
        body: {
          electionId: validUUID,
          userId: testUser.id,
          fullName: 'John Doe',
          manifesto: 'I promise to improve student services.',
        },
      };

      await validateCreateCandidate(req, mockRes, (err) => {
        assert.ok(err);
        assert.strictEqual(err.statusCode, 404);
        assert.strictEqual(err.errorType, 'NotFoundError');
      });
    });

    test('Should fail if fullName is missing', async () => {
      const req = {
        body: {
          electionId: testElection.id,
          userId: testUser.id,
          manifesto: 'I promise to improve student services.',
        },
      };

      await validateCreateCandidate(req, mockRes, (err) => {
        assert.ok(err);
        assert.strictEqual(err.statusCode, 400);
        assert.strictEqual(err.message, 'Full name is required.');
      });
    });

    test('Should fail if manifesto is too short (< 10 chars)', async () => {
      const req = {
        body: {
          electionId: testElection.id,
          userId: testUser.id,
          fullName: 'John Doe',
          manifesto: 'Too short',
        },
      };

      await validateCreateCandidate(req, mockRes, (err) => {
        assert.ok(err);
        assert.strictEqual(err.statusCode, 400);
        assert.strictEqual(err.message, 'Manifesto must be at least 10 characters long.');
      });
    });

    test('Should pass for valid candidate payload', async () => {
      const req = {
        body: {
          electionId: testElection.id,
          userId: testUser.id,
          fullName: 'John Doe',
          manifesto: 'I promise to improve student services and represent student voices.',
          profileImage: 'https://example.com/profile.jpg',
        },
      };

      await validateCreateCandidate(req, mockRes, (err) => {
        assert.strictEqual(err, undefined);
      });
    });
  });

  describe('validateUpdateCandidate', () => {
    test('Should fail if manifesto is too short (< 10 chars)', () => {
      const req = { body: { manifesto: 'Short' } };
      validateUpdateCandidate(req, mockRes, (err) => {
        assert.ok(err);
        assert.strictEqual(err.statusCode, 400);
        assert.strictEqual(err.message, 'Manifesto must be at least 10 characters long.');
      });
    });

    test('Should pass for valid update payload', () => {
      const req = { body: { manifesto: 'Updated candidate manifesto statement with sufficient length' } };
      validateUpdateCandidate(req, mockRes, (err) => {
        assert.strictEqual(err, undefined);
      });
    });
  });

  describe('validateApproveCandidate', () => {
    test('Should fail for invalid approval status', () => {
      const req = { body: { approvalStatus: 'INVALID_STATUS' } };
      validateApproveCandidate(req, mockRes, (err) => {
        assert.ok(err);
        assert.strictEqual(err.statusCode, 400);
      });
    });

    test('Should pass for valid approvalStatus APPROVED', () => {
      const req = { body: { approvalStatus: 'APPROVED' } };
      validateApproveCandidate(req, mockRes, (err) => {
        assert.strictEqual(err, undefined);
      });
    });
  });
});
