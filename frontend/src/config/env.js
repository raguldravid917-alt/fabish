/**
 * Centralized environment configuration.
 * Single source of truth for all environment variables.
 * Eliminates duplicated `import.meta.env.VITE_API_URL` across 5+ files.
 */

export const ENV = Object.freeze({
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  NODE_ENV: import.meta.env.MODE || 'development',
  IS_DEV: import.meta.env.DEV,
  IS_PROD: import.meta.env.PROD,
});
