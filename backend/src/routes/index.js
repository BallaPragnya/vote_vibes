import { Router } from 'express';
import healthRouter from './health.routes.js';
import authRouter from './auth.routes.js';
import electionRouter from './election.routes.js';
import candidateRouter from './candidate.routes.js';
import voteRouter from './vote.routes.js';
import blockchainRouter from './blockchain.routes.js';

const router = Router();

/**
 * GET /
 * Root route returning basic API status
 */
router.get('/', (req, res) => {
  return res.status(200).json({
    message: 'VoteVibes Backend API',
  });
});

/**
 * Mount sub-routers under /api prefix
 */
router.use('/api/health', healthRouter);
router.use('/api/auth', authRouter);
router.use('/api/elections', electionRouter);
router.use('/api/candidates', candidateRouter);
router.use('/api/votes', voteRouter);
router.use('/api/blockchain', blockchainRouter);

export default router;
