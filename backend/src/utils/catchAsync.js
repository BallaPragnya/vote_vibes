/**
 * Higher-order function to catch errors in async route handlers
 * and pass them to the Express error middleware via next(err).
 *
 * @param {Function} fn - Async Express route handler function
 * @returns {Function} Express middleware function
 */
export const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

export default catchAsync;
