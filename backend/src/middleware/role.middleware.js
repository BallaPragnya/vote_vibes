import AppError from '../utils/AppError.js';

/**
 * Middleware factory for Role-Based Access Control (RBAC)
 * @param {...string} allowedRoles - List of allowed roles (e.g. 'ADMIN', 'VOTER', 'CANDIDATE')
 * @returns {Function} Express middleware function
 */
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    // 1. Check if user object is attached to request (via authenticate middleware)
    if (!req.user) {
      return next(new AppError('Authentication required.', 401, 'UnauthorizedError'));
    }

    // 2. Check if user's role matches any of the allowed roles
    const userRole = req.user.role;
    if (!allowedRoles.includes(userRole)) {
      return next(
        new AppError('You do not have permission to perform this action.', 403, 'ForbiddenError')
      );
    }

    next();
  };
};

export default authorize;
