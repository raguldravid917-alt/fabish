const mongoose = require('mongoose');
const Review = require('../models/Review');

class ReviewRepository {
  async findByProduct(productId) {
    return await Review.find({ product: productId })
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .lean();
  }

  async create(reviewData) {
    return await Review.create(reviewData);
  }

  async delete(id) {
    return await Review.findByIdAndDelete(id);
  }

  async findById(id) {
    return await Review.findById(id).lean();
  }

  async getAverageRating(productId) {
    const targetId = typeof productId === 'string' ? new mongoose.Types.ObjectId(productId) : productId;
    return await Review.aggregate([
      { $match: { product: targetId } },
      {
        $group: {
          _id: '$product',
          averageRating: { $avg: '$rating' },
          count: { $sum: 1 },
        },
      },
    ]);
  }
}

module.exports = new ReviewRepository();
