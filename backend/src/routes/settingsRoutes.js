const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const { ROLES } = require('../constants');

// Public settings retrieval
router.get('/', settingsController.getPublicSettings);

// Admin-only settings retrieval and update
router.get('/admin', authenticate, authorize(ROLES.ADMIN), settingsController.getSettings);
router.put('/admin', authenticate, authorize(ROLES.ADMIN), settingsController.updateSettings);

module.exports = router;
