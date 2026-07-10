const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    fullName: {
      type: String,
      required: [true, 'Please add a full name'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Please add a phone number'],
      trim: true,
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
    landmark: {
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
      required: [true, 'Please add a state'],
      trim: true,
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
    addressType: {
      type: String,
      enum: ['Home', 'Office', 'Other'],
      default: 'Home',
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

// Add index on user and isDefault to speed up looking up the user's default address
addressSchema.index({ user: 1, isDefault: -1 });

module.exports = mongoose.model('Address', addressSchema);
