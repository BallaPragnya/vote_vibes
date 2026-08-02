import { Router } from 'express';
import { register, login, refresh, logout } from '../controllers/auth.controller.js';
import { validateRegister, validateLogin, validateRefresh, validateLogout } from '../validators/auth.validator.js';

const router = Router();

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 */
router.post('/register', validateRegister, register);

/**
 * @route POST /api/auth/login
 * @desc Authenticate user & return token
 * @access Public
 */
router.post('/login', validateLogin, login);

/**
 * @route POST /api/auth/refresh
 * @desc Refresh access token using valid refresh token
 * @access Public
 */
router.post('/refresh', validateRefresh, refresh);

/**
 * @route POST /api/auth/logout
 * @desc Revoke refresh token and logout user
 * @access Public
 */
router.post('/logout', validateLogout, logout);

export default router;
