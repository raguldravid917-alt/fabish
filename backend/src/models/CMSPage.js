const mongoose = require('mongoose');

const versionHistorySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, default: '' },
    updatedBy: { type: String, default: 'Admin' },
    updatedAt: { type: Date, default: Date.now },
    version: { type: Number, required: true },
  },
  { _id: true }
);

const cmsPageSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    content: {
      type: String,
      default: '',
    },
    metaTitle: {
      type: String,
      default: '',
      trim: true,
    },
    metaDescription: {
      type: String,
      default: '',
      trim: true,
    },
    // Stores previous versions before each update (most recent last)
    versionHistory: {
      type: [versionHistorySchema],
      default: [],
    },
    currentVersion: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('CMSPage', cmsPageSchema);
