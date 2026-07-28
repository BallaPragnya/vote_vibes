import prisma from '../config/prisma.js';
import logger from './logger.js';

/**
 * Checks database connectivity by executing a lightweight SELECT 1 query via Prisma.
 * Returns true if connected, false otherwise. Never throws.
 *
 * @returns {Promise<boolean>}
 */
export async function checkDatabaseConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    logger.warn(`Database connection check failed: ${errorMsg.trim()}`);
    return false;
  }
}

export default checkDatabaseConnection;
