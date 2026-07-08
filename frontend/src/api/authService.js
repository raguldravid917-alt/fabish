/**
 * Authentication service.
 * Replaces raw fetch() calls in AuthContext.jsx.
 */
import { api } from './client';
import { ENDPOINTS } from './endpoints';

export const authService = {
  /**
   * Login with email and password.
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{ success, data, message }>}
   */
  login: (email, password) =>
    api.post(ENDPOINTS.AUTH_LOGIN, { email, password }),

  /**
   * Register a new user.
   * @param {string} name
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{ success, data, message }>}
   */
  register: (name, email, password) =>
    api.post(ENDPOINTS.AUTH_REGISTER, { name, email, password }),

  /**
   * Get the current user's profile.
   * @returns {Promise<{ success, data, message }>}
   */
  getProfile: () =>
    api.get(ENDPOINTS.AUTH_PROFILE),

  /**
   * Get currently logged-in user details.
   * @returns {Promise<{ success, data, message }>}
   */
  getMe: () =>
    api.get('/auth/me'),

  /**
   * Update user profile.
   * @param {object} profileData
   * @returns {Promise<{ success, data, message }>}
   */
  updateProfile: (profileData) =>
    api.put(ENDPOINTS.AUTH_PROFILE, profileData),

  /**
   * Request password reset token.
   * @param {string} email
   * @returns {Promise<{ success, data, message }>}
   */
  forgotPassword: (email) =>
    api.post('/auth/forgot-password', { email }),

  /**
   * Reset password using token.
   * @param {string} token
   * @param {string} password
   * @returns {Promise<{ success, data, message }>}
   */
  resetPassword: (token, password) =>
    api.post('/auth/reset-password', { token, password }),

  /**
   * Logout user.
   * @returns {Promise<{ success, data, message }>}
   */
  logout: () =>
    api.post('/auth/logout'),
};
