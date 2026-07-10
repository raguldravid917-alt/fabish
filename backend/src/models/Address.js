const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    addressLine1: {
      type: String,
      required: [true, 'Please add address line 1'],
      trim: true,
    },
    addressLine2: {
      type: String,
      trim: true,
      default: '',
    },
    city: {
      type: String,
      required: [true, 'Please add a city'],
      trim: true,
    },
    state: {
      type: String,
      trim: true,
      default: '',
    },
    postalCode: {
      type: String,
      required: [true, 'Please add a postal code'],
      trim: true,
    },
    country: {
      type: String,
      required: [true, 'Please add a country'],
      trim: true,
      default: 'India',
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Address', addressSchema);
