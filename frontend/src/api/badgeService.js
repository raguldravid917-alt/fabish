/**
 * Badge service.
 * Handles fetching product badges from backend.
 */
import { api } from './client';
import { ENDPOINTS } from './endpoints';

export const badgeService = {
  /**
   * Get all badges.
   * @returns {Promise<{ success, data, message }>}
   */
  getAll: () => api.get(ENDPOINTS.BADGES),
};
