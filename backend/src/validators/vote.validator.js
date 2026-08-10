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
 * Validate cast vote request payload for POST /api/votes
 * Validation Rules:
 * - authenticated voter required (req.user.id or voterId)
 * - electionId required (valid UUID & election must exist in DB)
 * - candidateId required (valid UUID, candidate must exist, candidate must belong to the election)
 */
export const validateCastVote = async (req, res, next) => {
  try {
    const { electionId: bodyElectionId, candidateId: bodyCandidateId, votes, positionId, voterId: bodyVoterId } = req.body;
    const voterId = req.user?.id || bodyVoterId || req.body.voter_id;

    // 1. Authenticated voter required
    if (!voterId || typeof voterId !== 'string' || voterId.trim() === '') {
      return next(new AppError('Authenticated voter is required.', 401, 'UnauthorizedError'));
    }

    if (!isValidUUID(voterId.trim())) {
      return next(new AppError('Voter ID must be a valid UUID.', 400, 'ValidationError'));
    }

    // 2. Validate electionId
    const electionId = bodyElectionId || req.body.election_id;
    if (!electionId || typeof electionId !== 'string' || electionId.trim() === '') {
      return next(new AppError('Election ID is required.', 400, 'ValidationError'));
    }

    if (!isValidUUID(electionId.trim())) {
      return next(new AppError('Election ID must be a valid UUID.', 400, 'ValidationError'));
    }

    // 3. Ensure election exists
    const election = await prisma.election.findUnique({
      where: { id: electionId.trim() },
      select: { id: true, status: true },
    });

    if (!election) {
      return next(new AppError(`Election with ID '${electionId}' does not exist.`, 404, 'NotFoundError'));
    }

    // 4. Normalize candidateId / votes
    const singleCandidateId = bodyCandidateId || req.body.candidate_id;
    let normalizedVotes = votes;

    if (singleCandidateId) {
      if (!isValidUUID(singleCandidateId.trim())) {
        return next(new AppError('Candidate ID must be a valid UUID.', 400, 'ValidationError'));
      }
      if (!normalizedVotes) {
        normalizedVotes = [{ candidateId: singleCandidateId.trim(), positionId: positionId ? positionId.trim() : null }];
      }
    }

    if (!normalizedVotes || !Array.isArray(normalizedVotes) || normalizedVotes.length === 0) {
      return next(new AppError('Candidate ID is required.', 400, 'ValidationError'));
    }

    // 5. Validate candidate existence & ensure candidate belongs to election
    for (let i = 0; i < normalizedVotes.length; i++) {
      const selection = normalizedVotes[i];
      const cId = selection.candidateId || selection.candidate_id;

      if (!cId || typeof cId !== 'string' || !isValidUUID(cId.trim())) {
        return next(new AppError(`Candidate ID at index ${i} must be a valid UUID.`, 400, 'ValidationError'));
      }

      const candidate = await prisma.candidate.findUnique({
        where: { id: cId.trim() },
        select: { id: true, electionId: true },
      });

      if (!candidate) {
        return next(new AppError(`Candidate with ID '${cId}' does not exist.`, 404, 'NotFoundError'));
      }

      // Business Rule: candidate must belong to the election
      if (candidate.electionId !== election.id) {
        throw new AppError(
          `Candidate '${cId}' does not belong to election '${election.id}'.`,
          400,
          'ValidationError'
        );
      }
    }

    req.body.normalizedVotes = normalizedVotes;

    return next();
  } catch (error) {
    return next(error);
  }
};

export default {
  validateCastVote,
};
