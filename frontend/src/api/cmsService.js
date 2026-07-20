import { api } from './client';
import { ENDPOINTS } from './endpoints';

export const cmsService = {
  /**
   * Fetch CMS page content by slug.
   * @param {string} slug
   * @returns {Promise<{ success, data, message }>}
   */
  getPage: (slug) =>
    api.get(ENDPOINTS.CMS_PAGE_BY_SLUG(slug), { auth: false }),

  /**
   * Update CMS page content by slug (Admin only).
   * @param {string} slug
   * @param {{ title: string, content: string, metaTitle?: string, metaDescription?: string }} pageData
   * @returns {Promise<{ success, data, message }>}
   */
  updatePage: (slug, pageData) =>
    api.put(ENDPOINTS.CMS_PAGE_BY_SLUG(slug), pageData, { auth: true }),

  /**
   * Get version history for a CMS page (Admin only).
   * @param {string} slug
   * @returns {Promise<{ success, data, message }>}
   */
  getVersionHistory: (slug) =>
    api.get(ENDPOINTS.CMS_PAGE_VERSIONS(slug)),
};
