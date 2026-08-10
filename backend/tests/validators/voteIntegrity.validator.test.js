import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import prisma from '../../src/config/prisma.js';
import { verifyVoteIntegrity } from '../../src/validators/voteIntegrity.validator.js';

describe('Vote Integrity Validator Unit Tests', () => {
  let testUser;
  let suspendedUser;
  let testElection;
  let draftElection;
  let otherElection;
  let testPosition;
  let testCandidate;
  let otherElectionCandidate;
  let unapprovedCandidate;
  let testRole;
  const uniqueId = Date.now();

  before(async () => {
    testRole = await prisma.role.upsert({
      where: { name: 'STUDENT' },
      update: {},
      create: { name: 'STUDENT' },
    });

    testUser = await prisma.user.create({
      data: {
        name: 'Integrity User',
        email: `integrity_${uniqueId}@college.edu`,
        password: 'hashedpassword',
        roleId: testRole.id,
        status: 'VERIFIED',
      },
    });

    suspendedUser = await prisma.user.create({
      data: {
        name: 'Suspended User',
        email: `suspended_${uniqueId}@college.edu`,
        password: 'hashedpassword',
        roleId: testRole.id,
        status: 'SUSPENDED',
      },
    });

    testElection = await prisma.election.create({
      data: {
        title: `Integrity Active Election ${uniqueId}`,
        startTime: new Date(Date.now() - 3600000),
        endTime: new Date(Date.now() + 3600000),
        status: 'ACTIVE',
        createdById: testUser.id,
      },
    });

    draftElection = await prisma.election.create({
      data: {
        title: `Integrity Draft Election ${uniqueId}`,
        startTime: new Date(Date.now() - 3600000),
        endTime: new Date(Date.now() + 3600000),
        status: 'DRAFT',
        createdById: testUser.id,
      },
    });

    otherElection = await prisma.election.create({
      data: {
        title: `Integrity Other Election ${uniqueId}`,
        startTime: new Date(Date.now() - 3600000),
        endTime: new Date(Date.now() + 3600000),
        status: 'ACTIVE',
        createdById: testUser.id,
      },
    });

    testPosition = await prisma.position.create({
      data: {
        electionId: testElection.id,
        title: 'President',
        maxChoices: 1,
      },
    });

    testCandidate = await prisma.candidate.create({
      data: {
        electionId: testElection.id,
        positionId: testPosition.id,
        userId: testUser.id,
        fullName: 'Integrity Approved Candidate',
        manifesto: 'Manifesto statement for integrity test.',
        approvalStatus: 'APPROVED',
        nominationStatus: 'APPROVED',
        status: 'APPROVED',
      },
    });

    otherElectionCandidate = await prisma.candidate.create({
      data: {
        electionId: otherElection.id,
        userId: testUser.id,
        fullName: 'Other Candidate',
        manifesto: 'Manifesto for other election candidate.',
        approvalStatus: 'APPROVED',
        nominationStatus: 'APPROVED',
        status: 'APPROVED',
      },
    });

    unapprovedCandidate = await prisma.candidate.create({
      data: {
        electionId: testElection.id,
        positionId: testPosition.id,
        userId: suspendedUser.id,
        fullName: 'Unapproved Candidate',
        manifesto: 'Unapproved manifesto.',
        approvalStatus: 'PENDING',
        nominationStatus: 'PENDING',
        status: 'PENDING',
      },
    });
  });

  after(async () => {
    if (testElection?.id) {
      await prisma.vote.deleteMany({ where: { electionId: testElection.id } });
      await prisma.candidate.deleteMany({ where: { electionId: testElection.id } });
      await prisma.position.deleteMany({ where: { electionId: testElection.id } });
      await prisma.election.delete({ where: { id: testElection.id } });
    }
    if (draftElection?.id) {
      await prisma.election.delete({ where: { id: draftElection.id } });
    }
    if (otherElection?.id) {
      await prisma.candidate.deleteMany({ where: { electionId: otherElection.id } });
      await prisma.election.delete({ where: { id: otherElection.id } });
    }
    if (testUser?.id) await prisma.user.delete({ where: { id: testUser.id } });
    if (suspendedUser?.id) await prisma.user.delete({ where: { id: suspendedUser.id } });
  });

  test('1. Vote Request Valid: Should fail if payload/IDs are missing or invalid UUID', async () => {
    await assert.rejects(
      async () => {
        await verifyVoteIntegrity({ userId: 'invalid', electionId: testElection.id, candidateId: testCandidate.id });
      },
      (err) => {
        assert.strictEqual(err.statusCode, 400);
        return true;
      }
    );
  });

  test('2. Election Exists: Should fail if election does not exist in DB', async () => {
    const nonExistentUUID = '00000000-0000-4000-a000-000000000000';
    await assert.rejects(
      async () => {
        await verifyVoteIntegrity({ userId: testUser.id, electionId: nonExistentUUID, candidateId: testCandidate.id });
      },
      (err) => {
        assert.strictEqual(err.statusCode, 404);
        return true;
      }
    );
  });

  test('3. Election Status ACTIVE: Should fail if election status is DRAFT', async () => {
    await assert.rejects(
      async () => {
        await verifyVoteIntegrity({ userId: testUser.id, electionId: draftElection.id, candidateId: testCandidate.id });
      },
      (err) => {
        assert.strictEqual(err.statusCode, 400);
        assert.strictEqual(err.errorType, 'InvalidStateError');
        return true;
      }
    );
  });

  test('4. Candidate Exists: Should fail if candidate does not exist in DB', async () => {
    const nonExistentUUID = '00000000-0000-4000-a000-000000000000';
    await assert.rejects(
      async () => {
        await verifyVoteIntegrity({ userId: testUser.id, electionId: testElection.id, candidateId: nonExistentUUID });
      },
      (err) => {
        assert.strictEqual(err.statusCode, 404);
        return true;
      }
    );
  });

  test('5. Candidate Belongs to Election: Should fail if candidate belongs to another election', async () => {
    await assert.rejects(
      async () => {
        await verifyVoteIntegrity({ userId: testUser.id, electionId: testElection.id, candidateId: otherElectionCandidate.id });
      },
      (err) => {
        assert.strictEqual(err.statusCode, 400);
        assert.strictEqual(err.errorType, 'ValidationError');
        return true;
      }
    );
  });

  test('6. User Eligibility: Should fail if user account status is SUSPENDED', async () => {
    await assert.rejects(
      async () => {
        await verifyVoteIntegrity({ userId: suspendedUser.id, electionId: testElection.id, candidateId: testCandidate.id });
      },
      (err) => {
        assert.strictEqual(err.statusCode, 403);
        assert.strictEqual(err.errorType, 'ForbiddenError');
        return true;
      }
    );
  });

  test('7. User Has Not Already Voted: Should pass before vote, then fail after vote is recorded', async () => {
    // A) First call should succeed
    const integrityResult = await verifyVoteIntegrity({
      userId: testUser.id,
      electionId: testElection.id,
      candidateId: testCandidate.id,
    });
    assert.ok(integrityResult);
    assert.strictEqual(integrityResult.election.id, testElection.id);

    // B) Record a vote entity
    await prisma.vote.create({
      data: {
        electionId: testElection.id,
        candidateId: testCandidate.id,
        voterId: testUser.id,
        transactionReceipt: `RECEIPT_${uniqueId}`,
      },
    });

    // C) Second call should fail with DuplicateVoteError
    await assert.rejects(
      async () => {
        await verifyVoteIntegrity({ userId: testUser.id, electionId: testElection.id, candidateId: testCandidate.id });
      },
      (err) => {
        assert.strictEqual(err.statusCode, 400);
        assert.strictEqual(err.errorType, 'DuplicateVoteError');
        return true;
      }
    );
  });
});
