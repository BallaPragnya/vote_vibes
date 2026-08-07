import prisma from '../config/prisma.js';
import { getPaginationParams, formatPaginatedResponse } from '../utils/pagination.js';

export class CandidateRepository {
  /**
   * Create a new candidate record
   * @param {Object} data - { electionId, positionId, userId, fullName, manifesto, profileImage, photoUrl, nominationStatus, approvalStatus, status }
   * @returns {Promise<Object>}
   */
  async createCandidate({
    electionId,
    positionId = null,
    userId,
    fullName = null,
    manifesto,
    profileImage = null,
    photoUrl = null,
    nominationStatus = 'PENDING',
    approvalStatus = 'PENDING',
    status = 'PENDING',
  }) {
    const image = profileImage || photoUrl;

    return prisma.candidate.create({
      data: {
        electionId,
        positionId,
        userId,
        fullName: fullName ? fullName.trim() : null,
        manifesto: manifesto.trim(),
        profileImage: image ? image.trim() : null,
        photoUrl: image ? image.trim() : null,
        nominationStatus,
        approvalStatus,
        status,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            studentIdNumber: true,
            department: true,
          },
        },
        election: {
          select: {
            id: true,
            title: true,
            status: true,
            startTime: true,
            endTime: true,
          },
        },
        position: {
          select: {
            id: true,
            title: true,
            maxChoices: true,
          },
        },
      },
    });
  }

  // Alias for backward compatibility
  async create(data) {
    return this.createCandidate(data);
  }

  /**
   * Find candidate by ID including relations (user, election, position)
   * @param {string} id 
   * @returns {Promise<Object|null>}
   */
  async getCandidateById(id) {
    return prisma.candidate.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            studentIdNumber: true,
            department: true,
          },
        },
        election: {
          select: {
            id: true,
            title: true,
            status: true,
            startTime: true,
            endTime: true,
          },
        },
        position: {
          select: {
            id: true,
            title: true,
            maxChoices: true,
          },
        },
      },
    });
  }

  // Alias for backward compatibility
  async findById(id) {
    return this.getCandidateById(id);
  }

  /**
   * Find nomination by positionId/electionId and userId to prevent duplicate candidacies
   * @param {string} positionIdOrElectionId 
   * @param {string} userId 
   * @returns {Promise<Object|null>}
   */
  async findByPositionAndUser(positionId, userId) {
    if (positionId) {
      return prisma.candidate.findFirst({
        where: {
          positionId,
          userId,
        },
      });
    }
    return null;
  }

  /**
   * Find nomination by electionId and userId
   * @param {string} electionId 
   * @param {string} userId 
   * @returns {Promise<Object|null>}
   */
  async findByElectionAndUser(electionId, userId) {
    return prisma.candidate.findFirst({
      where: {
        electionId,
        userId,
      },
    });
  }

  /**
   * Get candidates matching filters, search criteria, pagination, and sorting
   * @param {Object} options - { electionId, positionId, userId, nominationStatus, approvalStatus, status, search, page, limit, sortBy, sortOrder }
   * @returns {Promise<Object>} - { data, candidates, page, limit, total, totalPages }
   */
  async getCandidates({
    electionId,
    positionId,
    userId,
    nominationStatus,
    approvalStatus,
    status,
    search,
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = {}) {
    const where = {};
    const andConditions = [];

    if (electionId) {
      where.electionId = electionId;
    }

    if (positionId) {
      where.positionId = positionId;
    }

    if (userId) {
      where.userId = userId;
    }

    if (nominationStatus && typeof nominationStatus === 'string' && nominationStatus.trim() !== '') {
      where.nominationStatus = nominationStatus.trim().toUpperCase();
    }

    if (approvalStatus && typeof approvalStatus === 'string' && approvalStatus.trim() !== '') {
      where.approvalStatus = approvalStatus.trim().toUpperCase();
    }

    if (status && typeof status === 'string' && status.trim() !== '') {
      where.status = status.trim().toUpperCase();
    }

    if (search && typeof search === 'string' && search.trim() !== '') {
      const searchTerm = search.trim();
      andConditions.push({
        OR: [
          { fullName: { contains: searchTerm, mode: 'insensitive' } },
          { manifesto: { contains: searchTerm, mode: 'insensitive' } },
          {
            user: {
              name: { contains: searchTerm, mode: 'insensitive' },
            },
          },
          {
            position: {
              title: { contains: searchTerm, mode: 'insensitive' },
            },
          },
        ],
      });
    }

    if (andConditions.length > 0) {
      where.AND = andConditions;
    }

    const { page: parsedPage, limit: parsedLimit, skip, take } = getPaginationParams({ page, limit });

    const validSortFields = ['createdAt', 'updatedAt', 'nominationStatus', 'approvalStatus', 'status', 'fullName'];
    const orderByField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const direction = String(sortOrder).toLowerCase() === 'asc' ? 'asc' : 'desc';

    const [candidates, total] = await Promise.all([
      prisma.candidate.findMany({
        where,
        skip,
        take,
        orderBy: { [orderByField]: direction },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              studentIdNumber: true,
              department: true,
            },
          },
          election: {
            select: {
              id: true,
              title: true,
              status: true,
            },
          },
          position: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      }),
      prisma.candidate.count({ where }),
    ]);

    const formatted = formatPaginatedResponse(candidates, total, parsedPage, parsedLimit);

    return {
      ...formatted,
      candidates: formatted.data,
    };
  }

  // Alias for backward compatibility
  async getAllCandidates(options) {
    return this.getCandidates(options);
  }

  // Alias for backward compatibility
  async findAll(options) {
    return this.getCandidates(options);
  }

  /**
   * Update candidate record
   * @param {string} id 
   * @param {Object} data 
   * @returns {Promise<Object>}
   */
  async updateCandidate(id, data) {
    const updatePayload = {};

    if (data.fullName !== undefined) updatePayload.fullName = data.fullName ? data.fullName.trim() : null;
    if (data.manifesto !== undefined) updatePayload.manifesto = data.manifesto.trim();

    const image = data.profileImage || data.photoUrl;
    if (image !== undefined) {
      updatePayload.profileImage = image ? image.trim() : null;
      updatePayload.photoUrl = image ? image.trim() : null;
    }

    if (data.nominationStatus !== undefined) updatePayload.nominationStatus = data.nominationStatus;
    if (data.approvalStatus !== undefined) updatePayload.approvalStatus = data.approvalStatus;
    if (data.status !== undefined) updatePayload.status = data.status;

    return prisma.candidate.update({
      where: { id },
      data: updatePayload,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            studentIdNumber: true,
          },
        },
        election: {
          select: {
            id: true,
            title: true,
          },
        },
        position: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
  }

  // Alias for backward compatibility
  async update(id, data) {
    return this.updateCandidate(id, data);
  }

  /**
   * Approve candidate nomination
   * @param {string} id 
   * @returns {Promise<Object>}
   */
  async approveCandidate(id) {
    return this.updateCandidate(id, {
      approvalStatus: 'APPROVED',
      nominationStatus: 'APPROVED',
      status: 'APPROVED',
    });
  }

  /**
   * Reject candidate nomination
   * @param {string} id 
   * @returns {Promise<Object>}
   */
  async rejectCandidate(id) {
    return this.updateCandidate(id, {
      approvalStatus: 'REJECTED',
      nominationStatus: 'REJECTED',
      status: 'REJECTED',
    });
  }

  /**
   * Delete candidate record
   * @param {string} id 
   * @returns {Promise<Object>}
   */
  async deleteCandidate(id) {
    return prisma.candidate.delete({
      where: { id },
    });
  }

  // Alias for backward compatibility
  async delete(id) {
    return this.deleteCandidate(id);
  }
}

export const candidateRepository = new CandidateRepository();
export default candidateRepository;
