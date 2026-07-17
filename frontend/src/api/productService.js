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
   * Get a single product by its ID.
   * @param {string} id
   * @returns {Promise<{ success, data, message }>}
   */
  getById: (id) =>
    api.get(ENDPOINTS.PRODUCT_BY_ID(id)),

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

  /**
   * Check if product name already exists (admin only).
   * @param {string} title
   * @param {string} [excludeId]
   * @returns {Promise<{ success, data, message }>}
   */
  checkName: (title, excludeId) => {
    const params = { title };
    if (excludeId) params.excludeId = excludeId;
    const queryString = new URLSearchParams(params).toString();
    return api.get(`${ENDPOINTS.PRODUCTS}/check-name?${queryString}`);
  },

  /**
   * Get dynamic content and configurations for a product.
   * @param {string} productId
   * @returns {Promise<{ success, data, message }>}
   */
  getContent: (productId) =>
    api.get(`${ENDPOINTS.PRODUCTS}/${productId}/content`),

  /**
   * Update dynamic content and configurations for a product (admin only).
   * @param {string} productId
   * @param {object} contentData
   * @returns {Promise<{ success, data, message }>}
   */
  updateContent: (productId, contentData) =>
    api.put(`${ENDPOINTS.PRODUCTS}/${productId}/content`, contentData, { auth: true }),

  /**
   * Get related products with smart category/subcategory/latest fallback.
   * @param {string} id - Product ID (not slug)
   * @param {number} [limit=8]
   * @returns {Promise<{ success, data, message }>}
   */
  getRelated: (id, limit = 8) =>
    api.get(`${ENDPOINTS.PRODUCTS}/${id}/related?limit=${limit}`),

  /**
   * Get all available product statuses.
   * @returns {Promise<{ success, data, message }>}
   */
  getStatuses: () =>
    api.get(`${ENDPOINTS.PRODUCTS}/statuses`),
};

