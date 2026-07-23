import { api } from './client';

export const rewardService = {
  /**
   * Get user's rewards balance & transactions history.
   * @returns {Promise<{ success, data: { points, tier, transactions } }>}
   */
  getRewards: () =>
    api.get('/rewards', { auth: true }),
};
