import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import prisma from '../../src/config/prisma.js';
import candidateRepository from '../../src/repositories/candidate.repository.js';

describe('CandidateRepository Unit Tests', () => {
  const uniqueId = Date.now();
  let testUser;
  let testElection;
  let testPosition;
  let testCandidate;

  before(async () => {
    // 1. Create role and user
    const role = await prisma.role.upsert({
      where: { name: 'STUDENT' },
      update: {},
      create: { name: 'STUDENT' },
    });

    testUser = await prisma.user.create({
      data: {
        name: 'Repo Candidate User',
        email: `cand_repo_user_${uniqueId}@college.edu`,
        password: 'hashedPassword123',
        roleId: role.id,
      },
    });

    // 2. Create election and position
    testElection = await prisma.election.create({
      data: {
        title: `Repo Candidate Election ${uniqueId}`,
        startTime: new Date(Date.now() + 3600000),
        endTime: new Date(Date.now() + 86400000),
        createdById: testUser.id,
      },
    });

    testPosition = await prisma.position.create({
      data: {
        electionId: testElection.id,
        title: 'Student Body President',
        maxChoices: 1,
      },
    });
  });

  after(async () => {
    if (testElection?.id) {
      await prisma.candidate.deleteMany({ where: { electionId: testElection.id } });
      await prisma.position.deleteMany({ where: { electionId: testElection.id } });
      await prisma.election.delete({ where: { id: testElection.id } });
    }
    if (testUser?.id) {
      await prisma.user.delete({ where: { id: testUser.id } });
    }
  });

  test('createCandidate: Should create a new candidate record with electionId, fullName, and profileImage', async () => {
    testCandidate = await candidateRepository.createCandidate({
      electionId: testElection.id,
      positionId: testPosition.id,
      userId: testUser.id,
      fullName: 'Repo Candidate FullName',
      manifesto: 'I promise better facilities and student representation.',
      profileImage: 'https://example.com/profile.jpg',
      nominationStatus: 'PENDING',
      approvalStatus: 'PENDING',
    });

    assert.ok(testCandidate.id);
    assert.strictEqual(testCandidate.electionId, testElection.id);
    assert.strictEqual(testCandidate.positionId, testPosition.id);
    assert.strictEqual(testCandidate.userId, testUser.id);
    assert.strictEqual(testCandidate.fullName, 'Repo Candidate FullName');
    assert.strictEqual(testCandidate.nominationStatus, 'PENDING');
    assert.strictEqual(testCandidate.approvalStatus, 'PENDING');
  });

  test('getCandidateById: Should retrieve candidate details by ID', async () => {
    const fetched = await candidateRepository.getCandidateById(testCandidate.id);
    assert.ok(fetched);
    assert.strictEqual(fetched.id, testCandidate.id);
    assert.strictEqual(fetched.user.name, 'Repo Candidate User');
    assert.strictEqual(fetched.election.title, `Repo Candidate Election ${uniqueId}`);
  });

  test('getCandidates: Should list candidates with filtering, search, and pagination', async () => {
    const result = await candidateRepository.getCandidates({
      electionId: testElection.id,
      search: 'FullName',
      page: 1,
      limit: 10,
    });

    assert.strictEqual(result.candidates.length, 1);
    assert.strictEqual(result.candidates[0].id, testCandidate.id);
    assert.strictEqual(result.page, 1);
  });

  test('approveCandidate: Should approve candidate nomination', async () => {
    const approved = await candidateRepository.approveCandidate(testCandidate.id);
    assert.strictEqual(approved.approvalStatus, 'APPROVED');
    assert.strictEqual(approved.nominationStatus, 'APPROVED');
  });

  test('rejectCandidate: Should reject candidate nomination', async () => {
    const rejected = await candidateRepository.rejectCandidate(testCandidate.id);
    assert.strictEqual(rejected.approvalStatus, 'REJECTED');
    assert.strictEqual(rejected.nominationStatus, 'REJECTED');
  });

  test('deleteCandidate: Should remove candidate record', async () => {
    await candidateRepository.deleteCandidate(testCandidate.id);
    const fetched = await candidateRepository.getCandidateById(testCandidate.id);
    assert.strictEqual(fetched, null);
  });
});
