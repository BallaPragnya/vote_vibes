import { Router } from 'express';
import checkDatabaseConnection from '../utils/dbCheck.js';
import config from '../config/env.js';
import catchAsync from '../utils/catchAsync.js';

const router = Router();

/**
 * Format uptime into seconds/human-readable form
 * @param {number} uptimeSeconds 
 * @returns {string}
 */
const formatUptime = (uptimeSeconds) => {
  const seconds = Math.floor(uptimeSeconds % 60);
  const minutes = Math.floor((uptimeSeconds / 60) % 60);
  const hours = Math.floor((uptimeSeconds / (60 * 60)) % 24);
  const days = Math.floor(uptimeSeconds / (60 * 60 * 24));

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  parts.push(`${seconds}s`);

  return parts.join(' ');
};

/**
 * GET /api/health
 * Returns health status of server and database connection.
 */
router.get(
  '/',
  catchAsync(async (req, res) => {
    const isDbConnected = await checkDatabaseConnection();

    return res.status(200).json({
      success: true,
      message: 'Server running',
      database: isDbConnected ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString(),
      uptime: formatUptime(process.uptime()),
      environment: config.nodeEnv,
    });
  })
);

export default router;
