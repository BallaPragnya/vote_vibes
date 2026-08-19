import AppError from '../utils/AppError.js';
import defaultElectionRepository from '../repositories/election.repository.js';
import { calculateElectionStatus, enrichWithComputedStatus } from './electionState.service.js';

export class ElectionService {
  /**
   * @param {Object} [electionRepo] 
   */
  constructor(electionRepo = defaultElectionRepository) {
    this.electionRepository = electionRepo;
  }

  /**
   * Helper to execute findById on repository regardless of method name
   * @param {string} id 
   * @returns {Promise<Object|null>}
   */
  async _findRepoElection(id) {
    if (typeof this.electionRepository.getElectionById === 'function') {
      return this.electionRepository.getElectionById(id);
    }
    if (typeof this.electionRepository.findById === 'function') {
      return this.electionRepository.findById(id);
    }
    return null;
  }

  /**
   * Helper to execute create on repository regardless of method name
   * @param {Object} data 
   * @returns {Promise<Object>}
   */
  async _createRepoElection(data) {
    if (typeof this.electionRepository.createElection === 'function') {
      return this.electionRepository.createElection(data);
    }
    if (typeof this.electionRepository.create === 'function') {
      return this.electionRepository.create(data);
    }
    throw new AppError('Repository create method not found.', 500);
  }

  /**
   * Helper to execute update on repository regardless of method name
   * @param {string} id 
   * @param {Object} data 
   * @returns {Promise<Object>}
   */
  async _updateRepoElection(id, data) {
    if (typeof this.electionRepository.updateElection === 'function') {
      return this.electionRepository.updateElection(id, data);
    }
    if (typeof this.electionRepository.update === 'function') {
      return this.electionRepository.update(id, data);
    }
    throw new AppError('Repository update method not found.', 500);
  }

  /**
   * Create a new election
   * Business Rules:
   * - Validate start date and end date
   * - End date must be strictly after start date
   * - Calls electionRepository.createElection / create
   * @param {Object} payload 
   * @returns {Promise<Object>}
   */
  async createElection({
    title,
    description,
    startTime,
    startDate: rawStartDate,
    endTime,
    endDate: rawEndDate,
    isDepartmentRestricted = false,
    departmentIds = [],
    createdById,
  }) {
    const startInput = startTime || rawStartDate;
    const endInput = endTime || rawEndDate;

    const startDate = new Date(startInput);
    const endDate = new Date(endInput);

    if (isNaN(startDate.getTime())) {
      throw new AppError('Invalid start date.', 400, 'ValidationError');
    }

    if (isNaN(endDate.getTime())) {
      throw new AppError('Invalid end date.', 400, 'ValidationError');
    }

    if (endDate <= startDate) {
      throw new AppError('End date must be strictly after start date.', 400, 'ValidationError');
    }

    const newElection = await this._createRepoElection({
      title,
      description,
      startTime: startDate,
      endTime: endDate,
      status: 'DRAFT',
      isDepartmentRestricted,
      createdById,
      departmentIds,
    });

    return enrichWithComputedStatus(newElection);
  }

  /**
   * Get single election by ID with dynamically computed status
   * Business Rules:
   * - Calls electionRepository.getElectionById / findById
   * - Dynamically calculates status using ElectionStateService
   * - Throws 404 NotFoundError if election does not exist
   * @param {string} id 
   * @returns {Promise<Object>}
   */
  async getElection(id) {
    if (!id) {
      throw new AppError('Election ID is required.', 400, 'ValidationError');
    }

    const election = await this._findRepoElection(id);
    if (!election) {
      throw new AppError('Election not found.', 404, 'NotFoundError');
    }

    const enriched = enrichWithComputedStatus(election);

    // If dynamic status changed from DB status (and isn't manual override DRAFT/CANCELLED/ARCHIVED), sync DB
    if (enriched.status !== election.status && !['DRAFT', 'CANCELLED', 'ARCHIVED'].includes(election.status)) {
      try {
        await this._updateRepoElection(id, { status: enriched.status });
      } catch (err) {
        // Sync warning - non-blocking
      }
    }

    return enriched;
  }

  // Alias for backward compatibility
  async getElectionById(id) {
    return this.getElection(id);
  }

  /**
   * Retrieve list of elections matching search/filter/pagination/sorting parameters
   * Business Rules:
   * - Calls electionRepository.getAllElections / findAll
   * - Enriches all election records with dynamic computed status
   * @param {Object} options 
   * @returns {Promise<Object>}
   */
  async getAllElections(options = {}) {
    let result;
    if (typeof this.electionRepository.getAllElections === 'function') {
      result = await this.electionRepository.getAllElections(options);
    } else {
      result = await this.electionRepository.findAll(options);
    }

    if (result) {
      if (Array.isArray(result.data)) {
        result.data = enrichWithComputedStatus(result.data);
      }
      if (Array.isArray(result.elections)) {
        result.elections = enrichWithComputedStatus(result.elections);
      }
    }

    return result;
  }

  // Alias for backward compatibility
  async getElections(options = {}) {
    return this.getAllElections(options);
  }

  /**
   * Update election properties
   * Business Rules:
   * - Verifies election existence via getElection(id)
   * - Only elections in DRAFT status can be modified
   * - If updating dates, validates endDate > startDate
   * - Calls electionRepository.updateElection / update
   * @param {string} id 
   * @param {Object} updateData 
   * @returns {Promise<Object>}
   */
  async updateElection(id, updateData) {
    const election = await this.getElection(id);

    // Business Rule: Prevent modification of non-DRAFT elections
    if (election.status !== 'DRAFT') {
      throw new AppError(
        `Cannot edit an election that is already in '${election.status}' status. Only DRAFT elections can be modified.`,
        400,
        'InvalidStateError'
      );
    }

    // Business Rule: Validate dates if provided in update payload
    const startInput = updateData.startTime || updateData.startDate || election.startTime;
    const endInput = updateData.endTime || updateData.endDate || election.endTime;

    if (startInput && endInput) {
      const startDate = new Date(startInput);
      const endDate = new Date(endInput);

      if (endDate <= startDate) {
        throw new AppError('End date must be strictly after start date.', 400, 'ValidationError');
      }
    }

    const updatedElection = await this._updateRepoElection(id, updateData);
    return enrichWithComputedStatus(updatedElection);
  }

  /**
   * Transition election status through allowed lifecycle paths
   * Business Rules:
   * - Validates state transition paths
   * - ARCHIVED can only be assigned manually by administrator action
   * @param {string} id 
   * @param {string} newStatus 
   * @returns {Promise<Object>}
   */
  async changeElectionStatus(id, newStatus) {
    const election = await this.getElection(id);
    const currentStatus = election.status;

    const allowedTransitions = {
      DRAFT: ['UPCOMING', 'ACTIVE', 'CANCELLED', 'ARCHIVED'],
      UPCOMING: ['ACTIVE', 'CANCELLED', 'ARCHIVED'],
      ACTIVE: ['COMPLETED', 'CANCELLED', 'ARCHIVED'],
      COMPLETED: ['ARCHIVED'],
      CANCELLED: ['ARCHIVED'],
      ARCHIVED: [],
    };

    const validNextStates = allowedTransitions[currentStatus] || [];
    if (!validNextStates.includes(newStatus)) {
      throw new AppError(
        `Cannot transition election from '${currentStatus}' to '${newStatus}'.`,
        400,
        'InvalidStatusTransitionError'
      );
    }

    const updatePayload = { status: newStatus };
    if (newStatus === 'ACTIVE') {
      const now = new Date();
      const currentStart = new Date(election.startTime || election.startDate || now);
      if (currentStart > now) {
        updatePayload.startTime = now;
      }
    }

    const updatedElection = await this._updateRepoElection(id, updatePayload);
    return enrichWithComputedStatus(updatedElection);
  }

  /**
   * Delete an election
   * Business Rules:
   * - Verifies election existence via getElection(id)
   * - Only elections in DRAFT or CANCELLED status can be deleted
   * - Calls electionRepository.deleteElection / delete
   * @param {string} id 
   * @returns {Promise<Object>}
   */
  async deleteElection(id) {
    const election = await this.getElection(id);

    // Business Rule: Prevent deletion of ACTIVE/UPCOMING/COMPLETED/ARCHIVED elections
    if (!['DRAFT', 'CANCELLED'].includes(election.status)) {
      throw new AppError(
        `Cannot delete an election in '${election.status}' status.`,
        400,
        'InvalidStateError'
      );
    }

    if (typeof this.electionRepository.deleteElection === 'function') {
      return this.electionRepository.deleteElection(id);
    }
    return this.electionRepository.delete(id);
  }
}

export const electionService = new ElectionService();
export default electionService;
