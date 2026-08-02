import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import http from 'node:http';
import routes from '../../src/routes/index.js';
import { errorHandler } from '../../src/middleware/errorHandler.js';
import prisma from '../../src/config/prisma.js';

describe('POST /api/auth/refresh & POST /api/auth/logout Integration Tests', () => {
  let server;
  let loginUrl;
  let refreshUrl;
  let logoutUrl;
  let registerUrl;
  const uniqueId = Date.now();
  const testEmail = `refresh_test_${uniqueId}@college.edu`;
  const rawPassword = 'mySecretPassword123';
  let validRefreshToken;

  before(async () => {
    // Ensure default VOTER role exists
    await prisma.role.upsert({
      where: { name: 'VOTER' },
      update: {},
      create: { name: 'VOTER' },
    });

    const app = express();
    app.use(express.json());
    app.use('/', routes);
    app.use(errorHandler);

    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    const port = server.address().port;

    registerUrl = `http://localhost:${port}/api/auth/register`;
    loginUrl = `http://localhost:${port}/api/auth/login`;
    refreshUrl = `http://localhost:${port}/api/auth/refresh`;
    logoutUrl = `http://localhost:${port}/api/auth/logout`;

    // 1. Register a test user
    const regRes = await fetch(registerUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Refresh Test User',
        email: testEmail,
        password: rawPassword,
      }),
    });
    const regData = await regRes.json();
    validRefreshToken = regData.data.refreshToken;
  });

  after(async () => {
    // Cleanup test users & refresh tokens
    try {
      await prisma.user.deleteMany({
        where: { email: { contains: 'refresh_test_' } },
      });
    } catch (e) {
      // Ignore cleanup error
    }
    if (server) {
      server.close();
    }
  });

  test('Validation: Should return 400 when refreshToken is missing', async () => {
    const res = await fetch(refreshUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    const data = await res.json();
    assert.strictEqual(res.status, 400);
    assert.strictEqual(data.success, false);
    assert.strictEqual(data.error, 'ValidationError');
  });

  test('Unauthorized: Should return 401 for invalid/forged refresh token', async () => {
    const res = await fetch(refreshUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        refreshToken: 'invalid.jwt.token',
      }),
    });

    const data = await res.json();
    assert.strictEqual(res.status, 401);
    assert.strictEqual(data.success, false);
    assert.strictEqual(data.error, 'UnauthorizedError');
  });

  test('Success: Should return 200 with new accessToken using a valid refreshToken', async () => {
    const res = await fetch(refreshUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        refreshToken: validRefreshToken,
      }),
    });

    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.message, 'Access token refreshed successfully');
    assert.ok(data.data.accessToken, 'New access token should be returned');
  });

  test('Logout: Should return 200 and revoke the refresh token', async () => {
    const res = await fetch(logoutUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        refreshToken: validRefreshToken,
      }),
    });

    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.message, 'Logged out successfully');

    // Attempting to refresh after logout should fail with 401
    const postLogoutRefreshRes = await fetch(refreshUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        refreshToken: validRefreshToken,
      }),
    });

    const postLogoutData = await postLogoutRefreshRes.json();
    assert.strictEqual(postLogoutRefreshRes.status, 401);
    assert.strictEqual(postLogoutData.success, false);
    assert.strictEqual(postLogoutData.error, 'UnauthorizedError');
  });
});
