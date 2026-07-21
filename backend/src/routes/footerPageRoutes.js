const express = require('express');
const router = express.Router();

const controller = require('../controllers/footerPageController');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const { ROLES } = require('../constants');
const upload = require('../middleware/uploadMiddleware');
const {
  validateCreate,
  validateUpdate,
  validateToggleStatus,
  validateToggleVisibility,
  validateReorder,
  validateBulkAction,
} = require('../validators/footerPageValidator');

/* ─── Public Routes (no auth required) ───────────────────────── */

// List all published footer pages for storefront
router.get('/public', controller.getPublicPages);

// Get a single footer page by slug (public)
router.get('/slug/:slug', controller.getPageBySlug);

/* ─── Admin Middleware ─────────────────────────────────────────── */
const adminOnly = [authenticate, authorize(ROLES.ADMIN)];

// Multer config for dual image fields
const uploadFields = upload.fields([
  { name: 'featuredImage', maxCount: 1 },
  { name: 'bannerImage', maxCount: 1 },
]);

/* ─── Admin Routes ─────────────────────────────────────────────── */

// Bulk action (before /:id to avoid route conflict)
router.post('/bulk', ...adminOnly, validateBulkAction, controller.bulkAction);

// Reorder pages (drag-and-drop)
router.patch('/reorder', ...adminOnly, validateReorder, controller.reorderPages);

// Admin: list pages (paginated, search, sort, trash)
router.get('/', ...adminOnly, controller.adminListPages);

// Admin: get single page by ID
router.get('/:id', ...adminOnly, controller.adminGetById);

// Admin: create page
router.post('/', ...adminOnly, uploadFields, validateCreate, controller.createPage);

// Admin: update page
router.put('/:id', ...adminOnly, uploadFields, validateUpdate, controller.updatePage);

// Admin: toggle status (Published/Draft/Archived)
router.patch('/:id/toggle-status', ...adminOnly, validateToggleStatus, controller.toggleStatus);

// Admin: toggle footer visibility
router.patch(
  '/:id/toggle-footer',
  ...adminOnly,
  validateToggleVisibility,
  controller.toggleFooterVisibility
);

// Admin: duplicate a page
router.post('/:id/duplicate', ...adminOnly, controller.duplicatePage);

// Admin: soft delete (move to trash)
router.delete('/:id', ...adminOnly, controller.softDeletePage);

// Admin: restore from trash
router.patch('/:id/restore', ...adminOnly, controller.restorePage);

// Admin: hard delete (permanent)
router.delete('/:id/hard', ...adminOnly, controller.hardDeletePage);

module.exports = router;
