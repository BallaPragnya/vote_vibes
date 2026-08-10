import { blockchainExplorerService } from '../services/blockchainExplorer.service.js';

/**
 * Controller for Blockchain Explorer, Dynamic Chain Integrity Meter, and Public Receipt Verification
 */

/**
 * GET /api/blockchain
 * Returns complete ledger overview, metrics, and chain integrity status
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

/**
 * GET /api/blockchain/integrity
 * Returns real-time dynamic chain integrity meter audit results
 */
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

/**
 * GET /api/blockchain/blocks/:identifier
 * Returns a specific block by index or hash
 */
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

/**
 * POST /api/blockchain/verify-receipt
 * Public endpoint to verify a cryptographic vote receipt
 */
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

export default {
  getLedgerOverview,
  getChainIntegrity,
  getBlockByIdentifier,
  verifyPublicReceipt,
};
