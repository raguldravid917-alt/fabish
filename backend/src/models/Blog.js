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
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Blog', blogSchema);
