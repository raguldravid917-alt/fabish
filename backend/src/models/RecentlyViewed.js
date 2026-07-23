const mongoose = require('mongoose');

const recentlyViewedSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    viewedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index to prevent duplicate entries per user & product
recentlyViewedSchema.index({ user: 1, product: 1 }, { unique: true });
recentlyViewedSchema.index({ user: 1, viewedAt: -1 });

module.exports = mongoose.model('RecentlyViewed', recentlyViewedSchema);
