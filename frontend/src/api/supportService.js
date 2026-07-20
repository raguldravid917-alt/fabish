import { api } from './client';
import { ENDPOINTS } from './endpoints';

export const supportService = {
  /**
   * Create a new support ticket with optional image attachments.
   * @param {FormData} formData
   */
  createTicket: (formData) =>
    api.post(ENDPOINTS.SUPPORT_TICKETS, formData),

  /**
   * Get the authenticated user's own tickets.
   * @param {{ page?: number, limit?: number }} params
   */
  getMyTickets: (params = {}) =>
    api.get(ENDPOINTS.SUPPORT_MY_TICKETS, { params }),

  // ── Admin methods ─────────────────────────────────────────────────

  /**
   * Admin: Get all tickets with filters.
   * @param {{ page?, limit?, status?, category?, priority?, search? }} params
   */
  adminGetAll: (params = {}) =>
    api.get(ENDPOINTS.SUPPORT_TICKETS, { params }),

  /**
   * Admin: Get ticket stats by status.
   */
  adminGetStats: () =>
    api.get(ENDPOINTS.SUPPORT_STATS),

  /**
   * Admin: Get single ticket by ID.
   * @param {string} id
   */
  adminGetById: (id) =>
    api.get(ENDPOINTS.SUPPORT_TICKET_BY_ID(id)),

  /**
   * Admin: Update ticket status, add note or reply.
   * @param {string} id
   * @param {{ status?, adminNotes?, replyMessage? }} data
   */
  adminUpdateStatus: (id, data) =>
    api.put(ENDPOINTS.SUPPORT_TICKET_STATUS(id), data),

  /**
   * Admin: Delete a ticket.
   * @param {string} id
   */
  adminDelete: (id) =>
    api.delete(ENDPOINTS.SUPPORT_TICKET_BY_ID(id)),
};
