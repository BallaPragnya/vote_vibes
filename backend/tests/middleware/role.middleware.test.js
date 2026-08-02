import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import http from 'node:http';
import jwt from 'jsonwebtoken';
import config from '../../src/config/env.js';
import { authenticate } from '../../src/middleware/auth.middleware.js';
import { authorize } from '../../src/middleware/role.middleware.js';
import { errorHandler } from '../../src/middleware/errorHandler.js';
import prisma from '../../src/config/prisma.js';

describe('RBAC authorize Middleware Integration Tests', () => {
  let server;
  let adminOnlyUrl;
  let adminOrCandidateUrl;
  const uniqueId = Date.now();

  let adminUserToken;
  let voterUserToken;
  let candidateUserToken;

  before(async () => {
    // 1. Create Roles if not existing
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
    const candidateRole = await prisma.role.upsert({
      where: { name: 'CANDIDATE' },
      update: {},
      create: { name: 'CANDIDATE' },
    });

    // 2. Create test users
    const adminUser = await prisma.user.create({
      data: {
        name: 'Admin User',
        email: `rbac_admin_${uniqueId}@college.edu`,
        password: 'hashedPassword123',
        roleId: adminRole.id,
      },
    });

    const voterUser = await prisma.user.create({
      data: {
        name: 'Voter User',
        email: `rbac_voter_${uniqueId}@college.edu`,
        password: 'hashedPassword123',
        roleId: voterRole.id,
      },
    });

    const candidateUser = await prisma.user.create({
      data: {
        name: 'Candidate User',
        email: `rbac_candidate_${uniqueId}@college.edu`,
        password: 'hashedPassword123',
        roleId: candidateRole.id,
      },
    });

    // 3. Issue JWT Access Tokens
    adminUserToken = jwt.sign(
      { id: adminUser.id, email: adminUser.email, role: 'ADMIN' },
      config.jwtAccessSecret,
      { expiresIn: '15m' }
    );

    voterUserToken = jwt.sign(
      { id: voterUser.id, email: voterUser.email, role: 'VOTER' },
      config.jwtAccessSecret,
      { expiresIn: '15m' }
    );

    candidateUserToken = jwt.sign(
      { id: candidateUser.id, email: candidateUser.email, role: 'CANDIDATE' },
      config.jwtAccessSecret,
      { expiresIn: '15m' }
    );

    // 4. Setup Express test app
    const app = express();
    app.use(express.json());

    // Single role restricted endpoint
    app.post('/api/admin-only', authenticate, authorize('ADMIN'), (req, res) => {
      res.status(200).json({
        success: true,
        message: 'Admin access granted',
      });
    });

    // Multi-role restricted endpoint
    app.get('/api/admin-or-candidate', authenticate, authorize('ADMIN', 'CANDIDATE'), (req, res) => {
      res.status(200).json({
        success: true,
        message: 'Access granted',
      });
    });

    app.use(errorHandler);

    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    const port = server.address().port;
    adminOnlyUrl = `http://localhost:${port}/api/admin-only`;
    adminOrCandidateUrl = `http://localhost:${port}/api/admin-or-candidate`;
  });

  after(async () => {
    // Cleanup test users
    try {
      await prisma.user.deleteMany({
        where: { email: { contains: 'rbac_' } },
      });
    } catch (e) {
      // Ignore
    }
    if (server) {
      server.close();
    }
  });

  test('Forbidden: Should return 403 when VOTER tries to access ADMIN-only endpoint', async () => {
    const res = await fetch(adminOnlyUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${voterUserToken}`,
      },
    });

    const data = await res.json();
    assert.strictEqual(res.status, 403);
    assert.strictEqual(data.success, false);
    assert.strictEqual(data.message, 'You do not have permission to perform this action.');
    assert.strictEqual(data.error, 'ForbiddenError');
  });

  test('Success: Should return 200 when ADMIN accesses ADMIN-only endpoint', async () => {
    const res = await fetch(adminOnlyUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${adminUserToken}`,
      },
    });

    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.message, 'Admin access granted');
  });

  test('Success: Should return 200 when CANDIDATE accesses multi-role endpoint (ADMIN, CANDIDATE)', async () => {
    const res = await fetch(adminOrCandidateUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${candidateUserToken}`,
      },
    });

    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
  });

  test('Forbidden: Should return 403 when VOTER accesses multi-role endpoint (ADMIN, CANDIDATE)', async () => {
    const res = await fetch(adminOrCandidateUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${voterUserToken}`,
      },
    });

    const data = await res.json();
    assert.strictEqual(res.status, 403);
    assert.strictEqual(data.success, false);
  });
});
