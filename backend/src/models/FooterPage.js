const mongoose = require('mongoose');

/**
 * FooterPage — CMS model for all footer-managed pages.
 * Supports full lifecycle: draft → published → archived → soft-deleted.
 */
const footerPageSchema = new mongoose.Schema(
  {
    /* ── Core Content ─────────────────────────────────────────── */
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title must not exceed 200 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: [200, 'Slug must not exceed 200 characters'],
      index: true,
    },
    shortDescription: {
      type: String,
      default: '',
      trim: true,
      maxlength: [500, 'Short description must not exceed 500 characters'],
    },
    content: {
      type: String,
      default: '',
    },

    /* ── Images ───────────────────────────────────────────────── */
    featuredImage: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
      alt: { type: String, default: '' },
    },
    bannerImage: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
      alt: { type: String, default: '' },
    },

    /* ── SEO ──────────────────────────────────────────────────── */
    seoTitle: {
      type: String,
      default: '',
      trim: true,
      maxlength: [70, 'SEO title must not exceed 70 characters'],
    },
    seoDescription: {
      type: String,
      default: '',
      trim: true,
      maxlength: [160, 'SEO description must not exceed 160 characters'],
    },
    seoKeywords: {
      type: [String],
      default: [],
    },

    /* ── Status & Visibility ──────────────────────────────────── */
    status: {
      type: String,
      enum: {
        values: ['Published', 'Draft', 'Archived'],
        message: 'Status must be Published, Draft, or Archived',
      },
      default: 'Draft',
      index: true,
    },
    showInFooter: {
      type: Boolean,
      default: true,
      index: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
      index: true,
    },
    publishedDate: {
      type: Date,
      default: null,
    },

    /* ── Soft Delete ──────────────────────────────────────────── */
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },

    /* ── Audit ────────────────────────────────────────────────── */
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/* ── Virtual: canonical URL path ─────────────────────────────── */
footerPageSchema.virtual('url').get(function () {
  return `/pages/${this.slug}`;
});

/* ── Compound indexes for common query patterns ───────────────── */
footerPageSchema.index({ status: 1, showInFooter: 1, isDeleted: 1, displayOrder: 1 });
footerPageSchema.index({ isDeleted: 1, createdAt: -1 });

/* ── Pre-save: sanitize slug ─────────────────────────────────── */
footerPageSchema.pre('save', function (next) {
  if (this.isModified('slug')) {
    this.slug = this.slug
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
  next();
});

module.exports = mongoose.model('FooterPage', footerPageSchema);
