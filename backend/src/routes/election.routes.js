import { Router } from 'express';
import {
  createElection,
  getAllElections,
  getElectionById,
  updateElection,
  changeStatus,
  deleteElection,
} from '../controllers/election.controller.js';
import {
  validateCreateElection,
  validateUpdateElection,
  validateElectionStatus,
} from '../validators/election.validator.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';

const router = Router();

/**
 * Apply authenticate middleware globally to all /api/elections routes.
 * Ensures any authenticated user (VOTER, CANDIDATE, ADMIN, SUPER_ADMIN, ELECTION_COMMISSION)
 * can access read endpoints (GET /api/elections, GET /api/elections/:id).
 */
router.use(authenticate);

/**
 * @route   POST /api/elections
 * @desc    Create a new election
 * @access  Private (ADMIN, SUPER_ADMIN, ELECTION_COMMISSION)
 */
router.post(
  '/',
  authorize('ADMIN', 'SUPER_ADMIN', 'ELECTION_COMMISSION'),
  validateCreateElection,
  createElection
);

/**
 * @route   GET /api/elections
 * @desc    Get all elections (supports search, status/dept filtering, pagination & sorting)
 * @access  Private (All authenticated users)
 */
router.get('/', getAllElections);

/**
 * @route   GET /api/elections/:id
 * @desc    Get single election details by ID
 * @access  Private (All authenticated users)
 */
router.get('/:id', getElectionById);

/**
 * @route   PUT /api/elections/:id
 * @desc    Update election parameters (DRAFT status elections only)
 * @access  Private (ADMIN, SUPER_ADMIN, ELECTION_COMMISSION)
 */
router.put(
  '/:id',
  authorize('ADMIN', 'SUPER_ADMIN', 'ELECTION_COMMISSION'),
  validateUpdateElection,
  updateElection
);

/**
 * @route   PATCH /api/elections/:id/status
 * @desc    Transition election status
 * @access  Private (ADMIN, SUPER_ADMIN, ELECTION_COMMISSION)
 */
router.patch(
  '/:id/status',
  authorize('ADMIN', 'SUPER_ADMIN', 'ELECTION_COMMISSION'),
  validateElectionStatus,
  changeStatus
);

/**
 * @route   DELETE /api/elections/:id
 * @desc    Delete election (DRAFT or CANCELLED status elections only)
 * @access  Private (ADMIN, SUPER_ADMIN, ELECTION_COMMISSION)
 */
router.delete(
  '/:id',
  authorize('ADMIN', 'SUPER_ADMIN', 'ELECTION_COMMISSION'),
  deleteElection
);

export default router;
