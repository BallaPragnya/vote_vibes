import { Prisma } from '@prisma/client';
import config from '../config/env.js';
import logger from '../utils/logger.js';
import AppError from '../utils/AppError.js';

/**
 * Handle Prisma Known Request Errors (e.g., duplicate key, record not found)
 */
const handlePrismaKnownRequestError = (err) => {
  switch (err.code) {
    case 'P2002': {
      const target = (config.isDevelopment && err.meta?.target)
        ? ` (${Array.isArray(err.meta.target) ? err.meta.target.join(', ') : err.meta.target})`
        : '';
      return new AppError(`Duplicate field value entered${target}. Please use another value.`, 409, 'DuplicateFieldsError');
    }
    case 'P2025': {
      const cause = err.meta?.cause || 'Record to update/delete not found.';
      return new AppError(cause, 404, 'RecordNotFoundError');
    }
    case 'P2003': {
      const field = (config.isDevelopment && err.meta?.field_name) ? ` on ${err.meta.field_name}` : '';
      return new AppError(`Invalid reference: Foreign key constraint failed${field}.`, 400, 'ForeignKeyConstraintError');
    }
    case 'P2000': {
      return new AppError('The provided value for the column is too long.', 400, 'ValueTooLongError');
    }
    default:
      return new AppError(config.isDevelopment ? `Database request error: ${err.message}` : 'Database operation failed.', 400, 'DatabaseError');
  }
};

/**
 * Handle Prisma Validation Errors
 */
const handlePrismaValidationError = (err) => {
  return new AppError('Invalid data format provided for database operation.', 400, 'PrismaValidationError');
};

/**
 * Handle Prisma Initialization Errors
 */
const handlePrismaInitializationError = (err) => {
  return new AppError('Database connection error. Unable to reach database server.', 500, 'DatabaseConnectionError');
};

/**
 * Handle Validation Errors (e.g. Express-validator / Zod / custom validation)
 */
const handleValidationError = (err) => {
  const message = err.message || 'Invalid input data.';
  return new AppError(message, 400, 'ValidationError');
};

/**
 * Global 404 Not Found Middleware
 */
export const notFoundHandler = (req, res, next) => {
  const error = new AppError(`Route not found - ${req.method} ${req.originalUrl}`, 404, 'NotFound');
  next(error);
};

/**
 * Centralized Error Handling Middleware
 */
export const errorHandler = (err, req, res, next) => {
  let error = err;

  // Convert non-AppError exceptions to normalized AppError instances
  if (!(error instanceof AppError)) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      error = handlePrismaKnownRequestError(err);
    } else if (err instanceof Prisma.PrismaClientValidationError) {
      error = handlePrismaValidationError(err);
    } else if (err instanceof Prisma.PrismaClientInitializationError) {
      error = handlePrismaInitializationError(err);
    } else if (err.name === 'ValidationError') {
      error = handleValidationError(err);
    } else {
      // Unknown / Unhandled server errors
      const statusCode = err.statusCode || err.status || 500;
      const message = config.isDevelopment ? err.message : 'Internal Server Error';
      error = new AppError(message, statusCode, err.name || 'InternalServerError');
      error.isOperational = false;
      error.stack = err.stack;
    }
  }

  const statusCode = error.statusCode || 500;
  const errorName = error.errorType || error.name || 'Error';
  const message = error.message || 'Something went wrong';

  // Log error using Winston logger
  if (statusCode >= 500) {
    logger.error(`${req.method} ${req.originalUrl} - ${statusCode} - ${message}`, {
      stack: err.stack,
    });
  } else {
    logger.warn(`${req.method} ${req.originalUrl} - ${statusCode} - ${message}`);
  }

  // Build standardized JSON response
  const responseBody = {
    success: false,
    message,
    error: errorName,
    statusCode,
  };

  // Show stack traces ONLY in development environment
  if (config.isDevelopment && (error.stack || err.stack)) {
    responseBody.stack = error.stack || err.stack;
  }

  return res.status(statusCode).json(responseBody);
};

export default {
  notFoundHandler,
  errorHandler,
};
