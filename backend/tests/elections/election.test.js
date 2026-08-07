import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import http from 'node:http';
import jwt from 'jsonwebtoken';
import config from '../../src/config/env.js';
import routes from '../../src/routes/index.js';
import { errorHandler } from '../../src/middleware/errorHandler.js';
import prisma from '../../src/config/prisma.js';

describe('Election Module Integration Tests', () => {
  let server;
  let baseUrl;
  const uniqueId = Date.now();

  let adminToken;
  let superAdminToken;
  let voterToken;
  let adminUser;

  before(async () => {
    // 1. Ensure Roles exist
    const adminRole = await prisma.role.upsert({
      where: { name: 'ADMIN' },
      update: {},
      create: { name: 'ADMIN' },
    });
    const voterRole = await prisma.role.upsert({
      where: { name: 'VOTER' },
      update: {},
      create: { name: 'VOTER' },
    });

    // 2. Create Admin and Voter users
    adminUser = await prisma.user.create({
      data: {
        name: 'Election Admin',
        email: `election_admin_${uniqueId}@college.edu`,
        password: 'hashedPassword123',
        roleId: adminRole.id,
      },
    });

    const voterUser = await prisma.user.create({
      data: {
        name: 'Election Voter',
        email: `election_voter_${uniqueId}@college.edu`,
        password: 'hashedPassword123',
        roleId: voterRole.id,
      },
    });

    // 3. Issue Tokens
    superAdminToken = jwt.sign(
      { id: adminUser.id, email: adminUser.email, role: 'SUPER_ADMIN' },
      config.jwtAccessSecret,
      { expiresIn: '15m' }
    );

    adminToken = jwt.sign(
      { id: adminUser.id, email: adminUser.email, role: 'ADMIN' },
      config.jwtAccessSecret,
      { expiresIn: '15m' }
    );

    voterToken = jwt.sign(
      { id: voterUser.id, email: voterUser.email, role: 'VOTER' },
      config.jwtAccessSecret,
      { expiresIn: '15m' }
    );

    // 4. Start Test Server
    const app = express();
    app.use(express.json());
    app.use('/', routes);
    app.use(errorHandler);

    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    const port = server.address().port;
    baseUrl = `http://localhost:${port}/api/elections`;
  });

  after(async () => {
    // Cleanup created elections & test users
    try {
      await prisma.election.deleteMany({
        where: { title: { contains: 'Test Election' } },
      });
      await prisma.user.deleteMany({
        where: { email: { contains: 'election_' } },
      });
    } catch (e) {
      // Ignore
    }
    if (server) {
      server.close();
    }
  });

  test('RBAC: Should return 403 Forbidden when VOTER attempts to create an election', async () => {
    const startTime = new Date(Date.now() + 3600000).toISOString();
    const endTime = new Date(Date.now() + 86400000).toISOString();

    const res = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${voterToken}`,
      },
      body: JSON.stringify({
        title: 'Test Election Unauthorized',
        startTime,
        endTime,
      }),
    });

    const data = await res.json();
    assert.strictEqual(res.status, 403);
    assert.strictEqual(data.success, false);
    assert.strictEqual(data.error, 'ForbiddenError');
  });

  test('Success: Should allow SUPER_ADMIN to create an election (201 Created)', async () => {
    const startTime = new Date(Date.now() + 3600000).toISOString();
    const endTime = new Date(Date.now() + 86400000).toISOString();

    const res = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${superAdminToken}`,
      },
      body: JSON.stringify({
        title: 'Test Election Super Admin 2026',
        startTime,
        endTime,
      }),
    });

    const data = await res.json();
    assert.strictEqual(res.status, 201);
    assert.strictEqual(data.success, true);
  });

  test('Validation: Should return 400 Bad Request when title is missing', async () => {
    const startTime = new Date(Date.now() + 3600000).toISOString();
    const endTime = new Date(Date.now() + 86400000).toISOString();

    const res = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        startTime,
        endTime,
      }),
    });

    const data = await res.json();
    assert.strictEqual(res.status, 400);
    assert.strictEqual(data.success, false);
    assert.strictEqual(data.error, 'ValidationError');
  });

  test('Validation: Should return 400 Bad Request when endTime <= startTime', async () => {
    const startTime = new Date(Date.now() + 86400000).toISOString();
    const endTime = new Date(Date.now() + 3600000).toISOString(); // End before start

    const res = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        title: 'Test Election Bad Dates',
        startTime,
        endTime,
      }),
    });

    const data = await res.json();
    assert.strictEqual(res.status, 400);
    assert.strictEqual(data.success, false);
    assert.strictEqual(data.message, 'End date must be strictly after start date.');
  });

  let createdElectionId;

  test('Success: Should allow ADMIN to create a new election (201 Created)', async () => {
    const startTime = new Date(Date.now() - 3600000).toISOString();
    const endTime = new Date(Date.now() + 86400000).toISOString();

    const res = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        title: 'Test Election Student Council 2026',
        description: 'Annual college election for student council representatives.',
        startTime,
        endTime,
        isDepartmentRestricted: false,
      }),
    });

    const data = await res.json();
    assert.strictEqual(res.status, 201);
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.message, 'Election created successfully');
    assert.ok(data.data.id);
    assert.strictEqual(data.data.title, 'Test Election Student Council 2026');
    assert.strictEqual(data.data.status, 'DRAFT');

    createdElectionId = data.data.id;
  });

  test('Success: Should allow authenticated users to retrieve elections list (200 OK)', async () => {
    const res = await fetch(baseUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${voterToken}`,
      },
    });

    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    assert.ok(Array.isArray(data.data.elections));
    assert.ok(data.data.total >= 1);
  });

  test('Success: Should filter elections by status (?status=DRAFT)', async () => {
    const res = await fetch(`${baseUrl}?status=DRAFT`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${voterToken}`,
      },
    });

    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    assert.ok(Array.isArray(data.data.data));
    assert.ok(data.data.data.every((e) => e.status === 'DRAFT'));
  });

  test('Success: Should retrieve election details by ID (200 OK)', async () => {
    const res = await fetch(`${baseUrl}/${createdElectionId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${voterToken}`,
      },
    });

    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.data.id, createdElectionId);
    assert.strictEqual(data.data.title, 'Test Election Student Council 2026');
  });

  test('Success: Should allow ADMIN to update DRAFT election properties (200 OK)', async () => {
    const res = await fetch(`${baseUrl}/${createdElectionId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        title: 'Test Election Student Council 2026 (Updated)',
      }),
    });

    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.data.title, 'Test Election Student Council 2026 (Updated)');
  });

  test('Success: Should allow transition from DRAFT to ACTIVE status (200 OK)', async () => {
    const res = await fetch(`${baseUrl}/${createdElectionId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        status: 'ACTIVE',
      }),
    });

    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.data.status, 'ACTIVE');
  });

  test('Invalid Transition: Should reject transition from ACTIVE back to DRAFT (400 Bad Request)', async () => {
    const res = await fetch(`${baseUrl}/${createdElectionId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        status: 'DRAFT',
      }),
    });

    const data = await res.json();
    assert.strictEqual(res.status, 400);
    assert.strictEqual(data.success, false);
    assert.strictEqual(data.error, 'InvalidStatusTransitionError');
  });
});
