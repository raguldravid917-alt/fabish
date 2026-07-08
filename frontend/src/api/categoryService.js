/**
 * Category service.
 * Replaces raw fetch() in AdminDashboard.jsx.
 */
import { api } from './client';
import { ENDPOINTS } from './endpoints';

export const categoryService = {
  /**
   * Get all categories.
   * @returns {Promise<{ success, data, message }>}
   */
  getAll: () =>
    api.get(ENDPOINTS.CATEGORIES),

  /**
   * Create a new category (admin only).
   * @param {FormData} formData
   * @returns {Promise<{ success, data, message }>}
   */
  create: (formData) =>
    api.post(ENDPOINTS.CATEGORIES, formData, { auth: true }),

  /**
   * Update an existing category (admin only).
   * @param {string} id
   * @param {FormData} formData
   * @returns {Promise<{ success, data, message }>}
   */
  update: (id, formData) =>
    api.put(`${ENDPOINTS.CATEGORIES}/${id}`, formData, { auth: true }),

  /**
   * Delete a category (admin only).
   * @param {string} id
   * @returns {Promise<{ success, data, message }>}
   */
  delete: (id) =>
    api.delete(`${ENDPOINTS.CATEGORIES}/${id}`, { auth: true }),
};
