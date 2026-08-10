#!/usr/bin/env node

/**
 * Secret Generator CLI Utility for VoteVibes
 * Generates cryptographically secure 64-byte random hex tokens for JWT secrets.
 */

import crypto from 'crypto';

const generateSecret = () => crypto.randomBytes(64).toString('hex');

console.log('===================================================');
console.log(' VoteVibes Production Secret Generator');
console.log('===================================================');
console.log('');
console.log('Copy these generated values into your .env or server config:');
console.log('');
console.log(`JWT_ACCESS_SECRET=${generateSecret()}`);
console.log('');
console.log(`JWT_REFRESH_SECRET=${generateSecret()}`);
console.log('');
console.log('===================================================');
