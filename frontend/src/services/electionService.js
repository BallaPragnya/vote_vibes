import api from '../api/axios';

export const electionService = {
  /**
   * Fetch all elections matching search, status filter, and pagination
   * @param {{ search?: string, status?: string, page?: number, limit?: number, sort?: string }} params
   */
  async getAllElections(params = {}) {
    const response = await api.get('/elections', { params });
    return response.data;
  },

  /**
   * Fetch single election details by ID
   * @param {string} id
   */
  async getElectionById(id) {
    const response = await api.get(`/elections/${id}`);
    return response.data;
  },

  /**
   * Create a new election
   * @param {{ title: string, description?: string, startDate: string, endDate: string, isDepartmentRestricted?: boolean, departmentIds?: string[] }} data
   */
  async createElection(data) {
    const response = await api.post('/elections', data);
    return response.data;
  },

  /**
   * Update an existing election (DRAFT status elections only)
   * @param {string} id
   * @param {{ title?: string, description?: string, startDate?: string, endDate?: string, isDepartmentRestricted?: boolean }} data
   */
  async updateElection(id, data) {
    const response = await api.put(`/elections/${id}`, data);
    return response.data;
  },

  /**
   * Transition election status
   * @param {string} id
   * @param {string} status - DRAFT | UPCOMING | ACTIVE | COMPLETED | CANCELLED | ARCHIVED
   */
  async changeStatus(id, status) {
    const response = await api.patch(`/elections/${id}/status`, { status });
    return response.data;
  },

  /**
   * Alias for changeStatus
   */
  async updateElectionStatus(id, status) {
    return this.changeStatus(id, status);
  },

  /**
   * Delete an election (DRAFT or CANCELLED status only)
   * @param {string} id
   */
  async deleteElection(id) {
    const response = await api.delete(`/elections/${id}`);
    return response.data;
  }
};

export default electionService;
