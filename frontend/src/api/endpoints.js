/**
 * All API endpoint paths.
 * Single source of truth — no more scattered URL strings.
 */
export const ENDPOINTS = {
  // Auth
  AUTH_LOGIN: '/auth/login',
  AUTH_REGISTER: '/auth/register',
  AUTH_PROFILE: '/auth/profile',

  // Products
  PRODUCTS: '/products',
  PRODUCT_BY_SLUG: (slug) => `/products/slug/${slug}`,
  PRODUCT_BY_ID: (id) => `/products/${id}`,

  // Categories
  CATEGORIES: '/categories',

  // Badges
  BADGES: '/badges',

  // Orders
  ORDERS: '/orders',
  ORDER_BY_ID: (id) => `/orders/${id}`,
  ORDER_PAY: (id) => `/orders/${id}/pay`,
  ORDER_DELIVER: (id) => `/orders/${id}/deliver`,

  // Reviews
  REVIEWS: '/reviews',
  REVIEWS_BY_PRODUCT: (productId) => `/reviews/product/${productId}`,

  // Contact
  CONTACT: '/contact',

  // Users (Admin)
  USERS: '/users',
  USER_BY_ID: (id) => `/users/${id}`,
};
