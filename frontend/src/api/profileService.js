import { api } from './client';

export const profileService = {
  /**
   * Update the user profile text details (name, email, phone, password).
   * @param {object} profileData
   * @returns {Promise<{ success, data, message }>}
   */
  updateProfile: (profileData) =>
    api.put('/profile', profileData, { auth: true }),

  /**
   * Upload or change the user profile picture.
   * @param {File} file
   * @returns {Promise<{ success, data, message }>}
   */
  uploadPhoto: (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return api.put('/profile/photo', formData, { auth: true });
  },

  /**
   * Remove the user profile picture.
   * @returns {Promise<{ success, data, message }>}
   */
  removePhoto: () =>
    api.delete('/profile/photo', { auth: true }),
};
