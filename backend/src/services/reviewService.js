const reviewRepository = require('../repositories/reviewRepository');
const productRepository = require('../repositories/productRepository');

class ReviewService {
  async getProductReviews(productId) {
    return await reviewRepository.findByProduct(productId);
  }

  async getReviews() {
    return await reviewRepository.findAll();
  }

  async createReview(userId, name, reviewData) {
    const { product: productId, rating, comment } = reviewData;

    // Create the review
    const review = await reviewRepository.create({
      product: productId,
      user: userId,
      name,
      rating: Number(rating),
      comment,
    });

    // Recalculate average ratings and reviewsCount for the product
    await this.updateProductStats(productId);

    return review;
  }

  async deleteReview(id, userId, isAdmin) {
    const review = await reviewRepository.findById(id);
    if (!review) {
      throw new Error('Review not found');
    }

    // Auth guard: only creator or admin can delete
    if (review.user.toString() !== userId.toString() && !isAdmin) {
      throw new Error('Not authorized to delete this review');
    }

    await reviewRepository.delete(id);
    await this.updateProductStats(review.product);

    return true;
  }

  async updateProductStats(productId) {
    const stats = await reviewRepository.getAverageRating(productId);
    
    if (stats && stats.length > 0) {
      const { averageRating, count } = stats[0];
      await productRepository.update(productId, {
        ratings: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
        reviewsCount: count,
      });
    } else {
      await productRepository.update(productId, {
        ratings: 0.0,
        reviewsCount: 0,
      });
    }
  }
}

module.exports = new ReviewService();
