const mongoose = require('mongoose');

/**
 * Flexible key-value field schema for storing dynamic form responses.
 * Each partnership type can collect different fields.
 */
const formFieldSchema = new mongoose.Schema(
  {
    key: { type: String, required: true },
    label: { type: String, required: true },
    value: { type: String, default: '' },
  },
  { _id: false }
);

const partnerApplicationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: [true, 'Partnership type is required'],
      enum: ['Distributor', 'Wholesale', 'Influencer', 'Affiliate', 'Vendor'],
    },
    businessName: {
      type: String,
      required: [true, 'Business/Brand name is required'],
      trim: true,
    },
    contactName: {
      type: String,
      required: [true, 'Contact name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    website: {
      type: String,
      trim: true,
      default: '',
    },
    message: {
      type: String,
      default: '',
      maxlength: [3000, 'Message cannot exceed 3000 characters'],
    },
    // Stores type-specific dynamic form field responses
    dynamicFields: {
      type: [formFieldSchema],
      default: [],
    },
    status: {
      type: String,
      enum: ['Pending', 'Under Review', 'Approved', 'Rejected'],
      default: 'Pending',
    },
    adminNotes: {
      type: String,
      default: '',
    },
    reviewedBy: {
      type: String,
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

partnerApplicationSchema.index({ status: 1, createdAt: -1 });
partnerApplicationSchema.index({ type: 1 });
partnerApplicationSchema.index({ email: 1 });

module.exports = mongoose.model('PartnerApplication', partnerApplicationSchema);
