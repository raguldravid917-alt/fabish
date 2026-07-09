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

// Cache stores for GET requests
const activeRequests = new Map(); // key -> Promise
const responseCache = new Map();  // key -> { data, timestamp }
const CACHE_TTL = 10000;          // 10 seconds cache time-to-live

// Generate a unique cache key based on token, URL, params, and headers
const getCacheKey = (url, config = {}) => {
  const token = localStorage.getItem('token') || '';
  const paramsStr = config.params ? JSON.stringify(config.params) : '';
  const headersStr = config.headers ? JSON.stringify(config.headers) : '';
  return `${token}::${url}::${paramsStr}::${headersStr}`;
};

// Invalidate the cache (to be called on POST, PUT, DELETE, etc.)
export const invalidateApiCache = () => {
  responseCache.clear();
};

// Create Axios Instance
const client = axios.create({
  baseURL: ENV.API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Allow cookie exchanges (refresh tokens)
});

// Helper to determine if an endpoint requires authentication
const isProtectedEndpoint = (url) => {
  if (!url) return false;
  let cleanUrl = url.split('?')[0];
  if (!cleanUrl.startsWith('/')) {
    cleanUrl = '/' + cleanUrl;
  }

  const protectedPrefixes = [
    '/auth/me',
    '/auth/profile',
    '/auth/refresh',
    '/auth/logout',
    '/cart',
    '/wishlist',
    '/orders',
    '/addresses',
    '/users',
    '/admin',
    '/coupons',
  ];

  return protectedPrefixes.some((prefix) => cleanUrl === prefix || cleanUrl.startsWith(prefix + '/'));
};

// Request Interceptor to auto-attach Token and invalidate cache on mutations
client.interceptors.request.use(
  (config) => {
    // If it's a mutating request, clear cached responses to avoid stale data
    if (config.method && config.method.toLowerCase() !== 'get') {
      invalidateApiCache();
    }

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
      if (token === 'undefined' || token === 'null') {
        token = null;
      }
      if (!token) {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
          try {
            const parsed = JSON.parse(userInfo);
            token = parsed.token || parsed.accessToken;
            if (token === 'undefined' || token === 'null') {
              token = null;
            }
          } catch (err) {}
        }
      }

      // Guest User check: block requests to protected endpoints if no token exists
      if (isProtectedEndpoint(config.url) && !token) {
        const err = new Error('Authentication required');
        err.isUnauthorizedBlock = true;
        throw err;
      }

      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    } catch (e) {
      if (e.isUnauthorizedBlock) throw e;
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
    // If request was blocked by the guest firewall, return a normalized 401 response
    if (error.isUnauthorizedBlock) {
      return {
        success: false,
        data: null,
        message: 'Authentication required.',
        status: 401,
        errors: null,
      };
    }

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

      // Double-check if we have an active session token before trying to refresh.
      // Guest users without any session shouldn't make refresh requests.
      let token = localStorage.getItem('token');
      if (token === 'undefined' || token === 'null') {
        token = null;
      }
      if (!token) {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
          try {
            const parsed = JSON.parse(userInfo);
            token = parsed.token || parsed.accessToken;
            if (token === 'undefined' || token === 'null') {
              token = null;
            }
          } catch (err) {}
        }
      }
      if (!token) {
        return {
          success: false,
          data: null,
          message: 'No active session. Please log in again.',
          status: 401,
          errors: null,
        };
      }

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
 * Convenience methods for HTTP calls with caching and deduplication.
 */
export const api = {
  get: (url, config = {}) => {
    const key = getCacheKey(url, config);

    // 1. Check if we have a valid cached response
    const cached = responseCache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return Promise.resolve(cached.data);
    }

    // 2. Check if there is an active simultaneous request for the same resource
    if (activeRequests.has(key)) {
      return activeRequests.get(key);
    }

    // 3. Otherwise, perform the request and store the promise
    const promise = (async () => {
      try {
        const response = await client.get(url, config);
        // Only cache successful requests
        if (response && response.success) {
          responseCache.set(key, {
            data: response,
            timestamp: Date.now(),
          });
        }
        return response;
      } finally {
        // Clean up the active request once resolved/rejected
        activeRequests.delete(key);
      }
    })();

    activeRequests.set(key, promise);
    return promise;
  },
  post: (url, data, config = {}) => {
    invalidateApiCache();
    return client.post(url, data, config);
  },
  put: (url, data, config = {}) => {
    invalidateApiCache();
    return client.put(url, data, config);
  },
  patch: (url, data, config = {}) => {
    invalidateApiCache();
    return client.patch(url, data, config);
  },
  delete: (url, config = {}) => {
    invalidateApiCache();
    return client.delete(url, config);
  },
};

export default client;