const reviewService = require('../services/reviewService');
const { HTTP_STATUS } = require('../constants');

class ReviewController {
  // @desc    Get all reviews (admin moderation)
  // @route   GET /api/reviews
  // @access  Private/Admin
  async getReviews(req, res, next) {
    try {
      const reviews = await reviewService.getReviews();
      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: reviews,
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Get all reviews for a product
  // @route   GET /api/reviews/product/:productId
  // @access  Public
  async getProductReviews(req, res, next) {
    try {
      const reviews = await reviewService.getProductReviews(req.params.productId);
      res.status(HTTP_STATUS.OK).json(reviews);
    } catch (error) {
      next(error);
    }
  }

  // @desc    Submit a new review
  // @route   POST /api/reviews
  // @access  Private
  async createReview(req, res, next) {
    try {
      const review = await reviewService.createReview(
        req.user._id,
        req.user.name,
        req.body
      );
      res.status(HTTP_STATUS.CREATED).json(review);
    } catch (error) {
      res.status(HTTP_STATUS.BAD_REQUEST);
      next(error);
    }
  }

  // @desc    Delete a review
  // @route   DELETE /api/reviews/:id
  // @access  Private
  async deleteReview(req, res, next) {
    try {
      await reviewService.deleteReview(
        req.params.id,
        req.user._id,
        req.user.isAdmin
      );
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Review deleted successfully',
      });
    } catch (error) {
      res.status(HTTP_STATUS.BAD_REQUEST);
      next(error);
    }
  }
}

module.exports = new ReviewController();
