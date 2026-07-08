/**
 * User admin service.
 * Replaces raw fetch() calls for user management in AdminDashboard.
 */
import { api } from './client';
import { ENDPOINTS } from './endpoints';

export const userService = {
  /**
   * Get all users (admin only).
   * @returns {Promise<{ success, data, message }>}
   */
  getAll: () =>
    api.get(ENDPOINTS.USERS, { auth: true }),

  /**
   * Delete a user (admin only).
   * @param {string} id - User ID
   * @returns {Promise<{ success, data, message }>}
   */
  delete: (id) =>
    api.delete(ENDPOINTS.USER_BY_ID(id), { auth: true }),
};
