const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const { ROLES } = require('../constants');
const upload = require('../middleware/uploadMiddleware');

// Public: Get all active team members + departments
router.get('/', teamController.getTeam);

// Admin: Get all members including inactive
router.get('/admin', authenticate, authorize(ROLES.ADMIN), teamController.getAllTeam);

// Admin: Create team member
router.post('/', authenticate, authorize(ROLES.ADMIN), upload.single('image'), teamController.createMember);

// Admin: Update team member
router.put('/:id', authenticate, authorize(ROLES.ADMIN), upload.single('image'), teamController.updateMember);

// Admin: Delete team member
router.delete('/:id', authenticate, authorize(ROLES.ADMIN), teamController.deleteMember);

module.exports = router;
