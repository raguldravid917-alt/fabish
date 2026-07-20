const mongoose = require('mongoose');

const socialLinksSchema = new mongoose.Schema(
  {
    linkedin: { type: String, default: '' },
    twitter: { type: String, default: '' },
    instagram: { type: String, default: '' },
    website: { type: String, default: '' },
  },
  { _id: false }
);

const teamMemberSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    role: {
      type: String,
      required: [true, 'Role is required'],
      trim: true,
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
    },
    bio: {
      type: String,
      default: '',
      maxlength: [1000, 'Bio cannot exceed 1000 characters'],
    },
    image: {
      type: String,
      default: '',
    },
    imagePublicId: {
      type: String,
      default: '',
    },
    socialLinks: {
      type: socialLinksSchema,
      default: () => ({}),
    },
    // Display order (lower = displayed first)
    order: {
      type: Number,
      default: 0,
    },
    // Featured = Leadership section
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

teamMemberSchema.index({ department: 1, order: 1 });
teamMemberSchema.index({ isFeatured: 1, order: 1 });
teamMemberSchema.index({ isActive: 1 });

module.exports = mongoose.model('TeamMember', teamMemberSchema);
