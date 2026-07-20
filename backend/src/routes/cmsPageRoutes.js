const express = require('express');
const router = express.Router();
const cmsPageController = require('../controllers/cmsPageController');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const { ROLES } = require('../constants');

// Public routes
router.get('/:slug', cmsPageController.getPageBySlug);

// Admin-only routes
router.put('/:slug', authenticate, authorize(ROLES.ADMIN), cmsPageController.updatePage);
router.get('/:slug/versions', authenticate, authorize(ROLES.ADMIN), cmsPageController.getVersionHistory);

module.exports = router;
