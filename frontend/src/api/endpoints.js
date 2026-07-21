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

  // CMS
  CMS_PAGES: '/cms/pages',
  CMS_PAGE_BY_SLUG: (slug) => `/cms/pages/${slug}`,
  CMS_PAGE_VERSIONS: (slug) => `/cms/pages/${slug}/versions`,

  // Blogs / Latest News
  BLOGS: '/blogs',
  BLOG_BY_SLUG: (slug) => `/blogs/${slug}`,
  BLOG_CATEGORIES: '/blogs/categories',

  // Support Tickets
  SUPPORT_TICKETS: '/support',
  SUPPORT_MY_TICKETS: '/support/my-tickets',
  SUPPORT_STATS: '/support/stats',
  SUPPORT_TICKET_BY_ID: (id) => `/support/${id}`,
  SUPPORT_TICKET_STATUS: (id) => `/support/${id}/status`,

  // Team
  TEAM: '/team',
  TEAM_ADMIN: '/team/admin',
  TEAM_MEMBER_BY_ID: (id) => `/team/${id}`,

  // Partnerships
  PARTNERSHIPS: '/partnerships',
  PARTNERSHIP_TYPES: '/partnerships/types',
  PARTNERSHIP_APPLY: '/partnerships/apply',
  PARTNERSHIP_BY_ID: (id) => `/partnerships/${id}`,
  PARTNERSHIP_STATUS: (id) => `/partnerships/${id}/status`,

  // Footer Pages CMS — Public
  FOOTER_PAGES_PUBLIC: '/footer-pages/public',
  FOOTER_PAGE_BY_SLUG: (slug) => `/footer-pages/slug/${slug}`,

  // Footer Pages CMS — Admin
  ADMIN_FOOTER_PAGES: '/admin/footer-pages',
  ADMIN_FOOTER_PAGE_BY_ID: (id) => `/admin/footer-pages/${id}`,
  ADMIN_FOOTER_PAGE_TOGGLE_STATUS: (id) => `/admin/footer-pages/${id}/toggle-status`,
  ADMIN_FOOTER_PAGE_TOGGLE_FOOTER: (id) => `/admin/footer-pages/${id}/toggle-footer`,
  ADMIN_FOOTER_PAGE_DUPLICATE: (id) => `/admin/footer-pages/${id}/duplicate`,
  ADMIN_FOOTER_PAGE_RESTORE: (id) => `/admin/footer-pages/${id}/restore`,
  ADMIN_FOOTER_PAGE_HARD_DELETE: (id) => `/admin/footer-pages/${id}/hard`,
  ADMIN_FOOTER_PAGES_REORDER: '/admin/footer-pages/reorder',
  ADMIN_FOOTER_PAGES_BULK: '/admin/footer-pages/bulk',
};
