/**
 * Pagination Utility Functions
 */

/**
 * Parse and validate page and limit query parameters
 * @param {Object} query - { page, limit }
 * @param {number} [defaultLimit=10] 
 * @param {number} [maxLimit=100] 
 * @returns {Object} - { page, limit, skip, take }
 */
export const getPaginationParams = ({ page, limit } = {}, defaultLimit = 10, maxLimit = 100) => {
  const parsedPage = Math.max(1, parseInt(page, 10) || 1);
  const parsedLimit = Math.max(1, Math.min(maxLimit, parseInt(limit, 10) || defaultLimit));
  const skip = (parsedPage - 1) * parsedLimit;

  return {
    page: parsedPage,
    limit: parsedLimit,
    skip,
    take: parsedLimit,
  };
};

/**
 * Format paginated data response
 * @param {Array} items 
 * @param {number} total 
 * @param {number} page 
 * @param {number} limit 
 * @returns {Object} - { data, page, limit, total, totalPages }
 */
export const formatPaginatedResponse = (items = [], total = 0, page = 1, limit = 10) => {
  const p = Number(page);
  const l = Number(limit);
  const t = Number(total);

  return {
    data: items,
    page: p,
    limit: l,
    total: t,
    totalPages: Math.ceil(t / l) || 1,
  };
};

export default {
  getPaginationParams,
  formatPaginatedResponse,
};
