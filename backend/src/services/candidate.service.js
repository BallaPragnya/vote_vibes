import AppError from '../utils/AppError.js';
import defaultCandidateRepository from '../repositories/candidate.repository.js';
import prisma from '../config/prisma.js';

export class CandidateService {
  /**
   * @param {Object} [candidateRepo] 
   */
  constructor(candidateRepo = defaultCandidateRepository) {
    this.candidateRepository = candidateRepo;
  }

  /**
   * Create candidate nomination
   * Business Rules:
   * - Election must exist (throws 404 NotFoundError)
   * - Election must not be ARCHIVED, COMPLETED, or CANCELLED (throws 400 InvalidStateError)
   * - User cannot nominate twice for the same election or position (throws 400 DuplicateNominationError)
   * - Nomination must remain PENDING until admin approval
   * @param {Object} payload - { electionId, positionId, userId, fullName, manifesto, profileImage, photoUrl }
   * @returns {Promise<Object>}
   */
  async createCandidate({ electionId, positionId, userId, fullName, manifesto, profileImage, photoUrl }) {
    if (!electionId || !userId || !manifesto || !fullName) {
      throw new AppError('Election ID, User ID, Full name, and Manifesto are required.', 400, 'ValidationError');
    }

    // 1. Business Rule: Election must exist
    const election = await prisma.election.findUnique({
      where: { id: electionId },
    });

    if (!election) {
      throw new AppError(`Election with ID '${electionId}' not found.`, 404, 'NotFoundError');
    }

    // 2. Business Rule: Election must not be ARCHIVED, COMPLETED, or CANCELLED
    if (['ARCHIVED', 'COMPLETED', 'CANCELLED'].includes(election.status)) {
      throw new AppError(
        `Cannot submit candidate nomination. Election is in '${election.status}' status.`,
        400,
        'InvalidStateError'
      );
    }

    // 3. If positionId is provided, verify position existence
    if (positionId) {
      const position = await prisma.position.findUnique({
        where: { id: positionId },
      });

      if (!position) {
        throw new AppError(`Position with ID '${positionId}' not found.`, 404, 'NotFoundError');
      }
    }

    // 4. Business Rule: User cannot nominate twice for the same election
    const existingElectionNomination = await this.candidateRepository.findByElectionAndUser(electionId, userId);
    if (existingElectionNomination) {
      throw new AppError(
        'User has already submitted a candidate nomination for this election.',
        400,
        'DuplicateNominationError'
      );
    }

    if (positionId) {
      const existingPositionNomination = await this.candidateRepository.findByPositionAndUser(positionId, userId);
      if (existingPositionNomination) {
        throw new AppError(
          'User has already submitted a candidate nomination for this position.',
          400,
          'DuplicateNominationError'
        );
      }
    }

    // 5. Business Rule: Nomination must remain PENDING until admin approval
    return this.candidateRepository.createCandidate({
      electionId,
      positionId,
      userId,
      fullName,
      manifesto,
      profileImage,
      photoUrl,
      nominationStatus: 'PENDING',
      approvalStatus: 'PENDING',
      status: 'PENDING',
    });
  }

  // Alias for backward compatibility
  async nominateCandidate(payload) {
    return this.createCandidate(payload);
  }

  /**
   * Get single candidate by ID
   * @param {string} id 
   * @returns {Promise<Object>}
   */
  async getCandidate(id) {
    if (!id) {
      throw new AppError('Candidate ID is required.', 400, 'ValidationError');
    }

    const candidate = await this.candidateRepository.getCandidateById(id);
    if (!candidate) {
      throw new AppError('Candidate not found.', 404, 'NotFoundError');
    }

    return candidate;
  }

  // Alias for backward compatibility
  async getCandidateById(id) {
    return this.getCandidate(id);
  }

  /**
   * Retrieve list of candidates matching query parameters
   * @param {Object} options 
   * @returns {Promise<Object>}
   */
  async getCandidates(options = {}) {
    if (typeof this.candidateRepository.getCandidates === 'function') {
      return this.candidateRepository.getCandidates(options);
    }
    return this.candidateRepository.getAllCandidates(options);
  }

  // Alias for backward compatibility
  async getAllCandidates(options = {}) {
    return this.getCandidates(options);
  }

  /**
   * Update candidate details (manifesto, profileImage, photoUrl, fullName)
   * Business Rules:
   * - Candidate owner can only modify details while nomination is in PENDING status
   * - Prevent updates after approval (APPROVED / REJECTED) unless authorized Admin/Commission
   * @param {string} id 
   * @param {Object} updateData 
   * @param {Object} currentUser - { id, role }
   * @returns {Promise<Object>}
   */
  async updateCandidate(id, updateData, currentUser = {}) {
    const candidate = await this.getCandidate(id);

    const isOwner = currentUser.id === candidate.userId;
    const isAuthorizedRole = ['ADMIN', 'SUPER_ADMIN', 'ELECTION_COMMISSION'].includes(currentUser.role);

    if (!isOwner && !isAuthorizedRole) {
      throw new AppError('You do not have permission to update this candidate nomination.', 403, 'ForbiddenError');
    }

    // Business Rule: Prevent updates after approval/rejection for candidate owners
    if (isOwner && !isAuthorizedRole) {
      if (candidate.approvalStatus === 'APPROVED' || candidate.nominationStatus === 'APPROVED' || candidate.status === 'APPROVED') {
        throw new AppError(
          'Candidate details cannot be modified after nomination approval.',
          400,
          'InvalidStateError'
        );
      }

      if (candidate.approvalStatus !== 'PENDING' && candidate.nominationStatus !== 'PENDING') {
        throw new AppError(
          `Candidates can only modify their application while in 'PENDING' status. Current status: '${candidate.nominationStatus || candidate.status}'.`,
          400,
          'InvalidStateError'
        );
      }
    }

    return this.candidateRepository.updateCandidate(id, updateData);
  }

  /**
   * Approve candidate nomination
   * Business Rules:
   * - Only ADMIN and SUPER_ADMIN (or ELECTION_COMMISSION) can approve
   * - Updates nominationStatus, approvalStatus, and status to APPROVED
   * @param {string} id 
   * @returns {Promise<Object>}
   */
  async approveCandidate(id) {
    await this.getCandidate(id);
    return this.candidateRepository.approveCandidate(id);
  }

  /**
   * Reject candidate nomination
   * Business Rules:
   * - Only ADMIN and SUPER_ADMIN (or ELECTION_COMMISSION) can reject
   * - Updates nominationStatus, approvalStatus, and status to REJECTED
   * @param {string} id 
   * @returns {Promise<Object>}
   */
  async rejectCandidate(id) {
    await this.getCandidate(id);
    return this.candidateRepository.rejectCandidate(id);
  }

  /**
   * Withdraw candidate nomination
   * Business Rules:
   * - Candidates may withdraw their own nomination if it has NOT yet been approved
   * - If already approved, candidate cannot withdraw (throws 400 InvalidStateError)
   * - Updates nominationStatus to WITHDRAWN
   * @param {string} id 
   * @param {Object} currentUser 
   * @returns {Promise<Object>}
   */
  async withdrawCandidate(id, currentUser = {}) {
    const candidate = await this.getCandidate(id);

    const isOwner = currentUser.id === candidate.userId;
    const isAuthorizedRole = ['ADMIN', 'SUPER_ADMIN', 'ELECTION_COMMISSION'].includes(currentUser.role);

    if (!isOwner && !isAuthorizedRole) {
      throw new AppError('You do not have permission to withdraw this candidacy nomination.', 403, 'ForbiddenError');
    }

    // Business Rule: Candidates may withdraw their own nomination if it has not yet been approved
    if (isOwner && !isAuthorizedRole && (candidate.approvalStatus === 'APPROVED' || candidate.nominationStatus === 'APPROVED')) {
      throw new AppError(
        'Approved candidate nominations cannot be withdrawn by the candidate.',
        400,
        'InvalidStateError'
      );
    }

    return this.candidateRepository.updateCandidate(id, {
      nominationStatus: 'WITHDRAWN',
      approvalStatus: 'REJECTED',
      status: 'REJECTED',
    });
  }

  /**
   * Delete candidate nomination
   * @param {string} id 
   * @param {Object} currentUser 
   * @returns {Promise<Object>}
   */
  async deleteCandidate(id, currentUser = {}) {
    const candidate = await this.getCandidate(id);

    const isOwner = currentUser.id === candidate.userId;
    const isAuthorizedRole = ['ADMIN', 'SUPER_ADMIN', 'ELECTION_COMMISSION'].includes(currentUser.role);

    if (!isOwner && !isAuthorizedRole) {
      throw new AppError('You do not have permission to delete this candidate nomination.', 403, 'ForbiddenError');
    }

    return this.candidateRepository.deleteCandidate(id);
  }
}

export const candidateService = new CandidateService();
export default candidateService;
