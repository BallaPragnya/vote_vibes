import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  validateRegister,
  validateLogin,
  validateRefresh,
  validateLogout,
} from '../../src/validators/auth.validator.js';

describe('Auth Validator Unit Tests', () => {
  describe('validateRegister', () => {
    test('Should fail if name is missing or empty', () => {
      const req = { body: { email: 'user@test.com', password: 'password123' } };
      validateRegister(req, {}, (err) => {
        assert.ok(err);
        assert.strictEqual(err.statusCode, 400);
        assert.strictEqual(err.message, 'Name is required.');
      });
    });

    test('Should fail if email format is invalid', () => {
      const req = { body: { name: 'John', email: 'invalid-email', password: 'password123' } };
      validateRegister(req, {}, (err) => {
        assert.ok(err);
        assert.strictEqual(err.statusCode, 400);
        assert.strictEqual(err.message, 'Please provide a valid email address.');
      });
    });

    test('Should fail if password is less than 8 characters', () => {
      const req = { body: { name: 'John', email: 'john@test.com', password: 'short' } };
      validateRegister(req, {}, (err) => {
        assert.ok(err);
        assert.strictEqual(err.statusCode, 400);
        assert.strictEqual(err.message, 'Password must be at least 8 characters long.');
      });
    });

    test('Should pass for valid registration payload', () => {
      const req = { body: { name: 'John Doe', email: 'john@test.com', password: 'validPassword123' } };
      validateRegister(req, {}, (err) => {
        assert.strictEqual(err, undefined);
      });
    });
  });

  describe('validateLogin', () => {
    test('Should fail if email is missing', () => {
      const req = { body: { password: 'password123' } };
      validateLogin(req, {}, (err) => {
        assert.ok(err);
        assert.strictEqual(err.statusCode, 400);
        assert.strictEqual(err.message, 'Email is required.');
      });
    });

    test('Should fail if password is missing', () => {
      const req = { body: { email: 'john@test.com' } };
      validateLogin(req, {}, (err) => {
        assert.ok(err);
        assert.strictEqual(err.statusCode, 400);
        assert.strictEqual(err.message, 'Password is required.');
      });
    });

    test('Should pass for valid login payload', () => {
      const req = { body: { email: 'john@test.com', password: 'password123' } };
      validateLogin(req, {}, (err) => {
        assert.strictEqual(err, undefined);
      });
    });
  });

  describe('validateRefresh & validateLogout', () => {
    test('Should fail if refreshToken is missing', () => {
      const req = { body: {} };
      validateRefresh(req, {}, (err) => {
        assert.ok(err);
        assert.strictEqual(err.statusCode, 400);
        assert.strictEqual(err.message, 'Refresh token is required.');
      });
    });

    test('Should pass for valid refreshToken payload', () => {
      const req = { body: { refreshToken: 'valid.refresh.token' } };
      validateRefresh(req, {}, (err) => {
        assert.strictEqual(err, undefined);
      });
    });
  });
});
