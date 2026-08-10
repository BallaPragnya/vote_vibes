/**
 * Custom AppError class for operational errors.
 * Operational errors represent expected runtime errors (e.g. invalid input, resource not found).
 */
export class AppError extends Error {
  /**
   * @param {string} message - Error description
   * @param {number} statusCode - HTTP status code (e.g. 400, 404, 409)
   * @param {string} [errorType] - Optional error identifier/name
   */
  constructor(message, statusCode = 500, errorType = null) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.errorType = errorType || (this.statusCode >= 500 ? 'InternalServerError' : 'BadRequestError');
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
