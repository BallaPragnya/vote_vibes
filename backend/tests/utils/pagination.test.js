import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { getPaginationParams, formatPaginatedResponse } from '../../src/utils/pagination.js';

describe('Pagination Utility Unit Tests', () => {
  describe('getPaginationParams', () => {
    test('Should return default page 1 and limit 10 when query is empty', () => {
      const params = getPaginationParams();
      assert.strictEqual(params.page, 1);
      assert.strictEqual(params.limit, 10);
      assert.strictEqual(params.skip, 0);
      assert.strictEqual(params.take, 10);
    });

    test('Should parse page and limit string values', () => {
      const params = getPaginationParams({ page: '2', limit: '20' });
      assert.strictEqual(params.page, 2);
      assert.strictEqual(params.limit, 20);
      assert.strictEqual(params.skip, 20);
      assert.strictEqual(params.take, 20);
    });

    test('Should enforce minimum page of 1 and max limit of 100', () => {
      const params = getPaginationParams({ page: '-5', limit: '500' });
      assert.strictEqual(params.page, 1);
      assert.strictEqual(params.limit, 100);
      assert.strictEqual(params.skip, 0);
    });
  });

  describe('formatPaginatedResponse', () => {
    test('Should format items, total, page, limit, and calculate totalPages', () => {
      const items = [{ id: '1' }, { id: '2' }];
      const response = formatPaginatedResponse(items, 100, 1, 10);

      assert.deepStrictEqual(response.data, items);
      assert.strictEqual(response.page, 1);
      assert.strictEqual(response.limit, 10);
      assert.strictEqual(response.total, 100);
      assert.strictEqual(response.totalPages, 10);
    });

    test('Should return totalPages 1 if total is 0', () => {
      const response = formatPaginatedResponse([], 0, 1, 10);
      assert.strictEqual(response.totalPages, 1);
    });
  });
});
