import { Router } from 'express';
import {
  castVote,
  getVoteById,
  getVoteReceipt,
  getVotesByElection,
  auditVotes,
  getVoterStatus,
  verifyVote,
  getResults,
} from '../controllers/vote.controller.js';
import { validateCastVote } from '../validators/vote.validator.js';
import { authenticate, optionalAuthenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';
import { voteRateLimiter, verificationRateLimiter } from '../middleware/rateLimiter.js';
import config from '../config/env.js';

const router = Router();

const applyVoteLimiter = config.isTest ? (req, res, next) => next() : voteRateLimiter;
const applyVerificationLimiter = config.isTest ? (req, res, next) => next() : verificationRateLimiter;

/**
 * Public / Authenticated Endpoints
 */

// Verify vote on ledger by receipt code
router.get('/verify/:receiptCode', applyVerificationLimiter, optionalAuthenticate, verifyVote);

// View election results (Public when COMPLETED, Admin when ACTIVE)
router.get('/results/:electionId', optionalAuthenticate, getResults);

// View own or public receipt
router.get('/receipt/:receiptId', applyVerificationLimiter, optionalAuthenticate, getVoteReceipt);

/**
 * Authenticated Voter Endpoints (STUDENT, VOTER, ADMIN, SUPER_ADMIN)
 */
router.use(authenticate);

// Cast vote (voter permission with rate limiting)
router.post('/', applyVoteLimiter, validateCastVote, castVote);

// Check voter status in an election
router.get('/status/:electionId', getVoterStatus);

/**
 * Admin & Super Admin Endpoints (ADMIN, SUPER_ADMIN, ELECTION_COMMISSION)
 */

// View election votes (Admin/Super Admin)
router.get('/election/:electionId', authorize('ADMIN', 'SUPER_ADMIN', 'ELECTION_COMMISSION'), getVotesByElection);

// Audit votes & blockchain ledger (Admin/Super Admin)
router.get('/audit/:electionId', authorize('ADMIN', 'SUPER_ADMIN', 'ELECTION_COMMISSION'), auditVotes);

// View single vote details by vote ID (Admin/Super Admin)
router.get('/:id', authorize('ADMIN', 'SUPER_ADMIN', 'ELECTION_COMMISSION'), getVoteById);

export default router;
