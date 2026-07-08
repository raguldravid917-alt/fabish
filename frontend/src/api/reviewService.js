/**
 * Review service.
 * Replaces raw fetch() calls in ProductDetail.jsx.
 */
import { api } from './client';
import { ENDPOINTS } from './endpoints';

export const reviewService = {
  /**
   * Get all reviews for a product.
   * @param {string} productId
   * @returns {Promise<{ success, data, message }>}
   */
  getByProduct: (productId) =>
    api.get(ENDPOINTS.REVIEWS_BY_PRODUCT(productId)),

  /**
   * Submit a new review.
   * @param {object} reviewData - { rating, comment, productId }
   * @returns {Promise<{ success, data, message }>}
   */
  create: (reviewData) =>
    api.post(ENDPOINTS.REVIEWS, reviewData, { auth: true }),
};
