const footerPageService = require('../services/footerPageService');

/**
 * FooterPageController — handles all HTTP requests for Footer Pages CMS.
 * All business logic is delegated to FooterPageService.
 */
const footerPageController = {
  /* ── Public Endpoints ──────────────────────────────────────── */

  /**
   * GET /api/footer-pages
   * Returns all Published + showInFooter pages for the storefront footer.
   */
  getPublicPages: async (req, res, next) => {
    try {
      const pages = await footerPageService.getPublicPages();
      res.status(200).json({ success: true, data: pages });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/footer-pages/:slug
   * Returns a single page by slug. 404 if not found, 403 if not published.
   */
  getPageBySlug: async (req, res, next) => {
    try {
      const { slug } = req.params;
      const page = await footerPageService.getPageBySlug(slug);

      if (!page) {
        return res.status(404).json({
          success: false,
          message: 'Page not found',
          code: 'NOT_FOUND',
        });
      }

      if (page.status !== 'Published') {
        return res.status(403).json({
          success: false,
          message: 'This page is not currently available',
          code: 'PAGE_INACTIVE',
          data: { title: page.title, status: page.status },
        });
      }

      if (page.isDeleted) {
        return res.status(404).json({
          success: false,
          message: 'Page not found',
          code: 'NOT_FOUND',
        });
      }

      res.status(200).json({ success: true, data: page });
    } catch (error) {
      next(error);
    }
  },

  /* ── Admin Endpoints ──────────────────────────────────────── */

  /**
   * GET /api/admin/footer-pages
   * Admin paginated list with search, sort, and filters.
   */
  adminListPages: async (req, res, next) => {
    try {
      const {
        page = 1,
        limit = 10,
        search = '',
        status = '',
        showInFooter = '',
        trash = 'false',
        sortField = 'displayOrder',
        sortOrder = 'asc',
      } = req.query;

      const result = await footerPageService.adminListPages({
        page: parseInt(page),
        limit: parseInt(limit),
        search,
        status,
        showInFooter,
        includeDeleted: trash === 'true',
        sortField,
        sortOrder,
      });

      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/admin/footer-pages/:id
   * Admin get single page by MongoDB ID.
   */
  adminGetById: async (req, res, next) => {
    try {
      const page = await footerPageService.getById(req.params.id);
      res.status(200).json({ success: true, data: page });
    } catch (error) {
      if (error.message === 'Footer page not found') {
        return res.status(404).json({ success: false, message: error.message });
      }
      next(error);
    }
  },

  /**
   * POST /api/admin/footer-pages
   * Create a new footer page with optional image uploads.
   */
  createPage: async (req, res, next) => {
    try {
      const files = {
        featuredImage: req.files?.featuredImage || null,
        bannerImage: req.files?.bannerImage || null,
      };

      const page = await footerPageService.createPage(req.body, files, req.user?._id);

      res.status(201).json({
        success: true,
        message: 'Footer page created successfully',
        data: page,
      });
    } catch (error) {
      if (error.message.includes('slug')) {
        return res.status(409).json({ success: false, message: error.message });
      }
      next(error);
    }
  },

  /**
   * PUT /api/admin/footer-pages/:id
   * Update an existing footer page.
   */
  updatePage: async (req, res, next) => {
    try {
      const files = {
        featuredImage: req.files?.featuredImage || null,
        bannerImage: req.files?.bannerImage || null,
      };

      const page = await footerPageService.updatePage(
        req.params.id,
        req.body,
        files,
        req.user?._id
      );

      res.status(200).json({
        success: true,
        message: 'Footer page updated successfully',
        data: page,
      });
    } catch (error) {
      if (error.message === 'Footer page not found') {
        return res.status(404).json({ success: false, message: error.message });
      }
      if (error.message.includes('slug')) {
        return res.status(409).json({ success: false, message: error.message });
      }
      next(error);
    }
  },

  /**
   * PATCH /api/admin/footer-pages/:id/toggle-status
   * Toggle page status: Published / Draft / Archived.
   */
  toggleStatus: async (req, res, next) => {
    try {
      const { status } = req.body;
      const page = await footerPageService.toggleStatus(req.params.id, status, req.user?._id);
      res.status(200).json({
        success: true,
        message: `Page status updated to ${status}`,
        data: page,
      });
    } catch (error) {
      if (error.message === 'Footer page not found') {
        return res.status(404).json({ success: false, message: error.message });
      }
      next(error);
    }
  },

  /**
   * PATCH /api/admin/footer-pages/:id/toggle-footer
   * Toggle showInFooter visibility.
   */
  toggleFooterVisibility: async (req, res, next) => {
    try {
      const { showInFooter } = req.body;
      const page = await footerPageService.toggleFooterVisibility(
        req.params.id,
        showInFooter,
        req.user?._id
      );
      res.status(200).json({
        success: true,
        message: `Page visibility ${showInFooter ? 'shown in' : 'hidden from'} footer`,
        data: page,
      });
    } catch (error) {
      if (error.message === 'Footer page not found') {
        return res.status(404).json({ success: false, message: error.message });
      }
      next(error);
    }
  },

  /**
   * PATCH /api/admin/footer-pages/reorder
   * Update displayOrder for multiple pages (drag-and-drop).
   */
  reorderPages: async (req, res, next) => {
    try {
      await footerPageService.reorderPages(req.body.items);
      res.status(200).json({ success: true, message: 'Pages reordered successfully' });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/admin/footer-pages/:id/duplicate
   * Clone a page as a Draft.
   */
  duplicatePage: async (req, res, next) => {
    try {
      const page = await footerPageService.duplicatePage(req.params.id, req.user?._id);
      res.status(201).json({
        success: true,
        message: 'Page duplicated successfully',
        data: page,
      });
    } catch (error) {
      if (error.message === 'Footer page not found') {
        return res.status(404).json({ success: false, message: error.message });
      }
      next(error);
    }
  },

  /**
   * DELETE /api/admin/footer-pages/:id
   * Soft delete (moves to trash).
   */
  softDeletePage: async (req, res, next) => {
    try {
      await footerPageService.softDelete(req.params.id, req.user?._id);
      res.status(200).json({ success: true, message: 'Page moved to trash' });
    } catch (error) {
      if (error.message === 'Footer page not found') {
        return res.status(404).json({ success: false, message: error.message });
      }
      next(error);
    }
  },

  /**
   * PATCH /api/admin/footer-pages/:id/restore
   * Restore a soft-deleted page.
   */
  restorePage: async (req, res, next) => {
    try {
      const page = await footerPageService.restore(req.params.id, req.user?._id);
      res.status(200).json({ success: true, message: 'Page restored successfully', data: page });
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /api/admin/footer-pages/:id/hard
   * Permanent deletion — also removes Cloudinary images.
   */
  hardDeletePage: async (req, res, next) => {
    try {
      await footerPageService.hardDelete(req.params.id);
      res.status(200).json({ success: true, message: 'Page permanently deleted' });
    } catch (error) {
      if (error.message === 'Footer page not found') {
        return res.status(404).json({ success: false, message: error.message });
      }
      next(error);
    }
  },

  /**
   * POST /api/admin/footer-pages/bulk
   * Bulk action: delete | publish | unpublish.
   */
  bulkAction: async (req, res, next) => {
    try {
      const { action, ids } = req.body;
      await footerPageService.bulkAction(action, ids, req.user?._id);
      const messages = {
        delete: 'Pages moved to trash',
        publish: 'Pages published successfully',
        unpublish: 'Pages unpublished successfully',
      };
      res.status(200).json({ success: true, message: messages[action] || 'Bulk action completed' });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = footerPageController;
