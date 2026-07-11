/**
 * Contact form service.
 * Replaces raw fetch() calls in Contact.jsx and AdminDashboard.jsx.
 */
import { api } from './client';
import { ENDPOINTS } from './endpoints';

export const contactService = {
  /**
   * Submit a contact form inquiry.
   * @param {object} formData - { name, email, message }
   * @returns {Promise<{ success, data, message }>}
   */
  submit: (formData) =>
    api.post(ENDPOINTS.CONTACT, formData),

  /**
   * Get all contact inquiries (admin only).
   * @returns {Promise<{ success, data, message }>}
   */
  getAll: () =>
    api.get(ENDPOINTS.CONTACT, { auth: true }),

  /**
   * Update contact status (admin only).
   * @param {string} id
   * @param {string} status
   * @returns {Promise<{ success, data, message }>}
   */
  updateStatus: (id, status) =>
    api.patch(`${ENDPOINTS.CONTACT}/${id}`, { status }, { auth: true }),

  /**
   * Delete contact inquiry (admin only).
   * @param {string} id
   * @returns {Promise<{ success, data, message }>}
   */
  delete: (id) =>
    api.delete(`${ENDPOINTS.CONTACT}/${id}`, { auth: true }),
};
