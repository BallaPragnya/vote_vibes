import { Router } from 'express';
import {
  getLedgerOverview,
  getChainIntegrity,
  getBlockByIdentifier,
  verifyPublicReceipt,
} from '../controllers/blockchain.controller.js';

const router = Router();

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
router.post('/verify-receipt', verifyPublicReceipt);

export default router;
