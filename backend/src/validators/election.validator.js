import AppError from '../utils/AppError.js';

const VALID_ELECTION_STATUSES = ['DRAFT', 'UPCOMING', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'ARCHIVED'];

/**
 * Validate election creation request body
 * Rules:
 * - title is required & non-empty string
 * - startDate / startTime is required & valid date
 * - endDate / endTime is required & valid date
 * - endDate must be strictly greater than startDate
 * - description is optional
 */
export const validateCreateElection = (req, res, next) => {
  const { title, description, startDate: rawStartDate, startTime: rawStartTime, endDate: rawEndDate, endTime: rawEndTime, isDepartmentRestricted, departmentIds } = req.body || {};

  // 1. Title validation
  if (!title || typeof title !== 'string' || title.trim() === '') {
    return next(new AppError('Title is required and cannot be empty.', 400, 'ValidationError'));
  }

  // 2. Start Date validation (accepts startDate or startTime)
  const startInput = rawStartDate || rawStartTime;
  if (!startInput) {
    return next(new AppError('Start date is required.', 400, 'ValidationError'));
  }

  const startDate = new Date(startInput);
  if (isNaN(startDate.getTime())) {
    return next(new AppError('Invalid start date format.', 400, 'ValidationError'));
  }

  // 3. End Date validation (accepts endDate or endTime)
  const endInput = rawEndDate || rawEndTime;
  if (!endInput) {
    return next(new AppError('End date is required.', 400, 'ValidationError'));
  }

  const endDate = new Date(endInput);
  if (isNaN(endDate.getTime())) {
    return next(new AppError('Invalid end date format.', 400, 'ValidationError'));
  }

  // 4. Date comparison (endDate > startDate)
  if (endDate <= startDate) {
    return next(new AppError('End date must be strictly after start date.', 400, 'ValidationError'));
  }

  // 5. Description is optional, if provided ensure it is a string
  if (description !== undefined && typeof description !== 'string') {
    return next(new AppError('Description must be a string.', 400, 'ValidationError'));
  }

  // 6. Department restriction optional check
  if (isDepartmentRestricted !== undefined && typeof isDepartmentRestricted !== 'boolean') {
    return next(new AppError('isDepartmentRestricted must be a boolean.', 400, 'ValidationError'));
  }

  if (isDepartmentRestricted && (!Array.isArray(departmentIds) || departmentIds.length === 0)) {
    return next(new AppError('departmentIds must be a non-empty array when department restricted.', 400, 'ValidationError'));
  }

  next();
};

/**
 * Validate election update request body
 * Rules:
 * - title cannot be empty if provided
 * - startDate / startTime must be valid date if provided
 * - endDate / endTime must be valid date if provided
 * - endDate must be greater than startDate if both are provided
 * - description is optional
 */
export const validateUpdateElection = (req, res, next) => {
  const { title, description, startDate: rawStartDate, startTime: rawStartTime, endDate: rawEndDate, endTime: rawEndTime, isDepartmentRestricted } = req.body || {};

  if (title !== undefined && (typeof title !== 'string' || title.trim() === '')) {
    return next(new AppError('Title cannot be empty.', 400, 'ValidationError'));
  }

  if (description !== undefined && typeof description !== 'string') {
    return next(new AppError('Description must be a string.', 400, 'ValidationError'));
  }

  let startDate, endDate;
  const startInput = rawStartDate || rawStartTime;
  if (startInput !== undefined) {
    startDate = new Date(startInput);
    if (isNaN(startDate.getTime())) {
      return next(new AppError('Invalid start date format.', 400, 'ValidationError'));
    }
  }

  const endInput = rawEndDate || rawEndTime;
  if (endInput !== undefined) {
    endDate = new Date(endInput);
    if (isNaN(endDate.getTime())) {
      return next(new AppError('Invalid end date format.', 400, 'ValidationError'));
    }
  }

  if (startDate && endDate && endDate <= startDate) {
    return next(new AppError('End date must be strictly after start date.', 400, 'ValidationError'));
  }

  if (isDepartmentRestricted !== undefined && typeof isDepartmentRestricted !== 'boolean') {
    return next(new AppError('isDepartmentRestricted must be a boolean.', 400, 'ValidationError'));
  }

  next();
};

/**
 * Validate status change payload
 */
export const validateElectionStatus = (req, res, next) => {
  const { status } = req.body || {};

  if (!status || !VALID_ELECTION_STATUSES.includes(status)) {
    return next(
      new AppError(
        `Invalid election status. Must be one of: ${VALID_ELECTION_STATUSES.join(', ')}`,
        400,
        'ValidationError'
      )
    );
  }

  next();
};

export default {
  validateCreateElection,
  validateUpdateElection,
  validateElectionStatus,
};
