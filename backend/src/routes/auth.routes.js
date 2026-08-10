import { Router } from 'express';
import { register, login, refresh, logout } from '../controllers/auth.controller.js';
import { validateRegister, validateLogin, validateRefresh, validateLogout } from '../validators/auth.validator.js';
import { authRateLimiter } from '../middleware/rateLimiter.js';
import config from '../config/env.js';

const router = Router();

// Apply authRateLimiter middleware to authentication routes when not in test environment
const applyAuthLimiter = config.isTest ? (req, res, next) => next() : authRateLimiter;

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 */
router.post('/register', applyAuthLimiter, validateRegister, register);

/**
 * @route POST /api/auth/login
 * @desc Authenticate user & return token
 * @access Public
 */
router.post('/login', applyAuthLimiter, validateLogin, login);

/**
 * @route POST /api/auth/refresh
 * @desc Refresh access token using valid refresh token
 * @access Public
 */
router.post('/refresh', applyAuthLimiter, validateRefresh, refresh);

/**
 * @route POST /api/auth/logout
 * @desc Revoke refresh token and logout user
 * @access Public
 */
router.post('/logout', validateLogout, logout);

export default router;
