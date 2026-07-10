import { api } from './client';

export const addressService = {
  /**
   * Fetch all saved addresses for the logged-in user.
   * @returns {Promise<{ success, data, message }>}
   */
  getAddresses: () =>
    api.get('/addresses', { auth: true }),

  /**
   * Fetch a specific address by ID.
   * @param {string} id
   * @returns {Promise<{ success, data, message }>}
   */
  getAddressById: (id) =>
    api.get(`/addresses/${id}`, { auth: true }),

  /**
   * Create a new address entry.
   * @param {object} addressData
   * @returns {Promise<{ success, data, message }>}
   */
  createAddress: (addressData) =>
    api.post('/addresses', addressData, { auth: true }),

  /**
   * Update an existing address.
   * @param {string} id
   * @param {object} addressData
   * @returns {Promise<{ success, data, message }>}
   */
  updateAddress: (id, addressData) =>
    api.put(`/addresses/${id}`, addressData, { auth: true }),

  /**
   * Delete an address entry.
   * @param {string} id
   * @returns {Promise<{ success, data, message }>}
   */
  deleteAddress: (id) =>
    api.delete(`/addresses/${id}`, { auth: true }),

  /**
   * Set an address as the default.
   * @param {string} id
   * @returns {Promise<{ success, data, message }>}
   */
  setDefaultAddress: (id) =>
    api.patch(`/addresses/${id}/default`, {}, { auth: true }),
};
