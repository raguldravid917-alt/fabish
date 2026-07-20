const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a blog title'],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    content: {
      type: String,
      required: [true, 'Please add blog content'],
    },
    excerpt: {
      type: String,
      default: '',
      maxlength: [500, 'Excerpt cannot exceed 500 characters'],
    },
    author: {
      type: String,
      required: true,
      default: 'Admin',
    },
    image: {
      type: String,
      default: '',
    },
    tags: {
      type: [String],
      default: [],
    },
    category: {
      type: String,
      default: 'General',
      trim: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    readTime: {
      type: Number,  // in minutes
      default: 0,
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
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Text index for full-text search
blogSchema.index({ title: 'text', excerpt: 'text', content: 'text' });
blogSchema.index({ category: 1, date: -1 });
blogSchema.index({ featured: 1, date: -1 });

module.exports = mongoose.model('Blog', blogSchema);

