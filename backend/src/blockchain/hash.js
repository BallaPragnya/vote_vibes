import crypto from 'crypto';

/**
 * Calculates SHA-256 hash for given data object
 * @param {Object} data - Data payload to hash
 * @returns {string} SHA-256 hexadecimal hash
 */
export default function calculateHash(data) {
  return crypto
    .createHash('sha256')
    .update(JSON.stringify(data))
    .digest('hex');
}
