import { api } from './client';

export const couponService = {
  /**
   * Get all active public coupons/promotions.
   * @returns {Promise<{ success, data, message }>}
   */
  getPublicCoupons: () =>
    api.get('/coupons/public', { auth: false }),
};
