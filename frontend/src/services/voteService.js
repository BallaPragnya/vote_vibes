import api from '../api/axios';

export const voteService = {
  /**
   * Cast a vote for a candidate in an active election
   * @param {{ electionId: string, candidateId: string, positionId?: string }} payload
   */
  async castVote(payload) {
    const response = await api.post('/votes', payload);
    return response.data;
  },

  /**
   * Check if current user has voted in an election
   * @param {string} electionId
   */
  async getVoterStatus(electionId) {
    const response = await api.get(`/votes/status/${electionId}`);
    return response.data;
  },

  /**
   * Retrieve vote receipt by receipt ID or code
   * @param {string} receiptId
   */
  async getVoteReceipt(receiptId) {
    const response = await api.get(`/votes/receipt/${receiptId}`);
    return response.data;
  },

  /**
   * Verify vote on blockchain ledger using receipt code
   * @param {string} receiptCode
   */
  async verifyVote(receiptCode) {
    const response = await api.get(`/votes/verify/${receiptCode}`);
    return response.data;
  },

  /**
   * View election results (Public when COMPLETED, Admin when ACTIVE)
   * @param {string} electionId
   */
  async getResults(electionId) {
    const response = await api.get(`/votes/results/${electionId}`);
    return response.data;
  },

  /**
   * Audit votes & blockchain ledger for an election (ADMIN)
   * @param {string} electionId
   */
  async auditVotes(electionId) {
    const response = await api.get(`/votes/audit/${electionId}`);
    return response.data;
  }
};

export default voteService;
