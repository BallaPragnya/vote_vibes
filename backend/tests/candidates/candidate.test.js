import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../../src/config/prisma.js';
import config from '../../src/config/env.js';
import routes from '../../src/routes/index.js';
import { errorHandler } from '../../src/middleware/errorHandler.js';

describe('Candidate Module Integration Tests', () => {
  let server;
  let baseUrl;
  const uniqueId = Date.now();

  let adminToken;
  let studentToken;
  let otherStudentToken;

  let studentUser;
  let otherStudentUser;
  let adminUser;

  let testElection;
  let testPosition;
  let createdCandidateId;

  before(async () => {
    // 1. Fetch or create Roles
    const studentRole = await prisma.role.upsert({
      where: { name: 'STUDENT' },
      update: {},
      create: { name: 'STUDENT' },
    });

    const adminRole = await prisma.role.upsert({
      where: { name: 'ADMIN' },
      update: {},
      create: { name: 'ADMIN' },
    });

    // 2. Create Test Users
    studentUser = await prisma.user.create({
      data: {
        name: 'Candidate Student',
        email: `cand_student_${uniqueId}@college.edu`,
        password: 'hashedPassword123',
        roleId: studentRole.id,
      },
    });

    otherStudentUser = await prisma.user.create({
      data: {
        name: 'Other Student',
        email: `other_student_${uniqueId}@college.edu`,
        password: 'hashedPassword123',
        roleId: studentRole.id,
      },
    });

    adminUser = await prisma.user.create({
      data: {
        name: 'Candidate Admin',
        email: `cand_admin_${uniqueId}@college.edu`,
        password: 'hashedPassword123',
        roleId: adminRole.id,
      },
    });

    // 3. Issue Tokens
    studentToken = jwt.sign(
      { id: studentUser.id, email: studentUser.email, role: 'STUDENT' },
      config.jwtAccessSecret,
      { expiresIn: '15m' }
    );

    otherStudentToken = jwt.sign(
      { id: otherStudentUser.id, email: otherStudentUser.email, role: 'STUDENT' },
      config.jwtAccessSecret,
      { expiresIn: '15m' }
    );

    adminToken = jwt.sign(
      { id: adminUser.id, email: adminUser.email, role: 'ADMIN' },
      config.jwtAccessSecret,
      { expiresIn: '15m' }
    );

    // 4. Create Election & Position
    testElection = await prisma.election.create({
      data: {
        title: `Candidate Test Election ${uniqueId}`,
        startTime: new Date(Date.now() + 3600000),
        endTime: new Date(Date.now() + 86400000),
        createdById: adminUser.id,
      },
    });

    testPosition = await prisma.position.create({
      data: {
        electionId: testElection.id,
        title: 'Vice President',
        maxChoices: 1,
      },
    });

    // 5. Start Test HTTP Server
    const app = express();
    app.use(express.json());
    app.use('/', routes);
    app.use(errorHandler);

    await new Promise((resolve) => {
      server = app.listen(0, () => {
        const port = server.address().port;
        baseUrl = `http://localhost:${port}/api/candidates`;
        resolve();
      });
    });
  });

  after(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }

    if (testElection?.id) {
      await prisma.candidate.deleteMany({ where: { electionId: testElection.id } });
      await prisma.position.deleteMany({ where: { electionId: testElection.id } });
      await prisma.election.delete({ where: { id: testElection.id } });
    }

    if (studentUser?.id) await prisma.user.delete({ where: { id: studentUser.id } });
    if (otherStudentUser?.id) await prisma.user.delete({ where: { id: otherStudentUser.id } });
    if (adminUser?.id) await prisma.user.delete({ where: { id: adminUser.id } });
  });

  test('Authentication Guard: Should return 401 Unauthorized when missing token', async () => {
    const res = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        electionId: testElection.id,
        positionId: testPosition.id,
        fullName: 'Test Candidate',
        manifesto: 'Test manifesto statement.',
      }),
    });

    assert.strictEqual(res.status, 401);
  });

  test('Validation: Should return 400 Bad Request when electionId is missing', async () => {
    const res = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({
        fullName: 'Test Candidate',
        manifesto: 'Test manifesto statement without electionId.',
      }),
    });

    const data = await res.json();
    assert.strictEqual(res.status, 400);
    assert.strictEqual(data.success, false);
    assert.strictEqual(data.error, 'ValidationError');
  });

  test('Success: Should allow student to submit candidacy nomination (201 Created)', async () => {
    const res = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({
        electionId: testElection.id,
        positionId: testPosition.id,
        fullName: 'Candidate Student',
        manifesto: 'I promise to advocate for all students and improve facilities.',
        photoUrl: 'https://example.com/candidate.jpg',
      }),
    });

    const data = await res.json();
    assert.strictEqual(res.status, 201);
    assert.strictEqual(data.success, true);
    assert.ok(data.data.id);
    assert.strictEqual(data.data.status, 'PENDING');
    assert.strictEqual(data.data.userId, studentUser.id);

    createdCandidateId = data.data.id;
  });

  test('Duplicate Rule: Should reject duplicate nomination for same position (400 Bad Request)', async () => {
    const res = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({
        electionId: testElection.id,
        positionId: testPosition.id,
        fullName: 'Candidate Student',
        manifesto: 'Duplicate nomination attempt with long manifesto.',
      }),
    });

    const data = await res.json();
    assert.strictEqual(res.status, 400);
    assert.strictEqual(data.error, 'DuplicateNominationError');
  });

  test('Success: Should allow authenticated users to retrieve candidate list (200 OK)', async () => {
    const res = await fetch(`${baseUrl}?positionId=${testPosition.id}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${studentToken}`,
      },
    });

    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    assert.ok(Array.isArray(data.data.candidates));
    assert.strictEqual(data.data.candidates.length, 1);
  });

  test('Search: Should filter candidates by search keyword matching fullName or manifesto with pagination and filters (200 OK)', async () => {
    const res = await fetch(`${baseUrl}?electionId=${testElection.id}&search=advocate&page=1&limit=5`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${studentToken}`,
      },
    });

    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    assert.ok(Array.isArray(data.data.candidates));
    assert.strictEqual(data.data.candidates.length, 1);
    assert.strictEqual(data.data.page, 1);
    assert.strictEqual(data.data.limit, 5);
  });

  test('Filtering: Should filter candidates by approvalStatus, nominationStatus, and electionId combined with search and pagination (200 OK)', async () => {
    const res = await fetch(
      `${baseUrl}?electionId=${testElection.id}&approvalStatus=PENDING&nominationStatus=PENDING&search=advocate&page=1&limit=10`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      }
    );

    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    assert.ok(Array.isArray(data.data.candidates));
    assert.strictEqual(data.data.candidates.length, 1);
    assert.strictEqual(data.data.candidates[0].approvalStatus, 'PENDING');
    assert.strictEqual(data.data.candidates[0].nominationStatus, 'PENDING');
  });

  test('Success: Should retrieve candidate details by ID (200 OK)', async () => {
    const res = await fetch(`${baseUrl}/${createdCandidateId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${studentToken}`,
      },
    });

    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.data.id, createdCandidateId);
  });

  test('RBAC Review Guard: Should reject candidate status review by STUDENT (403 Forbidden)', async () => {
    const res = await fetch(`${baseUrl}/${createdCandidateId}/approve`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${studentToken}`,
      },
    });

    const data = await res.json();
    assert.strictEqual(res.status, 403);
    assert.strictEqual(data.error, 'ForbiddenError');
  });

  test('Success: Should allow ADMIN to approve candidate nomination via PATCH /approve (200 OK)', async () => {
    const res = await fetch(`${baseUrl}/${createdCandidateId}/approve`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });

    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.data.approvalStatus, 'APPROVED');
  });

  test('Withdrawal Rule: Candidate cannot withdraw nomination after it has been approved (400 Bad Request)', async () => {
    const res = await fetch(`${baseUrl}/${createdCandidateId}/withdraw`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${studentToken}`,
      },
    });

    const data = await res.json();
    assert.strictEqual(res.status, 400);
    assert.strictEqual(data.error, 'InvalidStateError');
  });

  test('Success: Should allow ADMIN to reject candidate nomination via PATCH /reject (200 OK)', async () => {
    const res = await fetch(`${baseUrl}/${createdCandidateId}/reject`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });

    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.data.approvalStatus, 'REJECTED');
  });
});
