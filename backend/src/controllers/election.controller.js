import catchAsync from '../utils/catchAsync.js';
import electionService from '../services/election.service.js';

/**
 * @route POST /api/elections
 * @desc Create a new election
 * @access Private (ADMIN, ELECTION_COMMISSION)
 */
export const createElection = catchAsync(async (req, res) => {
  const payload = {
    ...req.body,
    createdById: req.user.id,
  };

  const election = await electionService.createElection(payload);

  return res.status(201).json({
    success: true,
    message: 'Election created successfully',
    data: election,
  });
});

export const create = createElection;

/**
 * @route GET /api/elections
 * @desc Retrieve list of elections (with search, filtering, sorting & pagination)
 * @access Private (Authenticated users)
 */
export const getAllElections = catchAsync(async (req, res) => {
  const result = await electionService.getAllElections(req.query);

  return res.status(200).json({
    success: true,
    message: 'Elections retrieved successfully',
    data: result,
  });
});

export const getAll = getAllElections;

/**
 * @route GET /api/elections/:id
 * @desc Get election details by ID
 * @access Private (Authenticated users)
 */
export const getElectionById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const election = await electionService.getElection(id);

  return res.status(200).json({
    success: true,
    message: 'Election details retrieved successfully',
    data: election,
  });
});

export const getById = getElectionById;

/**
 * @route PUT /api/elections/:id
 * @desc Update election parameters (DRAFT elections only)
 * @access Private (ADMIN, ELECTION_COMMISSION)
 */
export const updateElection = catchAsync(async (req, res) => {
  const { id } = req.params;
  const updatedElection = await electionService.updateElection(id, req.body);

  return res.status(200).json({
    success: true,
    message: 'Election updated successfully',
    data: updatedElection,
  });
});

export const update = updateElection;

/**
 * @route PATCH /api/elections/:id/status
 * @desc Transition election status
 * @access Private (ADMIN, ELECTION_COMMISSION)
 */
export const changeStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const updatedElection = await electionService.changeElectionStatus(id, status);

  return res.status(200).json({
    success: true,
    message: `Election status updated to '${status}' successfully`,
    data: updatedElection,
  });
});

/**
 * @route DELETE /api/elections/:id
 * @desc Delete election (DRAFT or CANCELLED status only)
 * @access Private (ADMIN, ELECTION_COMMISSION)
 */
export const deleteElection = catchAsync(async (req, res) => {
  const { id } = req.params;
  await electionService.deleteElection(id);

  return res.status(200).json({
    success: true,
    message: 'Election deleted successfully',
  });
});

export const remove = deleteElection;

export default {
  createElection,
  getAllElections,
  getElectionById,
  updateElection,
  changeStatus,
  deleteElection,
  create,
  getAll,
  getById,
  update,
  remove,
};
