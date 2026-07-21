import { api } from './client';
import { ENDPOINTS } from './endpoints';

/**
 * footerPageService — API service for Footer Pages CMS.
 * Covers both public storefront and admin CRUD operations.
 */
export const footerPageService = {
  /* ── Public ────────────────────────────────────────────────── */

  /** Get all published footer pages (for navigation). */
  getPublicPages: () => api.get(ENDPOINTS.FOOTER_PAGES_PUBLIC, { auth: false }),

  /** Get a single footer page by slug. */
  getPageBySlug: (slug) => api.get(ENDPOINTS.FOOTER_PAGE_BY_SLUG(slug), { auth: false }),

  /* ── Admin ─────────────────────────────────────────────────── */

  /** Admin: paginated list with search/filter/sort. */
  adminList: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`${ENDPOINTS.ADMIN_FOOTER_PAGES}?${query}`);
  },

  /** Admin: get a single page by ID. */
  adminGetById: (id) => api.get(ENDPOINTS.ADMIN_FOOTER_PAGE_BY_ID(id)),

  /** Admin: create a new page (multipart/form-data for images). */
  create: (formData) =>
    api.post(ENDPOINTS.ADMIN_FOOTER_PAGES, formData),

  /** Admin: update an existing page (multipart/form-data for images). */
  update: (id, formData) =>
    api.put(ENDPOINTS.ADMIN_FOOTER_PAGE_BY_ID(id), formData),

  /** Admin: toggle page status (Published/Draft/Archived). */
  toggleStatus: (id, status) =>
    api.patch(ENDPOINTS.ADMIN_FOOTER_PAGE_TOGGLE_STATUS(id), { status }),

  /** Admin: toggle showInFooter visibility. */
  toggleFooterVisibility: (id, showInFooter) =>
    api.patch(ENDPOINTS.ADMIN_FOOTER_PAGE_TOGGLE_FOOTER(id), { showInFooter }),

  /** Admin: reorder pages via drag-and-drop. */
  reorder: (items) =>
    api.patch(ENDPOINTS.ADMIN_FOOTER_PAGES_REORDER, { items }),

  /** Admin: duplicate a page as Draft. */
  duplicate: (id) =>
    api.post(ENDPOINTS.ADMIN_FOOTER_PAGE_DUPLICATE(id), {}),

  /** Admin: soft delete (move to trash). */
  softDelete: (id) =>
    api.delete(ENDPOINTS.ADMIN_FOOTER_PAGE_BY_ID(id)),

  /** Admin: restore from trash. */
  restore: (id) =>
    api.patch(ENDPOINTS.ADMIN_FOOTER_PAGE_RESTORE(id), {}),

  /** Admin: permanently delete a page. */
  hardDelete: (id) =>
    api.delete(ENDPOINTS.ADMIN_FOOTER_PAGE_HARD_DELETE(id)),

  /** Admin: bulk action (delete | publish | unpublish). */
  bulkAction: (action, ids) =>
    api.post(ENDPOINTS.ADMIN_FOOTER_PAGES_BULK, { action, ids }),
};
