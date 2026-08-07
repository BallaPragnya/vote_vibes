import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import prisma from '../../src/config/prisma.js';
import blockchainIntegrationService from '../../src/services/blockchainIntegration.service.js';
import voteRepository from '../../src/repositories/vote.repository.js';

describe('Blockchain Integration Service Unit Tests', () => {
  let testUser;
  let testElection;
  let testPosition;
  let testCandidate;
  let testVote;
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
        name: 'BC User',
        email: `bc_${uniqueId}@college.edu`,
        password: 'hashedpassword',
        roleId: testRole.id,
      },
    });

    testElection = await prisma.election.create({
      data: {
        title: `BC Election ${uniqueId}`,
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
        fullName: 'BC Candidate',
        manifesto: 'Manifesto statement for blockchain test.',
        approvalStatus: 'APPROVED',
        nominationStatus: 'APPROVED',
        status: 'APPROVED',
      },
    });

    testVote = await voteRepository.createVote({
      electionId: testElection.id,
      candidateId: testCandidate.id,
      voterId: testUser.id,
      transactionReceipt: `RECEIPT_BC_${uniqueId}`,
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
    if (testUser?.id) await prisma.user.delete({ where: { id: testUser.id } });
  });

  test('prepareBlockchainPayload: Should prepare anonymized payload without voter PII', () => {
    const payload = blockchainIntegrationService.prepareBlockchainPayload({
      userId: testUser.id,
      electionId: testElection.id,
      candidateId: testCandidate.id,
    });

    assert.ok(payload);
    assert.ok(payload.voterHash);
    assert.strictEqual(payload.electionId, testElection.id);
    assert.strictEqual(payload.candidateId, testCandidate.id);

    // Verify absence of sensitive voter PII
    assert.strictEqual(payload.userId, undefined);
    assert.strictEqual(payload.email, undefined);
  });

  test('recordVoteOnBlockchain: Should record block and update blockchainTransactionId in Vote record', async () => {
    const result = await blockchainIntegrationService.recordVoteOnBlockchain({
      voteId: testVote.id,
      userId: testUser.id,
      electionId: testElection.id,
      candidateId: testCandidate.id,
      positionId: testPosition.id,
    });

    assert.ok(result);
    assert.strictEqual(result.success, true);
    assert.ok(result.blockchainTransactionId);
    assert.ok(result.blockHash);

    // Verify reference saved in Vote DB record
    const updatedVote = await voteRepository.getVoteById(testVote.id);
    assert.strictEqual(updatedVote.blockchainTransactionId, result.blockchainTransactionId);
  });

  test('recordVoteOnBlockchain: Should handle blockchain errors gracefully', async () => {
    // Pass invalid target vote ID to test graceful fallback
    const result = await blockchainIntegrationService.recordVoteOnBlockchain({
      voteId: '00000000-0000-4000-a000-000000000000',
      userId: testUser.id,
      electionId: 'invalid-election-id',
      candidateId: testCandidate.id,
    });

    assert.ok(result);
    assert.ok(result.blockchainTransactionId);
    assert.match(result.blockchainTransactionId, /^FALLBACK-PENDING-/);
  });
});
