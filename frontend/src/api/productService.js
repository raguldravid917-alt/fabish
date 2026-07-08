/**
 * Product service.
 * Replaces raw fetch() calls in ProductDetail, AdminDashboard, ProductListing.
 */
import { api } from './client';
import { ENDPOINTS } from './endpoints';

export const productService = {
  /**
   * Get all products with optional query params.
   * @param {object} [params] - Query parameters (limit, category, page, etc.)
   * @returns {Promise<{ success, data, message }>}
   */
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString
      ? `${ENDPOINTS.PRODUCTS}?${queryString}`
      : ENDPOINTS.PRODUCTS;
    return api.get(endpoint);
  },

  /**
   * Get a single product by its URL slug.
   * @param {string} slug
   * @returns {Promise<{ success, data, message }>}
   */
  getBySlug: (slug) =>
    api.get(ENDPOINTS.PRODUCT_BY_SLUG(slug)),

  /**
   * Create a new product (admin only).
   * @param {object} productData
   * @returns {Promise<{ success, data, message }>}
   */
  create: (productData) =>
    api.post(ENDPOINTS.PRODUCTS, productData, { auth: true }),

  /**
   * Update an existing product (admin only).
   * @param {string} id - Product ID
   * @param {object} productData
   * @returns {Promise<{ success, data, message }>}
   */
  update: (id, productData) =>
    api.put(ENDPOINTS.PRODUCT_BY_ID(id), productData, { auth: true }),

  /**
   * Delete a product (admin only).
   * @param {string} id - Product ID
   * @returns {Promise<{ success, data, message }>}
   */
  delete: (id) =>
    api.delete(ENDPOINTS.PRODUCT_BY_ID(id), { auth: true }),
};
