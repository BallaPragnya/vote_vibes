import AppError from '../utils/AppError.js';
import prisma from '../config/prisma.js';
import defaultVoteRepository from '../repositories/vote.repository.js';

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
 * Modular Vote Integrity Validator
 * Verifies 7 critical integrity rules before allowing a vote to be cast:
 * 1. Vote request is valid
 * 2. Election exists
 * 3. Election status is ACTIVE
 * 4. Candidate exists
 * 5. Candidate belongs to election
 * 6. User is eligible to vote (user verified / department check)
 * 7. User has not already voted
 * 
 * @param {Object} params
 * @param {string} params.userId - Authenticated voter ID
 * @param {string} params.electionId - Target election ID
 * @param {string} params.candidateId - Selected candidate ID
 * @param {Object} [params.voteRepository] - Optional repo dependency
 * @returns {Promise<Object>} - Validated entity context { election, candidate, user }
 */
export const verifyVoteIntegrity = async ({
  userId,
  electionId,
  candidateId,
  voteRepository = defaultVoteRepository,
}) => {
  // Step 1: Vote request is valid
  if (!userId || typeof userId !== 'string' || userId.trim() === '') {
    throw new AppError('Authenticated voter is required.', 401, 'UnauthorizedError');
  }
  if (!isValidUUID(userId.trim())) {
    throw new AppError('Voter ID must be a valid UUID.', 400, 'ValidationError');
  }

  if (!electionId || typeof electionId !== 'string' || electionId.trim() === '') {
    throw new AppError('Election ID is required.', 400, 'ValidationError');
  }
  if (!isValidUUID(electionId.trim())) {
    throw new AppError('Election ID must be a valid UUID.', 400, 'ValidationError');
  }

  if (!candidateId || typeof candidateId !== 'string' || candidateId.trim() === '') {
    throw new AppError('Candidate ID is required.', 400, 'ValidationError');
  }
  if (!isValidUUID(candidateId.trim())) {
    throw new AppError('Candidate ID must be a valid UUID.', 400, 'ValidationError');
  }

  // Batch database lookups using Promise.all to reduce latency & DB roundtrips
  const [election, candidate, user, hasVoted] = await Promise.all([
    prisma.election.findUnique({
      where: { id: electionId.trim() },
      include: {
        departments: { select: { departmentId: true } },
      },
    }),
    prisma.candidate.findUnique({
      where: { id: candidateId.trim() },
      include: { user: { select: { name: true } } },
    }),
    prisma.user.findUnique({
      where: { id: userId.trim() },
      select: { id: true, status: true, departmentId: true },
    }),
    voteRepository.hasAlreadyVoted(userId.trim(), electionId.trim()),
  ]);

  // Step 2: Validate Election exists
  if (!election) {
    throw new AppError(`Election with ID '${electionId}' does not exist.`, 404, 'NotFoundError');
  }

  // Step 3: Election status is ACTIVE
  const now = new Date();
  if (election.status !== 'ACTIVE') {
    throw new AppError(
      `Cannot cast vote. Election is in '${election.status}' status. Voting is only allowed when status is 'ACTIVE'.`,
      400,
      'InvalidStateError'
    );
  }

  if (now < election.startTime) {
    throw new AppError('Voting has not started yet for this election.', 400, 'InvalidStateError');
  }

  if (now > election.endTime) {
    throw new AppError('Voting has ended for this election.', 400, 'InvalidStateError');
  }

  // Step 4: Validate Candidate exists
  if (!candidate) {
    throw new AppError(`Candidate with ID '${candidateId}' does not exist.`, 404, 'NotFoundError');
  }

  // Step 5: Candidate belongs to election
  if (candidate.electionId !== election.id) {
    throw new AppError(
      `Candidate '${candidateId}' does not belong to election '${election.id}'.`,
      400,
      'ValidationError'
    );
  }

  if (
    candidate.approvalStatus !== 'APPROVED' &&
    candidate.nominationStatus !== 'APPROVED' &&
    candidate.status !== 'APPROVED'
  ) {
    throw new AppError(
      `Cannot vote for candidate '${candidate.fullName || candidate.user?.name || candidateId}'. Candidate nomination has not been approved.`,
      400,
      'InvalidStateError'
    );
  }

  // Step 6: User is eligible to vote
  if (!user) {
    throw new AppError(`Voter with ID '${userId}' does not exist.`, 404, 'NotFoundError');
  }

  if (user.status === 'SUSPENDED') {
    throw new AppError('Your account has been suspended. You are not eligible to vote.', 403, 'ForbiddenError');
  }

  if (election.isDepartmentRestricted) {
    const allowedDepartmentIds = election.departments.map((d) => d.departmentId);
    if (!user.departmentId || !allowedDepartmentIds.includes(user.departmentId)) {
      throw new AppError(
        'You are not eligible to vote in this department-restricted election.',
        403,
        'ForbiddenError'
      );
    }
  }

  // Step 7: User has not already voted
  if (hasVoted) {
    throw new AppError(
      'You have already cast your vote in this election. Duplicate voting is strictly prohibited.',
      400,
      'DuplicateVoteError'
    );
  }

  return { election, candidate, user };
};

export default verifyVoteIntegrity;
