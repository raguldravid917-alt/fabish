import { api } from './client';
import { ENDPOINTS } from './endpoints';

export const orderService = {
  /**
   * Create a new COD order.
   * @param {object} orderData - Order details
   * @returns {Promise<{ success, data, message }>}
   */
  create: (orderData) =>
    api.post(ENDPOINTS.ORDERS, orderData, { auth: true }),

  /**
   * Create a Razorpay Order payload.
   * @param {object} orderData - Order details
   * @returns {Promise<{ success, data, message }>}
   */
  createRazorpayOrder: (orderData) =>
    api.post(`${ENDPOINTS.ORDERS}/razorpay`, orderData, { auth: true }),

  /**
   * Verify Razorpay Signature and save Order.
   * @param {object} payload - Razorpay payment details and order payload
   * @returns {Promise<{ success, data, message }>}
   */
  verifyPayment: (payload) =>
    api.post(`${ENDPOINTS.ORDERS}/verify`, payload, { auth: true }),

  /**
   * Get all orders (admin only).
   * @returns {Promise<{ success, data, message }>}
   */
  getAll: () =>
    api.get(ENDPOINTS.ORDERS, { auth: true }),

  /**
   * Get logged in user's orders.
   * @returns {Promise<{ success, data, message }>}
   */
  getMyOrders: () =>
    api.get(`${ENDPOINTS.ORDERS}/myorders`, { auth: true }),

  /**
   * Get an order by ID.
   * @param {string} id - Order ID
   * @returns {Promise<{ success, data, message }>}
   */
  getOrderById: (id) =>
    api.get(ENDPOINTS.ORDER_BY_ID(id), { auth: true }),

  /**
   * Update order status (admin only).
   * @param {string} id - Order ID
   * @param {string} status - New order status
   * @returns {Promise<{ success, data, message }>}
   */
  updateStatus: (id, status) =>
    api.put(`${ENDPOINTS.ORDERS}/${id}/status`, { status }, { auth: true }),

  /**
   * Mark an order as paid (legacy mock).
   * @param {string} id - Order ID
   * @returns {Promise<{ success, data, message }>}
   */
  markPaid: (id) =>
    api.put(ENDPOINTS.ORDER_PAY(id), null, { auth: true }),

  /**
   * Mark an order as delivered (admin only).
   * @param {string} id - Order ID
   * @returns {Promise<{ success, data, message }>}
   */
  markDelivered: (id) =>
    api.put(ENDPOINTS.ORDER_DELIVER(id), null, { auth: true }),

  /**
   * Get tracking information by tracking number or order number.
   * @param {string} trackingNumberOrOrderNumber
   * @returns {Promise<{ success, data, message }>}
   */
  getTracking: (trackingNumberOrOrderNumber) =>
    api.get(`${ENDPOINTS.ORDERS}/track/${trackingNumberOrOrderNumber}`, { auth: false }),
};
