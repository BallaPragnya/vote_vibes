import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import prisma from '../../src/config/prisma.js';
import { validateCastVote } from '../../src/validators/vote.validator.js';

describe('Vote Validator Unit Tests', () => {
  let testUser;
  let testElection;
  let otherElection;
  let testPosition;
  let testCandidate;
  let otherElectionCandidate;
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
        name: 'Vote Val User',
        email: `vote_val_${uniqueId}@college.edu`,
        password: 'hashedpassword',
        roleId: testRole.id,
      },
    });

    testElection = await prisma.election.create({
      data: {
        title: `Vote Val Election ${uniqueId}`,
        startTime: new Date(Date.now() - 3600000),
        endTime: new Date(Date.now() + 3600000),
        status: 'ACTIVE',
        createdById: testUser.id,
      },
    });

    otherElection = await prisma.election.create({
      data: {
        title: `Vote Val Other Election ${uniqueId}`,
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
        fullName: 'Valid Candidate',
        manifesto: 'Manifesto statement for validator test.',
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
  });

  after(async () => {
    if (testElection?.id) {
      await prisma.candidate.deleteMany({ where: { electionId: testElection.id } });
      await prisma.position.deleteMany({ where: { electionId: testElection.id } });
      await prisma.election.delete({ where: { id: testElection.id } });
    }
    if (otherElection?.id) {
      await prisma.candidate.deleteMany({ where: { electionId: otherElection.id } });
      await prisma.election.delete({ where: { id: otherElection.id } });
    }
    if (testUser?.id) {
      await prisma.user.delete({ where: { id: testUser.id } });
    }
  });

  test('Validation Rule: Should fail if authenticated voter is missing', async () => {
    const req = { body: { electionId: testElection.id, candidateId: testCandidate.id } };
    let capturedError = null;
    const next = (err) => {
      capturedError = err;
    };

    await validateCastVote(req, {}, next);

    assert.ok(capturedError);
    assert.strictEqual(capturedError.statusCode, 401);
    assert.match(capturedError.message, /Authenticated voter is required/i);
  });

  test('Validation Rule: Should fail if electionId is missing', async () => {
    const req = { user: { id: testUser.id }, body: { candidateId: testCandidate.id } };
    let capturedError = null;
    const next = (err) => {
      capturedError = err;
    };

    await validateCastVote(req, {}, next);

    assert.ok(capturedError);
    assert.strictEqual(capturedError.statusCode, 400);
    assert.match(capturedError.message, /Election ID is required/i);
  });

  test('Validation Rule: Should fail if election does not exist', async () => {
    const nonExistentUUID = '00000000-0000-4000-a000-000000000000';
    const req = { user: { id: testUser.id }, body: { electionId: nonExistentUUID, candidateId: testCandidate.id } };
    let capturedError = null;
    const next = (err) => {
      capturedError = err;
    };

    await validateCastVote(req, {}, next);

    assert.ok(capturedError);
    assert.strictEqual(capturedError.statusCode, 404);
  });

  test('Validation Rule: Should fail if candidateId is missing', async () => {
    const req = { user: { id: testUser.id }, body: { electionId: testElection.id } };
    let capturedError = null;
    const next = (err) => {
      capturedError = err;
    };

    await validateCastVote(req, {}, next);

    assert.ok(capturedError);
    assert.strictEqual(capturedError.statusCode, 400);
    assert.match(capturedError.message, /Candidate ID is required/i);
  });

  test('Validation Rule: Should fail if candidate does not belong to the election', async () => {
    const req = {
      user: { id: testUser.id },
      body: { electionId: testElection.id, candidateId: otherElectionCandidate.id },
    };
    let capturedError = null;
    const next = (err) => {
      capturedError = err;
    };

    await validateCastVote(req, {}, next);

    assert.ok(capturedError);
    assert.strictEqual(capturedError.statusCode, 400);
    assert.match(capturedError.message, /does not belong to election/i);
  });

  test('Success: Should pass for valid cast vote payload', async () => {
    const req = {
      user: { id: testUser.id },
      body: {
        electionId: testElection.id,
        candidateId: testCandidate.id,
      },
    };

    let capturedError = null;
    const next = (err) => {
      capturedError = err;
    };

    await validateCastVote(req, {}, next);

    assert.strictEqual(capturedError, undefined);
    assert.ok(Array.isArray(req.body.normalizedVotes));
    assert.strictEqual(req.body.normalizedVotes.length, 1);
  });
});
