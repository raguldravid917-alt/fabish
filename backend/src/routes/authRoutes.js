const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const {
  registerRules,
  loginRules,
  updateProfileRules,
  forgotPasswordRules,
  resetPasswordRules,
} = require('../validators/authValidator');
const { authenticate } = require('../middleware/authMiddleware');
const { authLimiter, googleOAuthLimiter } = require('../middleware/rateLimiter');

// Public routes
router.post('/register', authLimiter, registerRules, authController.register);
router.post('/login', authLimiter, loginRules, authController.login);
router.post('/refresh', authController.refresh);

// Google OAuth public route — uses a dedicated, higher-threshold limiter
router.post('/google', googleOAuthLimiter, authController.googleLogin);

// Private routes
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.getMe);
router.route('/profile')
  .get(authenticate, authController.getProfile)
  .put(authenticate, updateProfileRules, authController.updateProfile);

// Password recovery public routes
router.post('/forgot-password', authLimiter, forgotPasswordRules, authController.forgotPassword);
router.post('/reset-password', authLimiter, resetPasswordRules, authController.resetPassword);
router.post('/reset-password/:token', authLimiter, resetPasswordRules, authController.resetPassword);

module.exports = router;