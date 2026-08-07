import AppError from '../utils/AppError.js';
import prisma from '../config/prisma.js';

/**
 * Helper to validate UUID v4 format
 * @param {string} str 
 * @returns {boolean}
 */
const isValidUUID = (str) => {
  if (typeof str !== 'string') return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

/**
 * Validate create candidate payload
 * Requirements:
 * - electionId required (valid UUID & exists in database)
 * - userId required (valid UUID)
 * - fullName required (non-empty string)
 * - manifesto required (length between 10 and 5000 characters)
 * - profileImage optional (valid URL string if provided)
 */
export const validateCreateCandidate = async (req, res, next) => {
  try {
    const { electionId, positionId, userId: bodyUserId, fullName, manifesto, profileImage, photoUrl } = req.body;
    const userId = bodyUserId || req.user?.id;

    // 1. Validate electionId
    const targetElectionId = electionId || req.body.election_id;
    if (!targetElectionId || typeof targetElectionId !== 'string' || targetElectionId.trim() === '') {
      return next(new AppError('Election ID is required.', 400, 'ValidationError'));
    }

    if (!isValidUUID(targetElectionId.trim())) {
      return next(new AppError('Election ID must be a valid UUID.', 400, 'ValidationError'));
    }

    // 2. Ensure election exists in database
    const electionExists = await prisma.election.findUnique({
      where: { id: targetElectionId.trim() },
      select: { id: true },
    });

    if (!electionExists) {
      return next(new AppError(`Election with ID '${targetElectionId}' does not exist.`, 404, 'NotFoundError'));
    }

    // 3. Validate userId
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      return next(new AppError('User ID is required.', 400, 'ValidationError'));
    }

    if (!isValidUUID(userId.trim())) {
      return next(new AppError('User ID must be a valid UUID.', 400, 'ValidationError'));
    }

    // 4. Validate fullName
    if (!fullName || typeof fullName !== 'string' || fullName.trim() === '') {
      return next(new AppError('Full name is required.', 400, 'ValidationError'));
    }

    // 5. Validate manifesto & length constraints
    if (!manifesto || typeof manifesto !== 'string' || manifesto.trim() === '') {
      return next(new AppError('Manifesto is required.', 400, 'ValidationError'));
    }

    const trimmedManifesto = manifesto.trim();
    if (trimmedManifesto.length < 10) {
      return next(new AppError('Manifesto must be at least 10 characters long.', 400, 'ValidationError'));
    }

    if (trimmedManifesto.length > 5000) {
      return next(new AppError('Manifesto cannot exceed 5000 characters.', 400, 'ValidationError'));
    }

    // 6. Validate profileImage / photoUrl if provided
    const imageInput = profileImage || photoUrl;
    if (imageInput !== undefined && imageInput !== null && typeof imageInput === 'string' && imageInput.trim() !== '') {
      try {
        new URL(imageInput.trim());
      } catch (e) {
        if (!imageInput.trim().startsWith('/') && !imageInput.trim().startsWith('http')) {
          return next(new AppError('Profile image must be a valid URL string.', 400, 'ValidationError'));
        }
      }
    }

    return next();
  } catch (error) {
    return next(error);
  }
};

/**
 * Validate update candidate payload
 * Requirements:
 * - fullName (optional, non-empty if provided)
 * - manifesto (optional, length between 10 and 5000 characters)
 * - profileImage (optional, valid URL if provided)
 */
export const validateUpdateCandidate = (req, res, next) => {
  const { fullName, manifesto, profileImage, photoUrl } = req.body;

  if (fullName !== undefined && (typeof fullName !== 'string' || fullName.trim() === '')) {
    return next(new AppError('Full name cannot be empty.', 400, 'ValidationError'));
  }

  if (manifesto !== undefined) {
    if (typeof manifesto !== 'string' || manifesto.trim() === '') {
      return next(new AppError('Manifesto cannot be empty.', 400, 'ValidationError'));
    }

    const trimmedManifesto = manifesto.trim();
    if (trimmedManifesto.length < 10) {
      return next(new AppError('Manifesto must be at least 10 characters long.', 400, 'ValidationError'));
    }

    if (trimmedManifesto.length > 5000) {
      return next(new AppError('Manifesto cannot exceed 5000 characters.', 400, 'ValidationError'));
    }
  }

  const imageInput = profileImage || photoUrl;
  if (imageInput !== undefined && imageInput !== null && typeof imageInput === 'string' && imageInput.trim() !== '') {
    try {
      new URL(imageInput.trim());
    } catch (e) {
      if (!imageInput.trim().startsWith('/') && !imageInput.trim().startsWith('http')) {
        return next(new AppError('Profile image must be a valid URL string.', 400, 'ValidationError'));
      }
    }
  }

  return next();
};

/**
 * Validate approve / review candidate status payload
 * Requirements:
 * - approvalStatus / nominationStatus / status required
 * - Must be one of: 'PENDING', 'APPROVED', 'REJECTED', 'WITHDRAWN'
 */
export const validateApproveCandidate = (req, res, next) => {
  const statusInput = req.body.approvalStatus || req.body.nominationStatus || req.body.status;
  const validStatuses = ['PENDING', 'APPROVED', 'REJECTED', 'WITHDRAWN'];

  if (!statusInput || typeof statusInput !== 'string' || !validStatuses.includes(statusInput.trim().toUpperCase())) {
    return next(
      new AppError(
        `Invalid approval status. Status must be one of: ${validStatuses.join(', ')}.`,
        400,
        'ValidationError'
      )
    );
  }

  return next();
};

export const validateCandidateStatus = validateApproveCandidate;

export default {
  validateCreateCandidate,
  validateUpdateCandidate,
  validateApproveCandidate,
  validateCandidateStatus,
};
