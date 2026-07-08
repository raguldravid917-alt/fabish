const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Please add a coupon code'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    discountType: {
      type: String,
      required: true,
      enum: ['Percentage', 'Fixed'],
      default: 'Percentage',
    },
    discountValue: {
      type: Number,
      required: [true, 'Please specify discount value'],
      min: [0, 'Discount value cannot be negative'],
    },
    expiryDate: {
      type: Date,
      required: [true, 'Please specify expiry date'],
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Method to validate if coupon is currently usable
couponSchema.methods.isValid = function () {
  return this.isActive && new Date() < this.expiryDate;
};

module.exports = mongoose.model('Coupon', couponSchema);
