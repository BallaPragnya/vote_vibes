import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import electionRepository from '../../src/repositories/election.repository.js';
import prisma from '../../src/config/prisma.js';

describe('ElectionRepository Unit Tests', () => {
  let createdUser;
  let election1;
  let election2;
  const uniqueId = Date.now();

  before(async () => {
    // 1. Create role & test user
    const role = await prisma.role.upsert({
      where: { name: 'ADMIN' },
      update: {},
      create: { name: 'ADMIN' },
    });

    createdUser = await prisma.user.create({
      data: {
        name: 'Repo Test User',
        email: `repo_user_${uniqueId}@college.edu`,
        password: 'hashedPassword123',
        roleId: role.id,
      },
    });

    // 2. Create test elections via electionRepository
    election1 = await electionRepository.createElection({
      title: `Repo Test Alpha Election ${uniqueId}`,
      description: 'Alpha election description for search test',
      startTime: new Date(Date.now() + 3600000).toISOString(),
      endTime: new Date(Date.now() + 86400000).toISOString(),
      status: 'DRAFT',
      createdById: createdUser.id,
    });

    election2 = await electionRepository.createElection({
      title: `Repo Test Beta Election ${uniqueId}`,
      description: 'Beta election description for filtering',
      startTime: new Date(Date.now() + 7200000).toISOString(),
      endTime: new Date(Date.now() + 172800000).toISOString(),
      status: 'UPCOMING',
      createdById: createdUser.id,
    });
  });

  after(async () => {
    try {
      await prisma.election.deleteMany({
        where: { createdById: createdUser.id },
      });
      await prisma.user.delete({
        where: { id: createdUser.id },
      });
    } catch (e) {
      // Ignore
    }
  });

  test('getElectionById: Should retrieve election by ID', async () => {
    const fetched = await electionRepository.getElectionById(election1.id);
    assert.ok(fetched);
    assert.strictEqual(fetched.id, election1.id);
    assert.strictEqual(fetched.title, election1.title);
  });

  test('getAllElections: Should filter by status UPCOMING', async () => {
    const result = await electionRepository.getAllElections({
      status: 'UPCOMING',
      createdById: createdUser.id,
    });

    assert.strictEqual(result.elections.length, 1);
    assert.strictEqual(result.elections[0].id, election2.id);
  });

  test('getAllElections: Should search by keyword in title or description', async () => {
    const result = await electionRepository.getAllElections({
      search: 'Alpha',
      createdById: createdUser.id,
    });

    assert.strictEqual(result.elections.length, 1);
    assert.strictEqual(result.elections[0].id, election1.id);
  });

  test('getAllElections: Should support sort=latest, sort=oldest, sort=startDate, sort=endDate', async () => {
    const latest = await electionRepository.getAllElections({
      createdById: createdUser.id,
      sort: 'latest',
    });
    assert.strictEqual(latest.elections.length, 2);

    const oldest = await electionRepository.getAllElections({
      createdById: createdUser.id,
      sort: 'oldest',
    });
    assert.strictEqual(oldest.elections.length, 2);
    assert.strictEqual(oldest.elections[0].id, election1.id);

    const startDateSort = await electionRepository.getAllElections({
      createdById: createdUser.id,
      sort: 'startDate',
    });
    assert.strictEqual(startDateSort.elections.length, 2);

    const endDateSort = await electionRepository.getAllElections({
      createdById: createdUser.id,
      sort: 'endDate',
    });
    assert.strictEqual(endDateSort.elections.length, 2);
  });

  test('updateElection: Should update title and status', async () => {
    const updated = await electionRepository.updateElection(election1.id, {
      title: `Repo Test Alpha Election Updated ${uniqueId}`,
      status: 'ACTIVE',
    });

    assert.strictEqual(updated.title, `Repo Test Alpha Election Updated ${uniqueId}`);
    assert.strictEqual(updated.status, 'ACTIVE');
  });

  test('deleteElection: Should soft-delete election record by marking status ARCHIVED and excluding from queries', async () => {
    const deleted = await electionRepository.deleteElection(election1.id);
    assert.strictEqual(deleted.id, election1.id);
    assert.strictEqual(deleted.status, 'ARCHIVED');

    const fetched = await electionRepository.getElectionById(election1.id);
    assert.strictEqual(fetched.status, 'ARCHIVED');

    const activeList = await electionRepository.getAllElections({ createdById: createdUser.id });
    assert.ok(activeList.elections.every((e) => e.id !== election1.id));
  });
});
