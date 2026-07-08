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
};
