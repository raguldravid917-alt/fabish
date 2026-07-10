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
      enum: ['Percentage', 'Fixed', 'FreeShipping'],
      default: 'Percentage',
    },
    discountValue: {
      type: Number,
      required: [true, 'Please specify discount value'],
      min: [0, 'Discount value cannot be negative'],
    },
    discountPercentage: {
      type: Number,
      min: [0, 'Discount percentage cannot be negative'],
      max: [100, 'Discount percentage cannot exceed 100'],
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
    minimumOrderAmount: {
      type: Number,
      default: 0,
      min: [0, 'Minimum order amount cannot be negative'],
    },
    usageLimit: {
      type: Number,
      default: null,
    },
    usedCount: {
      type: Number,
      default: 0,
      min: [0, 'Used count cannot be negative'],
    },
    maxDiscountCap: {
      type: Number,
      default: null,
      min: [0, 'Max discount cap cannot be negative'],
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Method to validate if coupon is currently usable
couponSchema.methods.isValid = function () {
  if (!this.isActive || this.isDeleted) return false;

  const now = new Date();

  // Set expiry date to end of that day (23:59:59.999) to prevent timezone mismatches
  const exp = new Date(this.expiryDate);
  if (exp.getUTCHours() === 0 && exp.getUTCMinutes() === 0) {
    exp.setUTCHours(23, 59, 59, 999);
  }

  // Check usage limit
  if (this.usageLimit !== null && this.usageLimit !== undefined && this.usedCount >= this.usageLimit) {
    return false;
  }

  return now <= exp;
};

module.exports = mongoose.model('Coupon', couponSchema);
