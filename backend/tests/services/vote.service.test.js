import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import prisma from '../../src/config/prisma.js';
import voteService from '../../src/services/vote.service.js';

describe('VoteService Unit Tests', () => {
  let testUser;
  let otherUser;
  let testElection;
  let draftElection;
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
        name: 'Receipt Vote User',
        email: `receipt_vote_${uniqueId}@college.edu`,
        password: 'hashedpassword',
        roleId: testRole.id,
      },
    });

    otherUser = await prisma.user.create({
      data: {
        name: 'Receipt Other User',
        email: `receipt_other_${uniqueId}@college.edu`,
        password: 'hashedpassword',
        roleId: testRole.id,
      },
    });

    testElection = await prisma.election.create({
      data: {
        title: `Receipt Active Election ${uniqueId}`,
        startTime: new Date(Date.now() - 3600000),
        endTime: new Date(Date.now() + 3600000),
        status: 'ACTIVE',
        createdById: testUser.id,
      },
    });

    draftElection = await prisma.election.create({
      data: {
        title: `Receipt Draft Election ${uniqueId}`,
        startTime: new Date(Date.now() - 3600000),
        endTime: new Date(Date.now() + 3600000),
        status: 'DRAFT',
        createdById: testUser.id,
      },
    });

    otherElection = await prisma.election.create({
      data: {
        title: `Receipt Other Election ${uniqueId}`,
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
        fullName: 'Approved Candidate',
        manifesto: 'Manifesto for receipt test.',
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
        manifesto: 'Manifesto for other candidate.',
        approvalStatus: 'APPROVED',
        nominationStatus: 'APPROVED',
        status: 'APPROVED',
      },
    });
  });

  after(async () => {
    if (testElection?.id) {
      await prisma.vote.deleteMany({ where: { electionId: testElection.id } });
      await prisma.voteReceipt.deleteMany({ where: { electionId: testElection.id } });
      await prisma.voteTransaction.deleteMany({ where: { electionId: testElection.id } });
      await prisma.voterRegistry.deleteMany({ where: { electionId: testElection.id } });
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
    if (otherUser?.id) await prisma.user.delete({ where: { id: otherUser.id } });
  });

  test('generateReceipt: Should return receipt object with required immutable properties and NO voter PII', () => {
    const receiptData = voteService.generateReceipt(testUser.id, testElection.id, testCandidate.id);
    assert.ok(receiptData);
    assert.ok(receiptData.receiptId);
    assert.strictEqual(receiptData.electionId, testElection.id);
    assert.strictEqual(receiptData.candidateId, testCandidate.id);
    assert.ok(receiptData.voteTimestamp);
    assert.ok(receiptData.receiptHash);

    // Verify absence of sensitive voter PII
    assert.strictEqual(receiptData.voterId, undefined);
    assert.strictEqual(receiptData.userId, undefined);
    assert.strictEqual(receiptData.name, undefined);
    assert.strictEqual(receiptData.email, undefined);
  });

  test('castVote: Should issue immutable vote receipt in response', async () => {
    const result = await voteService.castVote(testUser.id, {
      electionId: testElection.id,
      candidateId: testCandidate.id,
      positionId: testPosition.id,
    });

    assert.ok(result);
    assert.ok(result.receipt);
    assert.ok(result.receipt.receiptId);
    assert.strictEqual(result.receipt.electionId, testElection.id);
    assert.strictEqual(result.receipt.candidateId, testCandidate.id);
    assert.ok(result.receipt.voteTimestamp);
    assert.ok(result.receipt.receiptHash);

    // Ensure no voter PII
    assert.strictEqual(result.receipt.voterId, undefined);
    assert.strictEqual(result.receipt.userId, undefined);

    // Object immutability check
    assert.throws(() => {
      result.receipt.candidateId = 'MUTATION_ATTEMPT';
    });
  });
});
