import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import http from 'node:http';
import routes from '../../src/routes/index.js';
import { errorHandler } from '../../src/middleware/errorHandler.js';
import prisma from '../../src/config/prisma.js';

describe('POST /api/auth/register Integration Tests', () => {
  let server;
  let baseUrl;
  const uniqueId = Date.now();
  const testEmail = `register_test_${uniqueId}@college.edu`;

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
    baseUrl = `http://localhost:${port}/api/auth/register`;
  });

  after(async () => {
    // Cleanup test users
    try {
      await prisma.user.deleteMany({
        where: { email: { contains: 'register_test_' } },
      });
    } catch (e) {
      // Ignore cleanup error
    }
    if (server) {
      server.close();
    }
  });

  test('Validation: Should return 400 when name is missing', async () => {
    const res = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'invalid@example.com',
        password: 'password123',
      }),
    });

    const data = await res.json();
    assert.strictEqual(res.status, 400);
    assert.strictEqual(data.success, false);
    assert.strictEqual(data.error, 'ValidationError');
  });

  test('Validation: Should return 400 when email format is invalid', async () => {
    const res = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'John Doe',
        email: 'not-an-email',
        password: 'password123',
      }),
    });

    const data = await res.json();
    assert.strictEqual(res.status, 400);
    assert.strictEqual(data.success, false);
  });

  test('Validation: Should return 400 when password is less than 8 characters', async () => {
    const res = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'John Doe',
        email: 'john@example.com',
        password: '123',
      }),
    });

    const data = await res.json();
    assert.strictEqual(res.status, 400);
    assert.strictEqual(data.success, false);
  });

  test('Success: Should successfully register a new user and return 201 with JWT token', async () => {
    const res = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Student',
        email: testEmail,
        password: 'securePassword123',
      }),
    });

    const data = await res.json();
    assert.strictEqual(res.status, 201);
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.message, 'User registered successfully');
    assert.ok(data.data.token, 'Token should be returned');
    assert.ok(data.data.user.id, 'User ID should be returned');
    assert.strictEqual(data.data.user.name, 'Test Student');
    assert.strictEqual(data.data.user.email, testEmail);
    assert.strictEqual(data.data.user.role, 'VOTER');
    assert.strictEqual(data.data.user.password, undefined, 'Password must never be exposed');
  });

  test('Conflict: Should return 409 when registering with an existing email', async () => {
    const res = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Duplicate Student',
        email: testEmail,
        password: 'securePassword123',
      }),
    });

    const data = await res.json();
    assert.strictEqual(res.status, 409);
    assert.strictEqual(data.success, false);
    assert.strictEqual(data.error, 'ConflictError');
  });
});
