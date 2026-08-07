import catchAsync from '../utils/catchAsync.js';
import candidateService from '../services/candidate.service.js';

/**
 * @route POST /api/candidates
 * @desc Nominate / apply for a candidate position
 * @access Private (Authenticated users)
 */
export const createCandidate = catchAsync(async (req, res) => {
  const payload = {
    ...req.body,
    userId: req.body.userId || req.user.id,
  };

  const candidate = await candidateService.createCandidate(payload);

  return res.status(201).json({
    success: true,
    message: 'Candidacy nomination submitted successfully',
    data: candidate,
  });
});

export const create = createCandidate;

/**
 * @route GET /api/candidates
 * @desc Retrieve list of candidates
 * @access Public (Approved candidates only for unauthenticated users) / Private (Authenticated users)
 */
export const getCandidates = catchAsync(async (req, res) => {
  const query = { ...req.query };

  // Business Rule: Unauthenticated / Public users can view APPROVED candidates only
  if (!req.user) {
    query.approvalStatus = 'APPROVED';
  }

  const result = await candidateService.getCandidates(query);

  return res.status(200).json({
    success: true,
    message: 'Candidates retrieved successfully',
    data: result,
  });
});

export const getAllCandidates = getCandidates;
export const getAll = getCandidates;

/**
 * @route GET /api/candidates/:id
 * @desc Get candidate details by ID
 * @access Public / Private
 */
export const getCandidateById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const candidate = await candidateService.getCandidate(id);

  return res.status(200).json({
    success: true,
    message: 'Candidate details retrieved successfully',
    data: candidate,
  });
});

export const getById = getCandidateById;

/**
 * @route PUT /api/candidates/:id
 * @desc Update candidate manifesto or photo
 * @access Private (Candidate Owner when PENDING, or ADMIN / SUPER_ADMIN)
 */
export const updateCandidate = catchAsync(async (req, res) => {
  const { id } = req.params;
  const updatedCandidate = await candidateService.updateCandidate(id, req.body, req.user);

  return res.status(200).json({
    success: true,
    message: 'Candidate details updated successfully',
    data: updatedCandidate,
  });
});

export const update = updateCandidate;

/**
 * @route PATCH /api/candidates/:id/approve
 * @desc Approve candidate nomination
 * @access Private (ADMIN, SUPER_ADMIN)
 */
export const approveCandidate = catchAsync(async (req, res) => {
  const { id } = req.params;
  const updatedCandidate = await candidateService.approveCandidate(id);

  return res.status(200).json({
    success: true,
    message: 'Candidate nomination approved successfully',
    data: updatedCandidate,
  });
});

/**
 * @route PATCH /api/candidates/:id/reject
 * @desc Reject candidate nomination
 * @access Private (ADMIN, SUPER_ADMIN)
 */
export const rejectCandidate = catchAsync(async (req, res) => {
  const { id } = req.params;
  const updatedCandidate = await candidateService.rejectCandidate(id);

  return res.status(200).json({
    success: true,
    message: 'Candidate nomination rejected successfully',
    data: updatedCandidate,
  });
});

/**
 * @route PATCH /api/candidates/:id/withdraw
 * @desc Withdraw candidate nomination (if not yet approved)
 * @access Private (Candidate Owner or ADMIN / SUPER_ADMIN)
 */
export const withdrawCandidate = catchAsync(async (req, res) => {
  const { id } = req.params;
  const updatedCandidate = await candidateService.withdrawCandidate(id, req.user);

  return res.status(200).json({
    success: true,
    message: 'Candidate nomination withdrawn successfully',
    data: updatedCandidate,
  });
});

/**
 * @route PATCH /api/candidates/:id/status
 * @desc Review candidate nomination status (APPROVED / REJECTED)
 * @access Private (ADMIN, SUPER_ADMIN, ELECTION_COMMISSION)
 */
export const changeStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const statusInput = req.body.approvalStatus || req.body.nominationStatus || req.body.status;
  const formatted = String(statusInput || '').trim().toUpperCase();

  if (formatted === 'APPROVED') {
    const updated = await candidateService.approveCandidate(id);
    return res.status(200).json({
      success: true,
      message: "Candidate nomination status updated to 'APPROVED' successfully",
      data: updated,
    });
  }

  if (formatted === 'REJECTED') {
    const updated = await candidateService.rejectCandidate(id);
    return res.status(200).json({
      success: true,
      message: "Candidate nomination status updated to 'REJECTED' successfully",
      data: updated,
    });
  }

  const updatedCandidate = await candidateService.reviewCandidateStatus(id, formatted);

  return res.status(200).json({
    success: true,
    message: `Candidate nomination status updated to '${formatted}' successfully`,
    data: updatedCandidate,
  });
});

/**
 * @route DELETE /api/candidates/:id
 * @desc Delete candidate nomination
 * @access Private (ADMIN, SUPER_ADMIN, or Candidate Owner)
 */
export const deleteCandidate = catchAsync(async (req, res) => {
  const { id } = req.params;
  await candidateService.deleteCandidate(id, req.user);

  return res.status(200).json({
    success: true,
    message: 'Candidate nomination deleted successfully',
  });
});

export const remove = deleteCandidate;

export default {
  createCandidate,
  getCandidates,
  getAllCandidates,
  getCandidateById,
  updateCandidate,
  approveCandidate,
  rejectCandidate,
  withdrawCandidate,
  changeStatus,
  deleteCandidate,
  create,
  getAll,
  getById,
  update,
  remove,
};
