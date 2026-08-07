import api from '../api/axios';

export const candidateService = {
  /**
   * Get candidates (Public: APPROVED candidates; Admin/Authenticated: all nomination statuses)
   * @param {{ electionId?: string, positionId?: string, status?: string, search?: string, page?: number, limit?: number }} params
   */
  async getAllCandidates(params = {}) {
    const response = await api.get('/candidates', { params });
    return response.data;
  },

  /**
   * Get single candidate details by ID
   * @param {string} id
   */
  async getCandidateById(id) {
    const response = await api.get(`/candidates/${id}`);
    return response.data;
  },

  /**
   * Nominate / apply for a candidate position
   * @param {Object|FormData} payload
   */
  async createCandidate(payload) {
    const headers = payload instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {};
    const response = await api.post('/candidates', payload, { headers });
    return response.data;
  },

  /**
   * Update candidate details / manifesto / photo
   * @param {string} id
   * @param {Object|FormData} payload
   */
  async updateCandidate(id, payload) {
    const headers = payload instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {};
    const response = await api.put(`/candidates/${id}`, payload, { headers });
    return response.data;
  },

  /**
   * Approve candidate nomination (ADMIN)
   * @param {string} id
   */
  async approveCandidate(id) {
    const response = await api.patch(`/candidates/${id}/approve`);
    return response.data;
  },

  /**
   * Reject candidate nomination (ADMIN)
   * @param {string} id
   */
  async rejectCandidate(id) {
    const response = await api.patch(`/candidates/${id}/reject`);
    return response.data;
  },

  /**
   * Withdraw candidate nomination (Candidate owner)
   * @param {string} id
   */
  async withdrawCandidate(id) {
    const response = await api.patch(`/candidates/${id}/withdraw`);
    return response.data;
  },

  /**
   * Delete candidate nomination
   * @param {string} id
   */
  async deleteCandidate(id) {
    const response = await api.delete(`/candidates/${id}`);
    return response.data;
  }
};

export default candidateService;
