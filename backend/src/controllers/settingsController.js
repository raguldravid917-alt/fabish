const Settings = require('../models/Settings');
const { HTTP_STATUS } = require('../constants');

const settingsController = {
  /**
   * Get all settings (Admin only)
   */
  getSettings: async (req, res, next) => {
    try {
      let settings = await Settings.findOne();
      if (!settings) {
        settings = await Settings.create({});
      }
      res.status(HTTP_STATUS.OK || 200).json({
        success: true,
        data: settings,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update settings (Admin only)
   */
  updateSettings: async (req, res, next) => {
    try {
      let settings = await Settings.findOne();
      if (!settings) {
        settings = new Settings();
      }

      const {
        storeName,
        storeEmail,
        shippingRate,
        taxPercent,
        sandbox,
        trackingProvider,
        trackingEnabled,
        customTrackingMsg,
      } = req.body;

      if (storeName !== undefined) settings.storeName = storeName;
      if (storeEmail !== undefined) settings.storeEmail = storeEmail;
      if (shippingRate !== undefined) settings.shippingRate = Number(shippingRate);
      if (taxPercent !== undefined) settings.taxPercent = Number(taxPercent);
      if (sandbox !== undefined) settings.sandbox = Boolean(sandbox);
      if (trackingProvider !== undefined) settings.trackingProvider = trackingProvider;
      if (trackingEnabled !== undefined) settings.trackingEnabled = Boolean(trackingEnabled);
      if (customTrackingMsg !== undefined) settings.customTrackingMsg = customTrackingMsg;

      await settings.save();

      res.status(HTTP_STATUS.OK || 200).json({
        success: true,
        message: 'Settings updated successfully',
        data: settings,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get safe public settings (Public)
   */
  getPublicSettings: async (req, res, next) => {
    try {
      let settings = await Settings.findOne();
      if (!settings) {
        settings = await Settings.create({});
      }
      res.status(HTTP_STATUS.OK || 200).json({
        success: true,
        data: {
          storeName: settings.storeName,
          storeEmail: settings.storeEmail,
          shippingRate: settings.shippingRate,
          taxPercent: settings.taxPercent,
          trackingProvider: settings.trackingProvider,
          trackingEnabled: settings.trackingEnabled,
          customTrackingMsg: settings.customTrackingMsg,
        },
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = settingsController;
