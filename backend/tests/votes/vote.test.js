import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../../src/config/prisma.js';
import config from '../../src/config/env.js';
import voteRoutes from '../../src/routes/vote.routes.js';
import { errorHandler } from '../../src/middleware/errorHandler.js';

describe('Voting Module Security, Duplicate Protection & Receipt Lookup Tests', () => {
  let app;
  let server;
  let baseUrl;
  let adminToken;
  let studentToken;
  let secondStudentToken;
  let studentUser;
  let secondStudentUser;
  let adminUser;
  let testElection;
  let testPosition;
  let testCandidate;
  let testRoleStudent;
  let testRoleAdmin;
  let castedVoteId;
  let castedReceiptCode;
  let castedReceiptId;
  const uniqueId = Date.now();

  before(async () => {
    testRoleStudent = await prisma.role.upsert({
      where: { name: 'STUDENT' },
      update: {},
      create: { name: 'STUDENT' },
    });

    testRoleAdmin = await prisma.role.upsert({
      where: { name: 'ADMIN' },
      update: {},
      create: { name: 'ADMIN' },
    });

    adminUser = await prisma.user.create({
      data: {
        name: 'Vote RBAC Admin User',
        email: `rbac_admin_${uniqueId}@college.edu`,
        password: 'hashedpassword',
        roleId: testRoleAdmin.id,
      },
    });

    studentUser = await prisma.user.create({
      data: {
        name: 'Vote RBAC Student User',
        email: `rbac_student_${uniqueId}@college.edu`,
        password: 'hashedpassword',
        roleId: testRoleStudent.id,
      },
    });

    secondStudentUser = await prisma.user.create({
      data: {
        name: 'Second Student User',
        email: `rbac_student2_${uniqueId}@college.edu`,
        password: 'hashedpassword',
        roleId: testRoleStudent.id,
      },
    });

    const jwtSecret = config.jwtSecret || config.jwtAccessSecret || 'super_secret_access_jwt_key_votevibes_2026';

    adminToken = jwt.sign(
      { id: adminUser.id, email: adminUser.email, role: 'ADMIN' },
      jwtSecret,
      { expiresIn: '1h' }
    );

    studentToken = jwt.sign(
      { id: studentUser.id, email: studentUser.email, role: 'STUDENT' },
      jwtSecret,
      { expiresIn: '1h' }
    );

    secondStudentToken = jwt.sign(
      { id: secondStudentUser.id, email: secondStudentUser.email, role: 'STUDENT' },
      jwtSecret,
      { expiresIn: '1h' }
    );

    testElection = await prisma.election.create({
      data: {
        title: `RBAC Voting Election ${uniqueId}`,
        startTime: new Date(Date.now() - 3600000),
        endTime: new Date(Date.now() + 3600000),
        status: 'ACTIVE',
        createdById: adminUser.id,
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
        userId: adminUser.id,
        fullName: 'RBAC Candidate',
        manifesto: 'Manifesto statement for RBAC test.',
        approvalStatus: 'APPROVED',
        nominationStatus: 'APPROVED',
        status: 'APPROVED',
      },
    });

    app = express();
    app.use(express.json());
    app.use('/api/votes', voteRoutes);
    app.use(errorHandler);

    await new Promise((resolve) => {
      server = app.listen(0, '127.0.0.1', () => {
        const address = server.address();
        baseUrl = `http://127.0.0.1:${address.port}/api/votes`;
        resolve();
      });
    });
  });

  after(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    if (testElection?.id) {
      await prisma.vote.deleteMany({ where: { electionId: testElection.id } });
      await prisma.voteReceipt.deleteMany({ where: { electionId: testElection.id } });
      await prisma.voteTransaction.deleteMany({ where: { electionId: testElection.id } });
      await prisma.voterRegistry.deleteMany({ where: { electionId: testElection.id } });
      await prisma.candidate.deleteMany({ where: { electionId: testElection.id } });
      await prisma.position.deleteMany({ where: { electionId: testElection.id } });
      await prisma.election.delete({ where: { id: testElection.id } });
    }
    if (studentUser?.id) await prisma.user.delete({ where: { id: studentUser.id } });
    if (secondStudentUser?.id) await prisma.user.delete({ where: { id: secondStudentUser.id } });
    if (adminUser?.id) await prisma.user.delete({ where: { id: adminUser.id } });
  });

  test('Voter: Should allow authenticated student to cast vote (201 Created)', async () => {
    const res = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({
        electionId: testElection.id,
        candidateId: testCandidate.id,
        positionId: testPosition.id,
      }),
    });

    const json = await res.json();
    assert.strictEqual(res.status, 201);
    assert.strictEqual(json.success, true);
    assert.ok(json.data.voteId);

    castedVoteId = json.data.voteId;
    castedReceiptCode = json.data.receiptCode;
    castedReceiptId = json.data.receipt.receiptId;
  });

  test('Receipt Lookup: Should return full receipt details (receipt, election, candidate, timestamp, blockchain)', async () => {
    const res = await fetch(`${baseUrl}/receipt/${castedReceiptId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${studentToken}`,
      },
    });

    const json = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(json.success, true);
    assert.strictEqual(json.data.receiptId, castedReceiptId);
    assert.strictEqual(json.data.receiptCode, castedReceiptCode);
    assert.ok(json.data.receiptHash);
    assert.strictEqual(json.data.election.id, testElection.id);
    assert.strictEqual(json.data.candidate.id, testCandidate.id);
    assert.ok(json.data.timestamp);
    assert.ok(json.data.blockchain.blockchainTransactionId !== undefined);
  });

  test('Receipt Security: Should deny unauthorized voter from accessing another user receipt (403 Forbidden)', async () => {
    const res = await fetch(`${baseUrl}/receipt/${castedReceiptId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${secondStudentToken}`,
      },
    });

    const json = await res.json();
    assert.strictEqual(res.status, 403);
    assert.strictEqual(json.success, false);
    assert.strictEqual(json.error, 'ForbiddenError');
  });

  test('Receipt Admin Lookup: Should allow ADMIN to view any voter receipt (200 OK)', async () => {
    const res = await fetch(`${baseUrl}/receipt/${castedReceiptId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });

    const json = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(json.success, true);
    assert.strictEqual(json.data.receiptId, castedReceiptId);
  });

  test('Duplicate Protection: Should reject second vote attempt by same voter (400 DuplicateVoteError)', async () => {
    const res = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({
        electionId: testElection.id,
        candidateId: testCandidate.id,
        positionId: testPosition.id,
      }),
    });

    const json = await res.json();
    assert.strictEqual(res.status, 400);
    assert.strictEqual(json.success, false);
    assert.strictEqual(json.error, 'DuplicateVoteError');
  });

  test('RBAC Security: Should deny STUDENT access to admin election vote list (403 Forbidden)', async () => {
    const res = await fetch(`${baseUrl}/election/${testElection.id}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${studentToken}`,
      },
    });

    const json = await res.json();
    assert.strictEqual(res.status, 403);
    assert.strictEqual(json.success, false);
    assert.strictEqual(json.error, 'ForbiddenError');
  });

  test('Admin: Should allow ADMIN access to election vote list (200 OK)', async () => {
    const res = await fetch(`${baseUrl}/election/${testElection.id}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });

    const json = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(json.success, true);
    assert.ok(Array.isArray(json.data));
  });
});
