/**
 * Reusable constants for the backend application.
 */

const ROLES = Object.freeze({
  ADMIN: 'Admin',
  CUSTOMER: 'Customer',
});

const PRODUCT_STATUS = Object.freeze({
  DRAFT: 'Draft',
  PUBLISHED: 'Published',
  HIDDEN: 'Hidden',
  DELETED: 'Deleted',
});

const ORDER_STATUS = Object.freeze({
  PENDING: 'Pending',
  PAID: 'Paid',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
});

const CONTACT_STATUS = Object.freeze({
  PENDING: 'Pending',
  REVIEWED: 'Reviewed',
  RESOLVED: 'Resolved',
});

const HTTP_STATUS = Object.freeze({
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
});

module.exports = {
  ROLES,
  PRODUCT_STATUS,
  ORDER_STATUS,
  CONTACT_STATUS,
  HTTP_STATUS,
};
