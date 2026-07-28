import { Router } from 'express';
import healthRouter from './health.routes.js';

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

export default router;
