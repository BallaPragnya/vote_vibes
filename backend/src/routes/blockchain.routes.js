import { Router } from 'express';
import {
  getLedgerOverview,
  getChainIntegrity,
  getBlockByIdentifier,
  verifyPublicReceipt,
} from '../controllers/blockchain.controller.js';
import { verificationRateLimiter } from '../middleware/rateLimiter.js';
import config from '../config/env.js';

const router = Router();

const applyVerificationLimiter = config.isTest ? (req, res, next) => next() : verificationRateLimiter;

/**
 * GET /api/blockchain
 * Get blockchain ledger overview & block list
 */
router.get('/', getLedgerOverview);

/**
 * GET /api/blockchain/integrity
 * Real-time dynamic chain integrity meter audit
 */
router.get('/integrity', getChainIntegrity);

/**
 * GET /api/blockchain/blocks/:identifier
 * Retrieve block details by index or hash
 */
router.get('/blocks/:identifier', getBlockByIdentifier);

/**
 * POST /api/blockchain/verify-receipt
 * Public cryptographic receipt verification tool
 */
router.post('/verify-receipt', applyVerificationLimiter, verifyPublicReceipt);

export default router;
