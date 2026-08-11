import { Router } from 'express';
import {
  getLedgerOverview,
  getChainIntegrity,
  getBlockByIdentifier,
  verifyPublicReceipt,
  handleStressTest,
  handleSimulateTamper,
  exportJsonLedger,
  exportCsvLedger,
  exportElectionProof,
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
 * POST /api/blockchain/stress-test
 * Runs blockchain stress testing & TPS benchmarking
 */
router.post('/stress-test', handleStressTest);

/**
 * POST /api/blockchain/simulate-tamper
 * Simulates block tampering and demonstrates real-time detection
 */
router.post('/simulate-tamper', handleSimulateTamper);

/**
 * GET /api/blockchain/export/json
 * Download ledger JSON export
 */
router.get('/export/json', exportJsonLedger);

/**
 * GET /api/blockchain/export/csv
 * Download ledger CSV audit log
 */
router.get('/export/csv', exportCsvLedger);

/**
 * GET /api/blockchain/export/proof/:electionId
 * Download cryptographic proof package for an election
 */
router.get('/export/proof/:electionId', exportElectionProof);

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
