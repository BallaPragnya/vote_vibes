import config from './env.js';
import logger from '../utils/logger.js';
import AppError from '../utils/AppError.js';

/**
 * Check if origin is a valid localhost pattern for local development
 * Matches http://localhost:PORT or http://127.0.0.1:PORT
 * @param {string} origin 
 * @returns {boolean}
 */
const isLocalhost = (origin) => {
  if (!origin) return false;
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:[0-9]+)?$/.test(origin);
};

/**
 * Dynamic CORS origin validator function
 */
const corsOriginDelegate = (origin, callback) => {
  // Allow requests with no origin (e.g. mobile apps, curl, Postman, server-to-server)
  if (!origin) {
    return callback(null, true);
  }

  // Development mode: Allow configured origins OR any localhost/127.0.0.1 port
  if (config.isDevelopment) {
    if (config.allowedOrigins.includes(origin) || isLocalhost(origin)) {
      return callback(null, true);
    }
  }

  // Production mode: Strictly check against allowedOrigins array
  if (config.allowedOrigins.includes(origin)) {
    return callback(null, true);
  }

  // Reject unknown origin
  logger.warn(`CORS blocked request from unauthorized origin: ${origin}`);
  return callback(
    new AppError(`CORS policy violation: Origin '${origin}' is not allowed.`, 403, 'CorsViolationError'),
    false
  );
};

/**
 * Reusable production-ready CORS configuration options
 */
export const corsOptions = {
  origin: corsOriginDelegate,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Authorization', 'Content-Type', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400, // Preflight caching for 24 hours (86400 seconds)
  optionsSuccessStatus: 200, // For legacy browser compatibility (IE11)
};

export default corsOptions;
