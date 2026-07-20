import { api } from './client';
import { ENDPOINTS } from './endpoints';

export const partnerService = {
  /**
   * Get all partnership types with dynamic form field schemas (public).
   */
  getTypes: () =>
    api.get(ENDPOINTS.PARTNERSHIP_TYPES),

  /**
   * Submit a partnership application (public).
   * @param {object} data
   */
  apply: (data) =>
    api.post(ENDPOINTS.PARTNERSHIP_APPLY, data),

  // ── Admin methods ─────────────────────────────────────────────────

  /**
   * Admin: Get all applications with filters.
   * @param {{ page?, limit?, status?, type?, search? }} params
   */
  adminGetAll: (params = {}) =>
    api.get(ENDPOINTS.PARTNERSHIPS, { params }),

  /**
   * Admin: Get single application by ID.
   * @param {string} id
   */
  adminGetById: (id) =>
    api.get(ENDPOINTS.PARTNERSHIP_BY_ID(id)),

  /**
   * Admin: Update application status and notes.
   * @param {string} id
   * @param {{ status, adminNotes }} data
   */
  adminUpdateStatus: (id, data) =>
    api.put(ENDPOINTS.PARTNERSHIP_STATUS(id), data),

  /**
   * Admin: Delete an application.
   * @param {string} id
   */
  adminDelete: (id) =>
    api.delete(ENDPOINTS.PARTNERSHIP_BY_ID(id)),
};
