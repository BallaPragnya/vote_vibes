import rateLimit from 'express-rate-limit';
import AppError from '../utils/AppError.js';
import logger from '../utils/logger.js';

/**
 * Custom handler when rate limit is exceeded
 */
const createRateLimitHandler = (message, errorType = 'TooManyRequestsError') => {
  return (req, res, next, options) => {
    logger.warn(`Rate limit exceeded for IP ${req.ip} on ${req.method} ${req.originalUrl}`);
    next(new AppError(message || options.message, 429, errorType));
  };
};

/**
 * Global Rate Limiter
 * Applied across all API routes to prevent general API abuse & DDoS attacks.
 * Limit: 100 requests per 15 minutes per IP
 */
export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  handler: createRateLimitHandler(
    'Too many requests from this IP. Please try again after 15 minutes.',
    'RateLimitExceededError'
  ),
});

/**
 * Authentication Rate Limiter
 * Applied to login, registration, and refresh endpoints to prevent brute-force attacks.
 * Limit: 10 attempts per 15 minutes per IP
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: createRateLimitHandler(
    'Too many authentication attempts. Please try again after 15 minutes.',
    'AuthRateLimitError'
  ),
});

/**
 * Voting Rate Limiter
 * Applied to vote submission endpoint to prevent automated burst voting.
 * Limit: 5 requests per 1 minute per IP
 */
export const voteRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: createRateLimitHandler(
    'Too many voting attempts. Please slow down and try again in a minute.',
    'VoteRateLimitError'
  ),
});

/**
 * Verification Rate Limiter
 * Applied to receipt and blockchain verification endpoints to prevent enumeration.
 * Limit: 30 requests per 1 minute per IP
 */
export const verificationRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler: createRateLimitHandler(
    'Too many verification requests. Please try again in a minute.',
    'VerificationRateLimitError'
  ),
});

export default {
  globalRateLimiter,
  authRateLimiter,
  voteRateLimiter,
  verificationRateLimiter,
};
