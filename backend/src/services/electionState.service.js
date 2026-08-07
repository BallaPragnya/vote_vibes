/**
 * Election State Service
 * 
 * Reusable helper functions to compute and manage dynamic election statuses
 * based on the current time and election start/end dates.
 */

/**
 * Determine dynamic election status based on current time and start/end dates.
 * 
 * Rules:
 * - If status is 'ARCHIVED' or 'CANCELLED', manual override is preserved.
 * - If status is 'DRAFT', status remains 'DRAFT' until published.
 * - If currentTime < startDate => UPCOMING
 * - If currentTime >= startDate AND currentTime <= endDate => ACTIVE
 * - If currentTime > endDate => COMPLETED
 * 
 * @param {Object} election - { startTime, startDate, endTime, endDate, status }
 * @param {Date|number|string} [now=new Date()] - Optional reference time for testing
 * @returns {string} - Computed status ('DRAFT' | 'UPCOMING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'ARCHIVED')
 */
export const calculateElectionStatus = (election, now = new Date()) => {
  if (!election) {
    return 'DRAFT';
  }

  const currentStatus = election.status;

  // Preserve manual override states
  if (currentStatus === 'ARCHIVED' || currentStatus === 'CANCELLED' || currentStatus === 'DRAFT') {
    return currentStatus;
  }

  const startInput = election.startTime || election.startDate;
  const endInput = election.endTime || election.endDate;

  if (!startInput || !endInput) {
    return currentStatus || 'DRAFT';
  }

  const startDate = new Date(startInput);
  const endDate = new Date(endInput);
  const currentTime = new Date(now);

  if (currentTime < startDate) {
    return 'UPCOMING';
  }

  if (currentTime >= startDate && currentTime <= endDate) {
    return 'ACTIVE';
  }

  if (currentTime > endDate) {
    return 'COMPLETED';
  }

  return currentStatus;
};

/**
 * Enrich an election object (or array of elections) with dynamic computed status
 * @param {Object|Array} elections 
 * @param {Date|number|string} [now=new Date()] 
 * @returns {Object|Array}
 */
export const enrichWithComputedStatus = (elections, now = new Date()) => {
  if (!elections) return elections;

  if (Array.isArray(elections)) {
    return elections.map((el) => enrichSingleElection(el, now));
  }

  return enrichSingleElection(elections, now);
};

const enrichSingleElection = (election, now) => {
  if (!election || typeof election !== 'object') return election;

  const computedStatus = calculateElectionStatus(election, now);
  return {
    ...election,
    computedStatus,
    // If not DRAFT, CANCELLED, or ARCHIVED, keep status dynamically in sync
    status: ['DRAFT', 'CANCELLED', 'ARCHIVED'].includes(election.status)
      ? election.status
      : computedStatus,
  };
};

export default {
  calculateElectionStatus,
  enrichWithComputedStatus,
};
