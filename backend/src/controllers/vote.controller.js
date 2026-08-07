import catchAsync from '../utils/catchAsync.js';
import voteService from '../services/vote.service.js';

/**
 * @route POST /api/votes
 * @desc Cast vote in an election
 * @access Private (Authenticated Voter: STUDENT, VOTER, ADMIN, SUPER_ADMIN)
 */
export const castVote = catchAsync(async (req, res) => {
  const userId = req.user?.id || req.body.voterId || req.body.voter_id;
  const result = await voteService.castVote(userId, req.body);

  return res.status(201).json({
    success: true,
    message: 'Vote cast successfully. Your vote has been recorded on the immutable ledger.',
    data: result,
  });
});

export const create = castVote;

/**
 * @route GET /api/votes/:id
 * @desc Retrieve vote details by vote ID
 * @access Private (ADMIN, SUPER_ADMIN, ELECTION_COMMISSION)
 */
export const getVoteById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const vote = await voteService.getVoteById(id);

  return res.status(200).json({
    success: true,
    message: 'Vote details retrieved successfully',
    data: vote,
  });
});

/**
 * @route GET /api/votes/receipt/:receiptId
 * @desc Retrieve anonymous vote receipt details by receipt ID or receipt code
 * @access Public / Private (Authenticated Voter)
 */
export const getVoteReceipt = catchAsync(async (req, res) => {
  const receiptId = req.params.receiptId || req.params.id;
  const receipt = await voteService.getVoterReceipt(req.user, receiptId);

  return res.status(200).json({
    success: true,
    message: 'Vote receipt retrieved successfully',
    data: receipt,
  });
});

/**
 * @route GET /api/votes/election/:electionId
 * @desc Retrieve paginated votes for an election
 * @access Private (ADMIN, SUPER_ADMIN, ELECTION_COMMISSION)
 */
export const getVotesByElection = catchAsync(async (req, res) => {
  const { electionId } = req.params;
  const result = await voteService.getVotesByElection(electionId, req.query);

  return res.status(200).json({
    success: true,
    message: 'Election votes retrieved successfully',
    data: result.votes || result.data,
    page: result.page,
    limit: result.limit,
    total: result.total,
    totalPages: result.totalPages,
  });
});

/**
 * @route GET /api/votes/audit/:electionId
 * @desc Audit vote records and blockchain ledger for an election
 * @access Private (ADMIN, SUPER_ADMIN, ELECTION_COMMISSION)
 */
export const auditVotes = catchAsync(async (req, res) => {
  const { electionId } = req.params;
  const auditData = await voteService.auditVotes(electionId);

  return res.status(200).json({
    success: true,
    message: 'Vote audit completed successfully',
    data: auditData,
  });
});

/**
 * @route GET /api/votes/status/:electionId
 * @desc Check whether current user has voted in an election
 * @access Private (Authenticated User)
 */
export const getVoterStatus = catchAsync(async (req, res) => {
  const { electionId } = req.params;
  const status = await voteService.getVoterStatus(req.user?.id, electionId);

  return res.status(200).json({
    success: true,
    message: 'Voter status retrieved successfully',
    data: status,
  });
});

/**
 * @route GET /api/votes/verify/:receiptCode
 * @desc Verify vote existence on blockchain ledger using receipt code
 * @access Public / Private
 */
export const verifyVote = catchAsync(async (req, res) => {
  const { receiptCode } = req.params;
  const verification = await voteService.verifyVoteReceipt(receiptCode);

  return res.status(200).json({
    success: true,
    message: 'Vote verification completed successfully',
    data: verification,
  });
});

/**
 * @route GET /api/votes/results/:electionId
 * @desc Get election voting results and candidate tallies
 * @access Public (for COMPLETED elections) / Private (ADMIN, ELECTION_COMMISSION)
 */
export const getResults = catchAsync(async (req, res) => {
  const { electionId } = req.params;
  const results = await voteService.getElectionResults(electionId, req.user || {});

  return res.status(200).json({
    success: true,
    message: 'Election results retrieved successfully',
    data: results,
  });
});

export default {
  castVote,
  create,
  getVoteById,
  getVoteReceipt,
  getVotesByElection,
  auditVotes,
  getVoterStatus,
  verifyVote,
  getResults,
};
