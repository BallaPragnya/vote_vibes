import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import prisma from '../../src/config/prisma.js';
import voteRepository from '../../src/repositories/vote.repository.js';

describe('VoteRepository Unit Tests', () => {
  let testUser;
  let testElection;
  let testPosition;
  let testCandidate;
  let testRole;
  let createdVote;
  const uniqueId = Date.now();

  before(async () => {
    testRole = await prisma.role.upsert({
      where: { name: 'STUDENT' },
      update: {},
      create: { name: 'STUDENT' },
    });

    testUser = await prisma.user.create({
      data: {
        name: 'Repo Vote User',
        email: `repo_vote_${uniqueId}@college.edu`,
        password: 'hashedpassword',
        roleId: testRole.id,
      },
    });

    testElection = await prisma.election.create({
      data: {
        title: `Repo Vote Election ${uniqueId}`,
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
        fullName: 'Candidate One',
        manifesto: 'Manifesto details for vote repo test.',
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
    if (testUser?.id) {
      await prisma.user.delete({ where: { id: testUser.id } });
    }
  });

  test('createVote: Should insert a new Vote record', async () => {
    createdVote = await voteRepository.createVote({
      electionId: testElection.id,
      candidateId: testCandidate.id,
      voterId: testUser.id,
      transactionReceipt: `RECEIPT_INIT_${uniqueId}`,
    });

    assert.ok(createdVote);
    assert.ok(createdVote.id);
    assert.strictEqual(createdVote.electionId, testElection.id);
    assert.strictEqual(createdVote.candidateId, testCandidate.id);
    assert.strictEqual(createdVote.voterId, testUser.id);
  });

  test('getVoteById: Should retrieve vote details by ID with relations', async () => {
    const fetched = await voteRepository.getVoteById(createdVote.id);
    assert.ok(fetched);
    assert.strictEqual(fetched.id, createdVote.id);
    assert.strictEqual(fetched.election.title, `Repo Vote Election ${uniqueId}`);
    assert.strictEqual(fetched.candidate.fullName, 'Candidate One');
  });

  test('getVoteByVoter: Should retrieve votes cast by voter ID', async () => {
    const votes = await voteRepository.getVoteByVoter(testUser.id, testElection.id);
    assert.ok(Array.isArray(votes));
    assert.strictEqual(votes.length, 1);
    assert.strictEqual(votes[0].id, createdVote.id);
  });

  test('hasAlreadyVoted: Should return true after vote is cast', async () => {
    const hasVoted = await voteRepository.hasAlreadyVoted(testUser.id, testElection.id);
    assert.strictEqual(hasVoted, true);
  });

  test('getVotesByElection: Should retrieve paginated votes for an election', async () => {
    const result = await voteRepository.getVotesByElection(testElection.id, { page: 1, limit: 10 });
    assert.ok(result);
    assert.ok(Array.isArray(result.votes));
    assert.strictEqual(result.votes.length, 1);
    assert.strictEqual(result.total, 1);
  });

  test('saveReceipt: Should update transactionReceipt on Vote', async () => {
    const updated = await voteRepository.saveReceipt(createdVote.id, `RECEIPT_UPDATED_${uniqueId}`, 'TX_BLOCKCHAIN_123');
    assert.ok(updated);
    assert.strictEqual(updated.transactionReceipt, `RECEIPT_UPDATED_${uniqueId}`);
    assert.strictEqual(updated.blockchainTransactionId, 'TX_BLOCKCHAIN_123');
  });
});
