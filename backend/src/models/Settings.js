const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    storeName: {
      type: String,
      default: 'Fabish Cosmetics Store',
      trim: true,
    },
    storeEmail: {
      type: String,
      default: 'contact@fabish.com',
      trim: true,
    },
    shippingRate: {
      type: Number,
      default: 1000,
    },
    taxPercent: {
      type: Number,
      default: 18,
    },
    sandbox: {
      type: Boolean,
      default: true,
    },
    trackingProvider: {
      type: String,
      default: 'Delhivery',
      enum: ['None', 'Delhivery', 'FedEx', 'DHL', 'Custom'],
    },
    trackingEnabled: {
      type: Boolean,
      default: true,
    },
    customTrackingMsg: {
      type: String,
      default: 'Your package is in transit with Fabish Express.',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Settings', settingsSchema);
