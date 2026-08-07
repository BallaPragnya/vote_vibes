import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  validateCreateElection,
  validateUpdateElection,
} from '../../src/validators/election.validator.js';

describe('Election Validator Unit Tests', () => {
  describe('validateCreateElection', () => {
    test('Should fail if title is missing or empty', () => {
      const req = {
        body: {
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 86400000).toISOString(),
        },
      };
      validateCreateElection(req, {}, (err) => {
        assert.ok(err);
        assert.strictEqual(err.statusCode, 400);
        assert.strictEqual(err.message, 'Title is required and cannot be empty.');
      });
    });

    test('Should fail if startDate is missing', () => {
      const req = {
        body: {
          title: 'Student Election 2026',
          endDate: new Date(Date.now() + 86400000).toISOString(),
        },
      };
      validateCreateElection(req, {}, (err) => {
        assert.ok(err);
        assert.strictEqual(err.statusCode, 400);
        assert.strictEqual(err.message, 'Start date is required.');
      });
    });

    test('Should fail if endDate is missing', () => {
      const req = {
        body: {
          title: 'Student Election 2026',
          startDate: new Date().toISOString(),
        },
      };
      validateCreateElection(req, {}, (err) => {
        assert.ok(err);
        assert.strictEqual(err.statusCode, 400);
        assert.strictEqual(err.message, 'End date is required.');
      });
    });

    test('Should fail if endDate <= startDate', () => {
      const now = Date.now();
      const req = {
        body: {
          title: 'Student Election 2026',
          startDate: new Date(now + 86400000).toISOString(), // Start in 1 day
          endDate: new Date(now + 3600000).toISOString(),   // End in 1 hour
        },
      };
      validateCreateElection(req, {}, (err) => {
        assert.ok(err);
        assert.strictEqual(err.statusCode, 400);
        assert.strictEqual(err.message, 'End date must be strictly after start date.');
      });
    });

    test('Should pass for valid create election payload with optional description', () => {
      const now = Date.now();
      const req = {
        body: {
          title: 'Student Council Election 2026',
          description: 'Optional election description',
          startDate: new Date(now + 3600000).toISOString(),
          endDate: new Date(now + 86400000).toISOString(),
        },
      };
      validateCreateElection(req, {}, (err) => {
        assert.strictEqual(err, undefined);
      });
    });
  });

  describe('validateUpdateElection', () => {
    test('Should fail if title is provided as empty string', () => {
      const req = {
        body: {
          title: '   ',
        },
      };
      validateUpdateElection(req, {}, (err) => {
        assert.ok(err);
        assert.strictEqual(err.statusCode, 400);
        assert.strictEqual(err.message, 'Title cannot be empty.');
      });
    });

    test('Should fail if endDate <= startDate in update payload', () => {
      const now = Date.now();
      const req = {
        body: {
          startDate: new Date(now + 86400000).toISOString(),
          endDate: new Date(now + 3600000).toISOString(),
        },
      };
      validateUpdateElection(req, {}, (err) => {
        assert.ok(err);
        assert.strictEqual(err.statusCode, 400);
        assert.strictEqual(err.message, 'End date must be strictly after start date.');
      });
    });

    test('Should pass for valid update payload', () => {
      const req = {
        body: {
          title: 'Updated Election Title',
          description: 'New Description',
        },
      };
      validateUpdateElection(req, {}, (err) => {
        assert.strictEqual(err, undefined);
      });
    });
  });
});
