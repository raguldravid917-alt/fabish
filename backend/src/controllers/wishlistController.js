const wishlistService = require('../services/wishlistService');
const { HTTP_STATUS } = require('../constants');

class WishlistController {
  // @desc    Get current user's wishlist
  // @route   GET /api/wishlist
  // @access  Private
  async getWishlist(req, res, next) {
    try {
      const wishlist = await wishlistService.getWishlist(req.user._id);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: wishlist,
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Toggle product in wishlist (Add/Remove)
  // @route   POST /api/wishlist/toggle
  // @access  Private
  async toggleWishlist(req, res, next) {
    try {
      const { productId } = req.body;
      if (!productId) {
        res.status(HTTP_STATUS.BAD_REQUEST);
        throw new Error('Product ID is required');
      }

      const wishlist = await wishlistService.toggleWishlist(req.user._id, productId);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Wishlist updated successfully',
        data: wishlist,
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Clear entire wishlist
  // @route   DELETE /api/wishlist
  // @access  Private
  async clearWishlist(req, res, next) {
    try {
      const wishlist = await wishlistService.clearWishlist(req.user._id);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Wishlist cleared successfully',
        data: wishlist,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new WishlistController();
