/**
 * Result Calculator Utility
 * 
 * Pure functions to aggregate election tallies, calculate percentages,
 * determine winning candidate(s), detect ties, and handle zero vote scenarios.
 */

/**
 * Calculate results for a single election position
 * 
 * @param {Object} position - Position object containing candidates array [{ id, fullName, profileImage, photoUrl, user }]
 * @param {Map<string, number>|Object} voteMap - Map or object with key `${positionId}:${candidateId}` -> voteCount
 * @returns {Object} Calculated position result object
 */
export const calculatePositionResults = (position, voteMap = new Map()) => {
  if (!position) {
    return {
      positionId: null,
      positionTitle: 'Unknown Position',
      candidates: [],
      winners: [],
      isTie: false,
      winningStatus: 'NO_CANDIDATES',
      totalVotesCast: 0,
    };
  }

  const getVoteCount = (candId) => {
    const key = `${position.id}:${candId}`;
    if (voteMap instanceof Map) {
      return voteMap.get(key) || voteMap.get(candId) || 0;
    }
    if (typeof voteMap === 'object' && voteMap !== null) {
      return voteMap[key] || voteMap[candId] || 0;
    }
    return 0;
  };

  const rawCandidates = Array.isArray(position.candidates) ? position.candidates : [];

  // Calculate total votes cast for this position
  let totalVotesCast = 0;
  const candidateTallies = rawCandidates.map((cand) => {
    const count = getVoteCount(cand.id);
    totalVotesCast += count;
    return {
      id: cand.id,
      fullName: cand.fullName || cand.name || cand.user?.name || 'Unknown Candidate',
      profileImage: cand.profileImage || cand.photoUrl || null,
      voteCount: count,
      percentage: 0, // Computed after total is summed
    };
  });

  // Calculate percentage per candidate
  candidateTallies.forEach((cand) => {
    cand.percentage = totalVotesCast > 0 
      ? Number(((cand.voteCount / totalVotesCast) * 100).toFixed(2)) 
      : 0;
  });

  // Sort candidates by vote count descending, then candidate name ascending
  candidateTallies.sort((a, b) => {
    if (b.voteCount !== a.voteCount) {
      return b.voteCount - a.voteCount;
    }
    return a.fullName.localeCompare(b.fullName);
  });

  // Handle Edge Cases: No candidates, Zero Votes, Tied Winners, Single Winner
  if (candidateTallies.length === 0) {
    return {
      positionId: position.id,
      positionTitle: position.title,
      candidates: [],
      winners: [],
      isTie: false,
      winningStatus: 'NO_CANDIDATES',
      totalVotesCast: 0,
    };
  }

  if (totalVotesCast === 0) {
    return {
      positionId: position.id,
      positionTitle: position.title,
      candidates: candidateTallies,
      winners: [],
      isTie: false,
      winningStatus: 'NO_VOTES',
      totalVotesCast: 0,
    };
  }

  const topVoteCount = candidateTallies[0].voteCount;
  const winners = candidateTallies.filter((c) => c.voteCount === topVoteCount);
  const isTie = winners.length > 1;
  const winningStatus = isTie ? 'TIE' : 'SINGLE_WINNER';

  return {
    positionId: position.id,
    positionTitle: position.title,
    candidates: candidateTallies,
    winners,
    isTie,
    winningStatus,
    totalVotesCast,
  };
};

/**
 * Summarize entire election results across all positions
 * 
 * @param {Object} election - Election record object
 * @param {Array<Object>} positionResults - Array of calculated position results
 * @returns {Object} Summarized election results object
 */
export const summarizeElectionResults = (election, positionResults = []) => {
  const totalVotesCast = positionResults.reduce((sum, pos) => sum + (pos.totalVotesCast || 0), 0);
  const totalPositions = positionResults.length;
  const totalCandidates = positionResults.reduce((sum, pos) => sum + (pos.candidates ? pos.candidates.length : 0), 0);

  const hasTies = positionResults.some((pos) => pos.isTie);
  const hasNoVotes = totalVotesCast === 0;

  return {
    electionId: election?.id || null,
    electionTitle: election?.title || 'Election Results',
    status: election?.status || 'COMPLETED',
    startTime: election?.startTime || null,
    endTime: election?.endTime || null,
    summaryMetrics: {
      totalVotesCast,
      totalPositions,
      totalCandidates,
      hasTies,
      hasNoVotes,
    },
    positionResults,
  };
};

export default {
  calculatePositionResults,
  summarizeElectionResults,
};
