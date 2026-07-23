import { api } from './client';

export const recentlyViewedService = {
  /**
   * Record product view for logged-in user.
   * @param {string} productId
   * @returns {Promise<{ success, data }>}
   */
  recordView: (productId) =>
    api.post('/recently-viewed', { productId }, { auth: true }),

  /**
   * Get user's recently viewed products.
   * @returns {Promise<{ success, data }>}
   */
  getRecentlyViewed: () =>
    api.get('/recently-viewed', { auth: true }),

  /**
   * Clear browsing history.
   * @returns {Promise<{ success, message }>}
   */
  clearHistory: () =>
    api.delete('/recently-viewed', { auth: true }),
};
