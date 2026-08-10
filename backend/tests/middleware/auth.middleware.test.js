import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import http from 'node:http';
import jwt from 'jsonwebtoken';
import config from '../../src/config/env.js';
import { authenticate } from '../../src/middleware/auth.middleware.js';
import { errorHandler } from '../../src/middleware/errorHandler.js';
import prisma from '../../src/config/prisma.js';

describe('JWT Authentication Middleware Integration Tests', () => {
  let server;
  let protectedUrl;
  const uniqueId = Date.now();
  const testEmail = `middleware_test_${uniqueId}@college.edu`;
  let validUser;
  let validAccessToken;
  let expiredAccessToken;

  before(async () => {
    // Ensure default VOTER role exists
    const voterRole = await prisma.role.upsert({
      where: { name: 'VOTER' },
      update: {},
      create: { name: 'VOTER' },
    });

    // Create test user in DB
    validUser = await prisma.user.create({
      data: {
        name: 'Middleware User',
        email: testEmail,
        password: 'hashedPassword123',
        roleId: voterRole.id,
      },
    });

    // Generate valid access token
    validAccessToken = jwt.sign(
      { id: validUser.id, email: validUser.email, role: 'VOTER' },
      config.jwtAccessSecret,
      { expiresIn: '15m' }
    );

    // Generate expired access token
    expiredAccessToken = jwt.sign(
      { id: validUser.id, email: validUser.email, role: 'VOTER' },
      config.jwtAccessSecret,
      { expiresIn: '-1s' }
    );

    const app = express();
    app.use(express.json());

    // Protected dummy endpoint using authenticate middleware
    app.get('/api/protected-test', authenticate, (req, res) => {
      res.status(200).json({
        success: true,
        user: req.user,
      });
    });

    app.use(errorHandler);

    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    const port = server.address().port;
    protectedUrl = `http://localhost:${port}/api/protected-test`;
  });

  after(async () => {
    // Cleanup test user
    try {
      await prisma.user.deleteMany({
        where: { email: { contains: 'middleware_test_' } },
      });
    } catch (e) {
      // Ignore
    }
    if (server) {
      server.close();
    }
  });

  test('Missing Token: Should return 401 when Authorization header is missing', async () => {
    const res = await fetch(protectedUrl, {
      method: 'GET',
    });

    const data = await res.json();
    assert.strictEqual(res.status, 401);
    assert.strictEqual(data.success, false);
    assert.strictEqual(data.message, 'Authentication token is missing.');
  });

  test('Invalid Token: Should return 401 when token is invalid or corrupted', async () => {
    const res = await fetch(protectedUrl, {
      method: 'GET',
      headers: {
        Authorization: 'Bearer invalid.corrupted.token',
      },
    });

    const data = await res.json();
    assert.strictEqual(res.status, 401);
    assert.strictEqual(data.success, false);
    assert.strictEqual(data.message, 'Invalid token.');
  });

  test('Expired Token: Should return 401 when access token is expired', async () => {
    const res = await fetch(protectedUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${expiredAccessToken}`,
      },
    });

    const data = await res.json();
    assert.strictEqual(res.status, 401);
    assert.strictEqual(data.success, false);
    assert.strictEqual(data.message, 'Token has expired.');
  });

  test('Success: Should pass authentication and attach user to req.user with valid token', async () => {
    const res = await fetch(protectedUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${validAccessToken}`,
      },
    });

    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.user.id, validUser.id);
    assert.strictEqual(data.user.name, 'Middleware User');
    assert.strictEqual(data.user.email, testEmail);
    assert.strictEqual(data.user.role, 'VOTER');
  });
});
