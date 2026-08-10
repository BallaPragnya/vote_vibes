import { Router } from 'express';
import {
  createCandidate,
  getAllCandidates,
  getCandidateById,
  updateCandidate,
  approveCandidate,
  rejectCandidate,
  withdrawCandidate,
  changeStatus,
  deleteCandidate,
} from '../controllers/candidate.controller.js';
import {
  validateCreateCandidate,
  validateUpdateCandidate,
  validateCandidateStatus,
} from '../validators/candidate.validator.js';
import { authenticate, optionalAuthenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';
import { uploadCandidateFiles } from '../middleware/upload.middleware.js';

const router = Router();

/**
 * @route   GET /api/candidates
 * @desc    Get candidates (Public: APPROVED candidates only; Private/Admin: view all statuses)
 * @access  Public / Authenticated
 */
router.get('/', optionalAuthenticate, getAllCandidates);

/**
 * @route   GET /api/candidates/:id
 * @desc    Get candidate details by ID
 * @access  Public / Authenticated
 */
router.get('/:id', optionalAuthenticate, getCandidateById);

/**
 * Apply authenticate middleware globally to all mutating /api/candidates endpoints below
 */
router.use(authenticate);

/**
 * @route   POST /api/candidates
 * @desc    Nominate / apply for a candidate position
 * @access  Private (STUDENT, ADMIN, SUPER_ADMIN)
 */
router.post(
  '/',
  uploadCandidateFiles,
  validateCreateCandidate,
  createCandidate
);

/**
 * @route   PUT /api/candidates/:id
 * @desc    Update candidate manifesto/photo/document
 * @access  Private (Candidate Owner when PENDING, or ADMIN / SUPER_ADMIN)
 */
router.put(
  '/:id',
  uploadCandidateFiles,
  validateUpdateCandidate,
  updateCandidate
);

/**
 * @route   PATCH /api/candidates/:id/approve
 * @route   POST /api/candidates/:id/approve
 * @desc    Approve candidate nomination
 * @access  Private (ADMIN, SUPER_ADMIN)
 */
router.patch(
  '/:id/approve',
  authorize('ADMIN', 'SUPER_ADMIN'),
  approveCandidate
);
router.post(
  '/:id/approve',
  authorize('ADMIN', 'SUPER_ADMIN'),
  approveCandidate
);

/**
 * @route   PATCH /api/candidates/:id/reject
 * @route   POST /api/candidates/:id/reject
 * @desc    Reject candidate nomination
 * @access  Private (ADMIN, SUPER_ADMIN)
 */
router.patch(
  '/:id/reject',
  authorize('ADMIN', 'SUPER_ADMIN'),
  rejectCandidate
);
router.post(
  '/:id/reject',
  authorize('ADMIN', 'SUPER_ADMIN'),
  rejectCandidate
);

/**
 * @route   PATCH /api/candidates/:id/withdraw
 * @desc    Withdraw candidate nomination (allowed if not yet approved)
 * @access  Private (Candidate Owner or ADMIN / SUPER_ADMIN)
 */
router.patch(
  '/:id/withdraw',
  withdrawCandidate
);

/**
 * @route   PATCH /api/candidates/:id/status
 * @desc    Review candidate nomination status (APPROVED / REJECTED)
 * @access  Private (ADMIN, SUPER_ADMIN, ELECTION_COMMISSION)
 */
router.patch(
  '/:id/status',
  authorize('ADMIN', 'SUPER_ADMIN', 'ELECTION_COMMISSION'),
  validateCandidateStatus,
  changeStatus
);

/**
 * @route   DELETE /api/candidates/:id
 * @desc    Delete candidate nomination
 * @access  Private (ADMIN, SUPER_ADMIN, ELECTION_COMMISSION, or Candidate Owner)
 */
router.delete(
  '/:id',
  authorize('ADMIN', 'SUPER_ADMIN', 'ELECTION_COMMISSION', 'STUDENT'),
  deleteCandidate
);

export default router;
