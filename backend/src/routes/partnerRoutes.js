const express = require('express');
const router = express.Router();
const partnerController = require('../controllers/partnerController');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const { ROLES } = require('../constants');

// Public: Get partnership types + form schemas
router.get('/types', partnerController.getTypes);

// Public: Submit partnership application
router.post('/apply', partnerController.applyForPartnership);

// Admin: Get all applications
router.get('/', authenticate, authorize(ROLES.ADMIN), partnerController.getAllApplications);

// Admin: Get single application
router.get('/:id', authenticate, authorize(ROLES.ADMIN), partnerController.getApplicationById);

// Admin: Update application status
router.put('/:id/status', authenticate, authorize(ROLES.ADMIN), partnerController.updateStatus);

// Admin: Delete application
router.delete('/:id', authenticate, authorize(ROLES.ADMIN), partnerController.deleteApplication);

module.exports = router;
