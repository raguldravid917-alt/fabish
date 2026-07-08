/**
 * Axios API client.
 *
 * All HTTP calls flow through this module. It handles:
 * - Base URL from env config
 * - Automatic JSON parsing (handled by Axios)
 * - Authorization header injection via interceptors
 * - Automatic refresh token rotation on 401 failures
 * - Consistent error normalization
 */
import axios from 'axios';
import { ENV } from '../config/env';

// Create Axios Instance
const client = axios.create({
  baseURL: ENV.API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Allow cookie exchanges (refresh tokens)
});

// Request Interceptor to auto-attach Token
client.interceptors.request.use(
  (config) => {
    try {
      // Let browser set correct Content-Type for FormData (multipart/form-data with boundary)
      if (config.data instanceof FormData) {
        delete config.headers['Content-Type'];
      }

      // Prevent Axios from treating { auth: true } as Basic Auth config and overwriting Bearer token
      if (config.auth) {
        delete config.auth;
      }

      let token = localStorage.getItem('token');
      if (!token) {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
          const parsed = JSON.parse(userInfo);
          token = parsed.token || parsed.accessToken;
        }
      }
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    } catch (e) {
      console.error('Error loading token from localStorage:', e);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Token refreshing state and queue variables
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response Interceptor to normalize API responses and handle 401s
client.interceptors.response.use(
  (response) => {
    const resData = response.data;
    return {
      success: resData?.success !== undefined ? resData.success : true,
      data: resData?.data !== undefined ? resData.data : resData,
      message: resData?.message || '',
      status: response.status,
    };
  },
  async (error) => {
    const originalRequest = error.config;

    // Check if error is a 401 (Unauthorized) and the request is not a retry
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url &&
      !originalRequest.url.includes('/auth/refresh') &&
      !originalRequest.url.includes('/auth/login')
    ) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
            return client(originalRequest);
          })
          .catch((err) => {
            // FIX: Normalize the rejected queue so UI stops loading safely
            return {
              success: false,
              data: null,
              message: 'Session expired. Please log in again.',
              status: 401,
            };
          });
      }

      isRefreshing = true;

      try {
        // Since our interceptor normalizes responses, we must manually check res.success
        const res = await client.post('/auth/refresh');

        if (res.success && res.data?.token) {
          const newToken = res.data.token;
          localStorage.setItem('token', newToken);
          client.defaults.headers.common['Authorization'] = 'Bearer ' + newToken;
          originalRequest.headers['Authorization'] = 'Bearer ' + newToken;

          processQueue(null, newToken);
          isRefreshing = false;

          return client(originalRequest);
        } else {
          // FIX: Explicitly throw error if refresh didn't return a token
          throw new Error('Refresh token failed or expired');
        }
      } catch (refreshError) {
        // This catch block will now properly execute and UNLOCK the queue!
        processQueue(refreshError, null);
        isRefreshing = false;
        // NOTE: Do NOT remove token here. The caller (e.g., AuthContext) decides
        // whether to logout. Deleting the token on refresh failure caused
        // cascading auth failures when refresh cookies weren't available.

        // Return error with actual backend message, not generic "Session expired"
        return {
          success: false,
          data: null,
          message: refreshError?.response?.data?.message || 'Authentication failed. Please sign in again.',
          status: 401,
          errors: null,
        };
      }
    }

    // Default error handling for other status codes (or failed retries)
    const response = error.response;
    const resData = response?.data;
    return {
      success: false,
      data: null,
      message: resData?.message || error.message || 'Server connection failed. Please try again.',
      status: response ? response.status : 0,
      errors: resData?.errors || null,
    };
  }
);

/**
 * Convenience methods for HTTP calls.
 */
export const api = {
  get: (url, config = {}) => client.get(url, config),
  post: (url, data, config = {}) => client.post(url, data, config),
  put: (url, data, config = {}) => client.put(url, data, config),
  patch: (url, data, config = {}) => client.patch(url, data, config),
  delete: (url, config = {}) => client.delete(url, config),
};

export default client;