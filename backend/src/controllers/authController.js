'use strict';

const authService = require('../services/authService');
const sendEmail = require('../utils/sendEmail');
const { HTTP_STATUS } = require('../constants');

// ─── Inline Logger (no external dependency) ───────────────────────────────────
const isDev = process.env.NODE_ENV !== 'production';

const logger = {
  _log(level, msg) {
    const ts = new Date().toISOString();
    const line = isDev
      ? `[${ts}] [${level.toUpperCase()}] ${msg}`
      : JSON.stringify({ ts, level, msg });
    level === 'error' || level === 'warn'
      ? process.stderr.write(line + '\n')
      : process.stdout.write(line + '\n');
  },
  info: (msg) => logger._log('info', msg),
  warn: (msg) => logger._log('warn', msg),
  error: (msg) => logger._log('error', msg),
};

// ─── Cookie Config ────────────────────────────────────────────────────────────
const getCookieOptions = (req) => {
  const origin = req?.headers?.origin || '';
  const isLocal = origin.includes('localhost') || origin.includes('127.0.0.1');
  const isProd = process.env.NODE_ENV === 'production' && !isLocal;
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  };
};

// ─── Validators ───────────────────────────────────────────────────────────────
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const validateRegister = ({ name, email, password }) => {
  if (!name?.trim()) return 'Name is required';
  if (!email?.trim()) return 'Email is required';
  if (!isValidEmail(email)) return 'Invalid email format';
  if (!password) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters';
  return null;
};

const validateLogin = ({ email, password }) => {
  if (!email?.trim()) return 'Email is required';
  if (!isValidEmail(email)) return 'Invalid email format';
  if (!password) return 'Password is required';
  return null;
};

// ─── Response Helpers ─────────────────────────────────────────────────────────
const ok = (res, status, message, data = {}) =>
  res.status(status).json({ success: true, message, data });

const fail = (res, status, message, ctx = '') => {
  logger.error(`[AuthController]${ctx ? ` ${ctx}` : ''}: ${message}`);
  return res.status(status).json({ success: false, message });
};

// ─── Controller ───────────────────────────────────────────────────────────────
class AuthController {

  /**
   * POST /api/auth/google
   * @public
   */
  async googleLogin(req, res, next) {
    try {
      const { idToken } = req.body ?? {};

      if (!idToken) {
        return fail(res, HTTP_STATUS.BAD_REQUEST, 'Google ID token is required', 'googleLogin');
      }

      // Delegate to service to verify and log/create user
      const result = await authService.googleLogin(idToken);

      res.cookie('refreshToken', result.refreshToken, getCookieOptions(req));
      logger.info(`[AuthController] googleLogin: authenticated — ${result.user.email}`);

      return ok(res, HTTP_STATUS.OK, 'Google login successful', {
        user: result.user,
        token: result.accessToken,
      });
    } catch (error) {
      return fail(res, HTTP_STATUS.BAD_REQUEST, error.message, 'googleLogin');
    }
  }

  /**
   * POST /api/auth/register
   * @public
   */
  async register(req, res, next) {
    try {
      const { name, email, password } = req.body ?? {};

      const err = validateRegister({ name, email, password });
      if (err) return fail(res, HTTP_STATUS.BAD_REQUEST, err, 'register');

      const result = await authService.register(
        name.trim(),
        email.trim().toLowerCase(),
        password
      );

      res.cookie('refreshToken', result.refreshToken, getCookieOptions(req));
      logger.info(`[AuthController] register: user created — ${email}`);

      return ok(res, HTTP_STATUS.CREATED, 'Registration successful', {
        user: result.user,
        token: result.accessToken,
      });
    } catch (error) {
      const isDupe = error.message?.toLowerCase().includes('exist');
      return fail(
        res,
        isDupe ? HTTP_STATUS.CONFLICT : HTTP_STATUS.BAD_REQUEST,
        error.message,
        'register'
      );
    }
  }

  /**
   * POST /api/auth/login
   * @public
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body ?? {};

      const err = validateLogin({ email, password });
      if (err) return fail(res, HTTP_STATUS.BAD_REQUEST, err, 'login');

      const result = await authService.login(
        email.trim().toLowerCase(),
        password
      );

      res.cookie('refreshToken', result.refreshToken, getCookieOptions(req));
      logger.info(`[AuthController] login: authenticated — ${email}`);

      return ok(res, HTTP_STATUS.OK, 'Login successful', {
        user: result.user,
        token: result.accessToken,
      });
    } catch (error) {
      console.error('[AuthController] Login error details:', error);
      logger.warn(`[AuthController] login failed — ${req.body?.email}`);
      if (error.message === 'Email does not exist' || error.message === 'Incorrect password' || error.message === 'Invalid email or password') {
        return fail(res, HTTP_STATUS.UNAUTHORIZED, 'Invalid email or password', 'login');
      }
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR || 500).json({
        success: false,
        message: error.message || 'Internal server error',
      });
    }
  }

  /**
   * POST /api/admin/login
   * @public
   */
  async adminLogin(req, res, next) {
    try {
      const { email, password } = req.body ?? {};

      const err = validateLogin({ email, password });
      if (err) return fail(res, HTTP_STATUS.BAD_REQUEST, err, 'adminLogin');

      const result = await authService.adminLogin(
        email.trim().toLowerCase(),
        password
      );

      res.cookie('refreshToken', result.refreshToken, getCookieOptions(req));
      logger.info(`[AuthController] adminLogin: admin authenticated — ${email}`);

      return ok(res, HTTP_STATUS.OK, 'Admin login successful', {
        user: result.user,
        token: result.accessToken,
      });
    } catch (error) {
      console.error('[AuthController] Admin login error details:', error);
      logger.warn(`[AuthController] adminLogin failed — ${req.body?.email}`);
      if (error.message === 'Email does not exist' || error.message === 'Incorrect password' || error.message === 'Invalid credentials or insufficient privileges') {
        return fail(res, HTTP_STATUS.UNAUTHORIZED, 'Invalid credentials or insufficient privileges', 'adminLogin');
      }
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR || 500).json({
        success: false,
        message: error.message || 'Internal server error',
      });
    }
  }

  /**
   * POST /api/auth/refresh
   * @public
   */
  async refresh(req, res, next) {
    try {
      const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

      if (!refreshToken) {
        return fail(res, HTTP_STATUS.UNAUTHORIZED, 'No refresh token provided', 'refresh');
      }

      const result = await authService.refresh(refreshToken);

      res.cookie('refreshToken', result.refreshToken, getCookieOptions(req));
      logger.info(`[AuthController] refresh: token rotated`);

      return ok(res, HTTP_STATUS.OK, 'Token refreshed successfully', {
        token: result.accessToken,
      });
    } catch (error) {
      logger.warn(`[AuthController] refresh failed: ${error.message}`);
      res.clearCookie('refreshToken', { path: '/' });
      return fail(res, HTTP_STATUS.UNAUTHORIZED, 'Session expired, please login again', 'refresh');
    }
  }

  /**
   * POST /api/auth/logout
   * @private
   */
  async logout(req, res, next) {
    try {
      if (req.user?._id) {
        await authService.logout(req.user._id);
      }
      res.clearCookie('refreshToken', { path: '/' });
      logger.info(`[AuthController] logout — ${req.user?._id}`);

      return ok(res, HTTP_STATUS.OK, 'Logout successful');
    } catch (error) {
      return fail(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Logout failed', 'logout');
    }
  }

  /**
   * GET /api/auth/profile
   * @private
   */
  async getProfile(req, res, next) {
    try {
      const { _id, name, email, role, isAdmin } = req.user;
      return ok(res, HTTP_STATUS.OK, 'Profile fetched', {
        _id, name, email, role, isAdmin,
      });
    } catch (error) {
      return fail(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to fetch profile', 'getProfile');
    }
  }

  /**
   * PUT /api/auth/profile
   * @private
   */
  async updateProfile(req, res, next) {
    try {
      const { name, email, password } = req.body ?? {};
      const updates = {};

      if (name?.trim()) updates.name = name.trim();
      if (email?.trim()) {
        if (!isValidEmail(email))
          return fail(res, HTTP_STATUS.BAD_REQUEST, 'Invalid email format', 'updateProfile');
        updates.email = email.trim().toLowerCase();
      }
      if (password) {
        if (password.length < 8)
          return fail(res, HTTP_STATUS.BAD_REQUEST, 'Password must be at least 8 characters', 'updateProfile');
        updates.password = password;
      }

      if (!Object.keys(updates).length) {
        return fail(res, HTTP_STATUS.BAD_REQUEST, 'No valid fields to update', 'updateProfile');
      }

      const result = await authService.updateProfile(req.user._id, updates);
      logger.info(`[AuthController] updateProfile — ${req.user._id}`);

      return ok(res, HTTP_STATUS.OK, 'Profile updated successfully', {
        _id: result.user._id,
        name: result.user.name,
        email: result.user.email,
        role: result.user.role,
        isAdmin: result.user.isAdmin,
        token: result.accessToken,
      });
    } catch (error) {
      return fail(res, HTTP_STATUS.BAD_REQUEST, error.message, 'updateProfile');
    }
  }

  /**
   * GET /api/auth/me
   * @private
   */
  async getMe(req, res, next) {
    try {
      return ok(res, HTTP_STATUS.OK, 'User fetched', req.user);
    } catch (error) {
      return fail(res, HTTP_STATUS.UNAUTHORIZED, 'Not authorized', 'getMe');
    }
  }

  /**
   * POST /api/auth/forgot-password
   * @public
   */
  async forgotPassword(req, res, next) {
    const SAFE_MSG = 'If an account with that email exists, a reset link has been sent';
    try {
      const { email } = req.body ?? {};

      if (!email?.trim() || !isValidEmail(email)) {
        return fail(res, HTTP_STATUS.BAD_REQUEST, 'Valid email is required', 'forgotPassword');
      }

      const resetToken = await authService.forgotPassword(email.trim().toLowerCase());
      logger.info(`[AuthController] forgotPassword token generated — ${email}`);

      const clientUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const resetUrl = `${clientUrl}/account/reset-password/${resetToken}`;

      const message = `You are receiving this email because a password reset request was made for your Fabish account. Please click on the following link, or paste it into your browser to complete the process:\n\n${resetUrl}\n\nThis link is valid for 30 minutes. If you did not request this, please ignore this email and your password will remain unchanged.\n`;

      const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eae8d8; background-color: #fcfcfa;">
          <h2 style="color: #2f3e10; text-transform: uppercase; font-family: 'Outfit', sans-serif; font-size: 20px; letter-spacing: 1px; border-bottom: 1px solid #eae8d8; padding-bottom: 10px;">Password Reset Request</h2>
          <p style="font-size: 14px; color: #333; line-height: 1.6;">
            You are receiving this email because a password reset request was made for your Fabish account.
          </p>
          <p style="font-size: 14px; color: #333; line-height: 1.6; margin: 20px 0;">
            Click the button below to reset your password. This link is valid for 30 minutes.
          </p>
          <div style="margin: 25px 0;">
            <a href="${resetUrl}" style="display: inline-block; background-color: #2f3e10; color: #ffffff; text-decoration: none; padding: 14px 28px; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; transition: background-color 0.3s ease;">
              Reset Password
            </a>
          </div>
          <p style="font-size: 12px; color: #666; margin-top: 30px; border-top: 1px solid #eae8d8; padding-top: 15px;">
            If you did not request this, please ignore this email. Your password will remain unchanged.<br/>
            Or copy and paste this link in your browser:<br/>
            <a href="${resetUrl}" style="color: #729855;">${resetUrl}</a>
          </p>
        </div>
      `;

      await sendEmail({
        email: email.trim().toLowerCase(),
        subject: 'Fabish Storefront — Password Reset Request',
        message,
        html,
      });

      return ok(res, HTTP_STATUS.OK, SAFE_MSG);
    } catch (error) {
      logger.error(`[AuthController] forgotPassword error: ${error.message}`);
      return fail(res, HTTP_STATUS.BAD_REQUEST, error.message, 'forgotPassword');
    }
  }

  /**
   * POST /api/auth/reset-password/:token
   * @public
   */
  async resetPassword(req, res, next) {
    try {
      const resetToken = req.params?.token || req.body?.token;
      const { password } = req.body ?? {};

      if (!resetToken)
        return fail(res, HTTP_STATUS.BAD_REQUEST, 'Reset token is required', 'resetPassword');
      if (!password || password.length < 8)
        return fail(res, HTTP_STATUS.BAD_REQUEST, 'Password must be at least 8 characters', 'resetPassword');

      await authService.resetPassword(resetToken, password);
      logger.info(`[AuthController] resetPassword: success`);

      return ok(res, HTTP_STATUS.OK, 'Password updated successfully');
    } catch (error) {
      logger.error(`[AuthController] resetPassword error: ${error.message}`);
      return fail(res, HTTP_STATUS.BAD_REQUEST, 'Invalid or expired reset token', 'resetPassword');
    }
  }
}

module.exports = new AuthController();