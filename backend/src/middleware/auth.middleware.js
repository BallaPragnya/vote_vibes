import jwt from 'jsonwebtoken';
import config from '../config/env.js';
import AppError from '../utils/AppError.js';
import userRepository from '../repositories/user.repository.js';

/**
 * Express middleware to authenticate requests via JWT Bearer tokens
 */
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // 1. Check for Authorization header
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new AppError('Authentication token is missing.', 401, 'UnauthorizedError'));
    }

    const token = authHeader.split(' ')[1];
    if (!token || token.trim() === '') {
      return next(new AppError('Authentication token is missing.', 401, 'UnauthorizedError'));
    }

    // 2. Verify JWT token signature & expiration
    let decoded;
    try {
      decoded = jwt.verify(token, config.jwtAccessSecret);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return next(new AppError('Token has expired.', 401, 'TokenExpiredError'));
      }
      return next(new AppError('Invalid token.', 401, 'UnauthorizedError'));
    }

    // 3. Verify user exists in database
    const user = await userRepository.findById(decoded.id);
    if (!user) {
      return next(new AppError('User belonging to this token no longer exists.', 401, 'UnauthorizedError'));
    }

    // 4. Attach authenticated user details to req.user
    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role ? user.role.name : 'VOTER',
    };

    next();
  } catch (error) {
    next(error);
  }
};

export default {
  authenticate,
};
