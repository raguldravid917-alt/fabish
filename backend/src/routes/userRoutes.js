const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const { ROLES } = require('../constants');

router.use(authenticate, authorize(ROLES.ADMIN));

router.get('/', userController.getUsers);
router.delete('/:id', userController.deleteUser);

module.exports = router;
