import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import http from 'node:http';
import routes from '../../src/routes/index.js';
import { errorHandler } from '../../src/middleware/errorHandler.js';
import prisma from '../../src/config/prisma.js';

describe('POST /api/auth/login Integration Tests', () => {
  let server;
  let baseUrl;
  let registerUrl;
  const uniqueId = Date.now();
  const testEmail = `login_test_${uniqueId}@college.edu`;
  const rawPassword = 'mySecretPassword123';

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
    baseUrl = `http://localhost:${port}/api/auth/login`;
    registerUrl = `http://localhost:${port}/api/auth/register`;

    // Register a test user for login tests
    await fetch(registerUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Login Test User',
        email: testEmail,
        password: rawPassword,
      }),
    });
  });

  after(async () => {
    // Cleanup test users
    try {
      await prisma.user.deleteMany({
        where: { email: { contains: 'login_test_' } },
      });
    } catch (e) {
      // Ignore cleanup error
    }
    if (server) {
      server.close();
    }
  });

  test('Validation: Should return 400 when email is missing', async () => {
    const res = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        password: rawPassword,
      }),
    });

    const data = await res.json();
    assert.strictEqual(res.status, 400);
    assert.strictEqual(data.success, false);
    assert.strictEqual(data.error, 'ValidationError');
  });

  test('Validation: Should return 400 when password is missing', async () => {
    const res = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
      }),
    });

    const data = await res.json();
    assert.strictEqual(res.status, 400);
    assert.strictEqual(data.success, false);
  });

  test('Unauthorized: Should return 401 when email does not exist', async () => {
    const res = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'nonexistent_user_9999@college.edu',
        password: rawPassword,
      }),
    });

    const data = await res.json();
    assert.strictEqual(res.status, 401);
    assert.strictEqual(data.success, false);
    assert.strictEqual(data.message, 'Invalid credentials.');
    assert.strictEqual(data.error, 'UnauthorizedError');
  });

  test('Unauthorized: Should return 401 when password is wrong', async () => {
    const res = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'wrongPassword123',
      }),
    });

    const data = await res.json();
    assert.strictEqual(res.status, 401);
    assert.strictEqual(data.success, false);
    assert.strictEqual(data.message, 'Invalid credentials.');
  });

  test('Success: Should return 200 with JWT token and user payload on valid credentials', async () => {
    const res = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: rawPassword,
      }),
    });

    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.message, 'Login successful');
    assert.ok(data.data.token, 'JWT token should be present');
    assert.ok(data.data.user.id, 'User ID should be present');
    assert.strictEqual(data.data.user.name, 'Login Test User');
    assert.strictEqual(data.data.user.email, testEmail);
    assert.strictEqual(data.data.user.role, 'VOTER');
    assert.strictEqual(data.data.user.password, undefined, 'Password must not be returned');
  });
});
