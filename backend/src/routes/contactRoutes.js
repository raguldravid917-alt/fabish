const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { createContactRules } = require('../validators/contactValidator');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const { ROLES } = require('../constants');

// Public route to submit contact inquiry
router.post('/', createContactRules, contactController.createInquiry);

// Admin-only routes
router.use(authenticate, authorize(ROLES.ADMIN));

router.get('/', contactController.getInquiries);
router.route('/:id')
  .patch(contactController.updateStatus)
  .delete(contactController.deleteInquiry);

module.exports = router;
