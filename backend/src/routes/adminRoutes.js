const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { loginRules } = require('../validators/authValidator');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/login', authLimiter, loginRules, authController.adminLogin);

module.exports = router;
