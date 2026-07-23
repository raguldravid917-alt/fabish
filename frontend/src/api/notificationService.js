import { api } from './client';

export const notificationService = {
  /**
   * Get logged-in user's notifications.
   * @returns {Promise<{ success, data, unreadCount }>}
   */
  getNotifications: () =>
    api.get('/notifications', { auth: true }),

  /**
   * Get unread notification count.
   * @returns {Promise<{ success, unreadCount }>}
   */
  getUnreadCount: () =>
    api.get('/notifications/unread-count', { auth: true }),

  /**
   * Mark single notification as read.
   * @param {string} id
   * @returns {Promise<{ success, data }>}
   */
  markAsRead: (id) =>
    api.patch(`/notifications/${id}/read`, {}, { auth: true }),

  /**
   * Mark all notifications as read.
   * @returns {Promise<{ success, message }>}
   */
  markAllAsRead: () =>
    api.patch('/notifications/read-all', {}, { auth: true }),
};
