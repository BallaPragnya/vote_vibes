import crypto from 'crypto';

/**
 * Cryptographic Optimization Engine (Phase 7)
 * 
 * Provides high-performance memoized hashing, reusable buffer digests, 
 * and fast batch block verification for production throughput.
 */

// LRU Cache for frequently calculated payload hashes
const HASH_CACHE = new Map();
const MAX_CACHE_SIZE = 5000;

/**
 * Fast optimized SHA-256 calculation with LRU string caching
 * 
 * @param {Object|string} data 
 * @returns {string} 64-character hex SHA-256 hash
 */
export function fastCalculateHash(data) {
  const jsonString = typeof data === 'string' ? data : JSON.stringify(data);

  if (HASH_CACHE.has(jsonString)) {
    return HASH_CACHE.get(jsonString);
  }

  const hash = crypto
    .createHash('sha256')
    .update(jsonString)
    .digest('hex');

  if (HASH_CACHE.size >= MAX_CACHE_SIZE) {
    const firstKey = HASH_CACHE.keys().next().value;
    HASH_CACHE.delete(firstKey);
  }

  HASH_CACHE.set(jsonString, hash);
  return hash;
}

/**
 * Fast batch verification of block chain arrays
 * Verifies block hashes and previousHash linkage sequentially using optimized buffers.
 * 
 * @param {Array<Object>} blocks - Array of Block instances
 * @returns {Object} - { isChainValid: boolean, verifiedCount: number, corruptedIndices: number[] }
 */
export function batchVerifyBlocks(blocks) {
  if (!Array.isArray(blocks) || blocks.length === 0) {
    return { isChainValid: true, verifiedCount: 0, corruptedIndices: [] };
  }

  const corruptedIndices = [];

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    
    // 1. Verify block hash calculation
    const calculatedHash = typeof block.calculateHash === 'function' 
      ? block.calculateHash() 
      : fastCalculateHash({
          index: block.index,
          timestamp: block.timestamp,
          data: block.data,
          previousHash: block.previousHash,
        });

    if (block.hash !== calculatedHash) {
      corruptedIndices.push(i);
      continue;
    }

    // 2. Verify previousHash linkage for non-genesis blocks
    if (i > 0) {
      const prevBlock = blocks[i - 1];
      if (block.previousHash !== prevBlock.hash) {
        corruptedIndices.push(i);
      }
    }
  }

  return {
    isChainValid: corruptedIndices.length === 0,
    verifiedCount: blocks.length - corruptedIndices.length,
    corruptedIndices,
  };
}

/**
 * Clears the hash cache (useful for benchmarks)
 */
export function clearHashCache() {
  HASH_CACHE.clear();
}

export default {
  fastCalculateHash,
  batchVerifyBlocks,
  clearHashCache,
};
