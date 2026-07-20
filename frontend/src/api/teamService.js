import { api } from './client';
import { ENDPOINTS } from './endpoints';

export const teamService = {
  /**
   * Get all active team members and departments (public).
   */
  getAll: () =>
    api.get(ENDPOINTS.TEAM),

  // ── Admin methods ─────────────────────────────────────────────────

  /**
   * Admin: Get all members including inactive.
   */
  adminGetAll: () =>
    api.get(ENDPOINTS.TEAM_ADMIN),

  /**
   * Admin: Create a team member.
   * @param {FormData} formData
   */
  adminCreate: (formData) =>
    api.post(ENDPOINTS.TEAM, formData),

  /**
   * Admin: Update a team member.
   * @param {string} id
   * @param {FormData} formData
   */
  adminUpdate: (id, formData) =>
    api.put(ENDPOINTS.TEAM_MEMBER_BY_ID(id), formData),

  /**
   * Admin: Delete a team member.
   * @param {string} id
   */
  adminDelete: (id) =>
    api.delete(ENDPOINTS.TEAM_MEMBER_BY_ID(id)),
};
