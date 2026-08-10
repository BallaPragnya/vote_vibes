import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { uploadCandidateFiles } from '../../src/middleware/upload.middleware.js';

describe('Upload Middleware Unit Tests', () => {
  test('Should pass if no files are uploaded', () => {
    return new Promise((resolve, reject) => {
      const req = { body: {}, headers: {} };
      const res = {};

      uploadCandidateFiles(req, res, (err) => {
        if (err) return reject(err);
        assert.strictEqual(err, undefined);
        resolve();
      });
    });
  });
});
