import config from './config/env.js'; // 1. Load environment variables
import app from './app.js'; // 2-8. Initialize Express & Middleware Stack
import prisma from './config/prisma.js';
import checkDatabaseConnection from './utils/dbCheck.js';
import logger from './utils/logger.js';

// Global process exception/rejection handlers
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Promise Rejection:', reason);
});

/**
 * Server Startup Procedure
 */
const startServer = async () => {
  try {
    logger.info('Starting VoteVibes Backend Application...');

    // 9. Connect Prisma & verify database connectivity
    let isDbConnected = false;
    try {
      await prisma.$connect();
      isDbConnected = await checkDatabaseConnection();
    } catch (dbErr) {
      logger.warn(`Prisma connection attempt warning: ${dbErr.message || dbErr}`);
    }

    if (isDbConnected) {
      logger.info('Database connection status: CONNECTED (PostgreSQL)');
    } else {
      logger.warn(
        'Database connection status: DISCONNECTED (PostgreSQL is unavailable). Server will continue running.'
      );
    }

    // 10. Start listening on the configured port
    const server = app.listen(config.port, () => {
      console.log('===================================================');
      console.log(` VoteVibes Backend Server Started Successfully`);
      console.log(` Environment : ${config.nodeEnv}`);
      console.log(` Port        : ${config.port}`);
      console.log(` Database    : ${isDbConnected ? 'CONNECTED' : 'DISCONNECTED'}`);
      console.log(` Health Check: http://localhost:${config.port}/api/health`);
      console.log('===================================================');

      logger.info(
        `Server listening in ${config.nodeEnv} mode on http://localhost:${config.port}`
      );
    });

    // Graceful shutdown procedure
    const handleShutdown = async (signal) => {
      logger.info(`Received ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        logger.info('HTTP server closed.');
        try {
          await prisma.$disconnect();
          logger.info('Prisma client disconnected successfully.');
        } catch (e) {
          logger.error('Error disconnecting Prisma:', e);
        }
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => handleShutdown('SIGTERM'));
    process.on('SIGINT', () => handleShutdown('SIGINT'));
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
