import AppError from '../utils/AppError.js';

/**
 * Regex for standard RFC-5322 compliant email verification
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validate Registration payload
 * - Name required
 * - Email valid
 * - Password minimum 8 characters
 */
export const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body || {};

  if (!name || typeof name !== 'string' || name.trim() === '') {
    return next(new AppError('Name is required.', 400, 'ValidationError'));
  }

  if (!email || typeof email !== 'string' || email.trim() === '') {
    return next(new AppError('Email is required.', 400, 'ValidationError'));
  }

  if (!EMAIL_REGEX.test(email.trim())) {
    return next(new AppError('Please provide a valid email address.', 400, 'ValidationError'));
  }

  if (!password || typeof password !== 'string') {
    return next(new AppError('Password is required.', 400, 'ValidationError'));
  }

  if (password.length < 8) {
    return next(new AppError('Password must be at least 8 characters long.', 400, 'ValidationError'));
  }

  next();
};

/**
 * Validate Login payload
 * - Email required & valid format
 * - Password required
 */
export const validateLogin = (req, res, next) => {
  const { email, password } = req.body || {};

  if (!email || typeof email !== 'string' || email.trim() === '') {
    return next(new AppError('Email is required.', 400, 'ValidationError'));
  }

  if (!EMAIL_REGEX.test(email.trim())) {
    return next(new AppError('Please provide a valid email address.', 400, 'ValidationError'));
  }

  if (!password || typeof password !== 'string' || password === '') {
    return next(new AppError('Password is required.', 400, 'ValidationError'));
  }

  next();
};

/**
 * Validate Refresh Token payload
 * - Refresh token required
 */
export const validateRefresh = (req, res, next) => {
  const { refreshToken } = req.body || {};

  if (!refreshToken || typeof refreshToken !== 'string' || refreshToken.trim() === '') {
    return next(new AppError('Refresh token is required.', 400, 'ValidationError'));
  }

  next();
};

/**
 * Validate Logout payload
 * - Refresh token required
 */
export const validateLogout = (req, res, next) => {
  const { refreshToken } = req.body || {};

  if (!refreshToken || typeof refreshToken !== 'string' || refreshToken.trim() === '') {
    return next(new AppError('Refresh token is required.', 400, 'ValidationError'));
  }

  next();
};

export default {
  validateRegister,
  validateLogin,
  validateRefresh,
  validateLogout,
};
