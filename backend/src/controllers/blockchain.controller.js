import { blockchainExplorerService } from '../services/blockchainExplorer.service.js';
import { runBlockchainStressTest } from '../blockchain/stressTester.js';
import { simulateTamperAttempt } from '../blockchain/tamperSimulator.js';
import { exportLedgerAsJson, exportLedgerAsCsv, generateCryptographicProofPackage } from '../blockchain/ledgerExporter.js';

/**
 * Controller for Blockchain Explorer, Dynamic Chain Integrity Meter, Public Verification, 
 * Stress Testing, Tamper Simulation, and Ledger Export (Phases 1-7)
 */

export const getLedgerOverview = (req, res, next) => {
  try {
    const { action, electionId, search } = req.query;

    if (action || electionId || search) {
      const filteredBlocks = blockchainExplorerService.filterBlocks({ action, electionId, search });
      const overview = blockchainExplorerService.getLedgerOverview();
      return res.status(200).json({
        success: true,
        message: 'Filtered blockchain ledger retrieved.',
        data: {
          ...overview,
          blocks: filteredBlocks,
        },
      });
    }

    const overview = blockchainExplorerService.getLedgerOverview();
    return res.status(200).json({
      success: true,
      message: 'Blockchain ledger overview retrieved successfully.',
      data: overview,
    });
  } catch (error) {
    next(error);
  }
};

export const getChainIntegrity = (req, res, next) => {
  try {
    const auditReport = blockchainExplorerService.performFullChainAudit();
    return res.status(200).json({
      success: true,
      message: 'Chain integrity audit scan completed.',
      data: auditReport,
    });
  } catch (error) {
    next(error);
  }
};

export const getBlockByIdentifier = (req, res, next) => {
  try {
    const { identifier } = req.params;
    const block = blockchainExplorerService.getBlock(identifier);

    if (!block) {
      return res.status(404).json({
        success: false,
        message: `Block with identifier '${identifier}' not found on blockchain ledger.`,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Block retrieved successfully.',
      data: block,
    });
  } catch (error) {
    next(error);
  }
};

export const verifyPublicReceipt = (req, res, next) => {
  try {
    const receiptData = req.body;
    const result = blockchainExplorerService.verifyPublicReceipt(receiptData);

    if (!result.isValid) {
      return res.status(400).json({
        success: false,
        message: result.reason || 'Vote receipt verification failed.',
        data: result,
      });
    }

    return res.status(200).json({
      success: true,
      message: result.message || 'Vote receipt verified on blockchain ledger.',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/blockchain/stress-test
 * Runs an on-demand blockchain stress test & performance benchmark
 */
export const handleStressTest = (req, res, next) => {
  try {
    const { blockCount = 100, electionId = 'elec_stress_test_2026' } = req.body || {};
    const count = Math.min(Math.max(10, Number(blockCount)), 1000);

    const benchmarkReport = runBlockchainStressTest({
      blockCount: count,
      electionId,
    });

    return res.status(200).json({
      success: true,
      message: `Blockchain stress test completed successfully (${count} blocks generated).`,
      data: benchmarkReport,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/blockchain/simulate-tamper
 * Simulates block tampering and demonstrates real-time detection
 */
export const handleSimulateTamper = (req, res, next) => {
  try {
    const { targetBlockIndex = 1, tamperType = 'DATA_MUTATION' } = req.body || {};
    const chain = blockchainExplorerService.store.getChain();

    const tamperResult = simulateTamperAttempt(chain, Number(targetBlockIndex), tamperType);

    return res.status(200).json({
      success: true,
      message: tamperResult.auditReport.message,
      data: tamperResult,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/blockchain/export/json
 * Downloads complete blockchain ledger as JSON
 */
export const exportJsonLedger = (req, res, next) => {
  try {
    const chain = blockchainExplorerService.store.getChain();
    const jsonPackage = exportLedgerAsJson(chain);

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=votevibes_blockchain_ledger.json');
    return res.status(200).send(JSON.stringify(jsonPackage, null, 2));
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/blockchain/export/csv
 * Downloads blockchain ledger audit log as CSV
 */
export const exportCsvLedger = (req, res, next) => {
  try {
    const chain = blockchainExplorerService.store.getChain();
    const csvContent = exportLedgerAsCsv(chain);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=votevibes_blockchain_ledger.csv');
    return res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/blockchain/export/proof/:electionId
 * Downloads cryptographic proof package for an election
 */
export const exportElectionProof = (req, res, next) => {
  try {
    const { electionId } = req.params;
    const chain = blockchainExplorerService.store.getChain();
    const proofPackage = generateCryptographicProofPackage(chain, electionId);

    return res.status(200).json({
      success: true,
      message: `Cryptographic proof package for election '${electionId}' generated.`,
      data: proofPackage,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getLedgerOverview,
  getChainIntegrity,
  getBlockByIdentifier,
  verifyPublicReceipt,
  handleStressTest,
  handleSimulateTamper,
  exportJsonLedger,
  exportCsvLedger,
  exportElectionProof,
};
