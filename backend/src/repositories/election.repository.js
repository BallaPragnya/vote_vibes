import prisma from '../config/prisma.js';
import { getPaginationParams, formatPaginatedResponse } from '../utils/pagination.js';

export class ElectionRepository {
  /**
   * Create a new election record along with optional department restrictions
   * @param {Object} data - { title, description, startTime, startDate, endTime, endDate, status, isDepartmentRestricted, createdById, departmentIds }
   * @returns {Promise<Object>}
   */
  async createElection({
    title,
    description,
    startTime,
    startDate,
    endTime,
    endDate,
    status = 'DRAFT',
    isDepartmentRestricted = false,
    createdById,
    departmentIds = [],
  }) {
    const start = startTime || startDate;
    const end = endTime || endDate;

    return prisma.election.create({
      data: {
        title: title.trim(),
        description: description ? description.trim() : null,
        startTime: new Date(start),
        endTime: new Date(end),
        status,
        isDepartmentRestricted,
        createdById,
        departments: isDepartmentRestricted && departmentIds.length > 0
          ? {
              create: departmentIds.map((depId) => ({
                departmentId: depId,
              })),
            }
          : undefined,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        departments: {
          include: {
            department: true,
          },
        },
        positions: true,
      },
    });
  }

  // Alias for backward compatibility
  async create(data) {
    return this.createElection(data);
  }

  /**
   * Find an election by ID including relations
   * @param {string} id 
   * @returns {Promise<Object|null>}
   */
  async getElectionById(id) {
    return prisma.election.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        departments: {
          include: {
            department: true,
          },
        },
        positions: {
          include: {
            candidates: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  // Alias for backward compatibility
  async findById(id) {
    return this.getElectionById(id);
  }

  /**
   * Find all elections matching filters, search criteria, pagination, and sorting
   * Excludes soft-deleted (ARCHIVED) elections by default unless explicitly requested.
   * @param {Object} options - { search, status, isDepartmentRestricted, createdById, departmentId, page, limit, sort, sortBy, sortOrder }
   * @returns {Promise<Object>} - { data, elections, page, limit, total, totalPages }
   */
  async getAllElections({
    search,
    status,
    isDepartmentRestricted,
    createdById,
    departmentId,
    page = 1,
    limit = 10,
    sort,
    sortBy,
    sortOrder,
  } = {}) {
    const where = {};
    const andConditions = [];

    // 1. Filtering by election status (UPCOMING, ACTIVE, COMPLETED, ARCHIVED, DRAFT, CANCELLED)
    if (status && typeof status === 'string' && status.trim() !== '') {
      const upperStatus = status.trim().toUpperCase();
      const now = new Date();

      if (upperStatus === 'UPCOMING') {
        andConditions.push({
          OR: [
            { status: 'UPCOMING' },
            {
              status: { notIn: ['DRAFT', 'CANCELLED', 'ARCHIVED'] },
              startTime: { gt: now },
            },
          ],
        });
      } else if (upperStatus === 'ACTIVE') {
        andConditions.push({
          OR: [
            { status: 'ACTIVE' },
            {
              status: { notIn: ['DRAFT', 'CANCELLED', 'ARCHIVED'] },
              startTime: { lte: now },
              endTime: { gte: now },
            },
          ],
        });
      } else if (upperStatus === 'COMPLETED') {
        andConditions.push({
          OR: [
            { status: 'COMPLETED' },
            {
              status: { notIn: ['DRAFT', 'CANCELLED', 'ARCHIVED'] },
              endTime: { lt: now },
            },
          ],
        });
      } else {
        andConditions.push({ status: upperStatus });
      }
    } else {
      // Soft-delete rule: exclude ARCHIVED elections by default from normal list queries
      andConditions.push({
        status: {
          not: 'ARCHIVED',
        },
      });
    }

    // 2. Filtering by department restriction boolean
    if (typeof isDepartmentRestricted === 'boolean') {
      where.isDepartmentRestricted = isDepartmentRestricted;
    } else if (isDepartmentRestricted === 'true' || isDepartmentRestricted === 'false') {
      where.isDepartmentRestricted = isDepartmentRestricted === 'true';
    }

    // 3. Filtering by creator ID
    if (createdById) {
      where.createdById = createdById;
    }

    // 4. Filtering by specific department restriction relation
    if (departmentId) {
      where.departments = {
        some: {
          departmentId,
        },
      };
    }

    // 5. Search by title or description (case-insensitive)
    if (search && typeof search === 'string' && search.trim() !== '') {
      const searchTerm = search.trim();
      andConditions.push({
        OR: [
          { title: { contains: searchTerm, mode: 'insensitive' } },
          { description: { contains: searchTerm, mode: 'insensitive' } },
        ],
      });
    }

    if (andConditions.length > 0) {
      where.AND = andConditions;
    }

    // 6. Pagination parameters via pagination utility
    const { page: parsedPage, limit: parsedLimit, skip, take } = getPaginationParams({ page, limit });

    // 7. Sorting parameters (sort=latest, sort=oldest, sort=startDate, sort=endDate)
    let orderByObject = { createdAt: 'desc' };

    if (sort && typeof sort === 'string') {
      const normalizedSort = sort.trim();
      switch (normalizedSort) {
        case 'latest':
          orderByObject = { createdAt: 'desc' };
          break;
        case 'oldest':
          orderByObject = { createdAt: 'asc' };
          break;
        case 'startDate':
          orderByObject = { startTime: 'asc' };
          break;
        case 'endDate':
          orderByObject = { endTime: 'asc' };
          break;
        case 'title':
          orderByObject = { title: 'asc' };
          break;
        default: {
          const validSortFields = ['createdAt', 'updatedAt', 'title', 'startTime', 'endTime', 'status'];
          const field = validSortFields.includes(normalizedSort) ? normalizedSort : 'createdAt';
          const dir = String(sortOrder).toLowerCase() === 'asc' ? 'asc' : 'desc';
          orderByObject = { [field]: dir };
          break;
        }
      }
    } else if (sortBy) {
      const validSortFields = ['createdAt', 'updatedAt', 'title', 'startTime', 'endTime', 'status'];
      const field = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
      const dir = String(sortOrder).toLowerCase() === 'asc' ? 'asc' : 'desc';
      orderByObject = { [field]: dir };
    }

    const [elections, total] = await Promise.all([
      prisma.election.findMany({
        where,
        skip,
        take,
        orderBy: orderByObject,
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          departments: {
            include: {
              department: true,
            },
          },
        },
      }),
      prisma.election.count({ where }),
    ]);

    const formatted = formatPaginatedResponse(elections, total, parsedPage, parsedLimit);

    return {
      ...formatted,
      elections: formatted.data,
    };
  }

  // Alias for backward compatibility
  async findAll(options) {
    return this.getAllElections(options);
  }

  /**
   * Update an existing election record
   * @param {string} id 
   * @param {Object} data 
   * @returns {Promise<Object>}
   */
  async updateElection(id, data) {
    const updatePayload = {};
    if (data.title !== undefined) updatePayload.title = data.title.trim();
    if (data.description !== undefined) updatePayload.description = data.description ? data.description.trim() : null;

    const start = data.startTime || data.startDate;
    if (start !== undefined) updatePayload.startTime = new Date(start);

    const end = data.endTime || data.endDate;
    if (end !== undefined) updatePayload.endTime = new Date(end);

    if (data.status !== undefined) updatePayload.status = data.status;
    if (data.isDepartmentRestricted !== undefined) updatePayload.isDepartmentRestricted = data.isDepartmentRestricted;

    return prisma.election.update({
      where: { id },
      data: updatePayload,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        departments: {
          include: {
            department: true,
          },
        },
        positions: true,
      },
    });
  }

  // Alias for backward compatibility
  async update(id, data) {
    return this.updateElection(id, data);
  }

  /**
   * Soft-delete an election record by marking its status as ARCHIVED.
   * Preserves database integrity and relations while hiding record from normal queries.
   * @param {string} id 
   * @returns {Promise<Object>}
   */
  async deleteElection(id) {
    return prisma.election.update({
      where: { id },
      data: {
        status: 'ARCHIVED',
      },
    });
  }

  // Alias for backward compatibility
  async delete(id) {
    return this.deleteElection(id);
  }
}

export const electionRepository = new ElectionRepository();
export default electionRepository;
