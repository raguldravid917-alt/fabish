const cartService = require('../services/cartService');
const { HTTP_STATUS } = require('../constants');

class CartController {
  // @desc    Get user cart
  // @route   GET /api/cart
  // @access  Private
  async getCart(req, res, next) {
    try {
      const cart = await cartService.getCart(req.user._id);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: cart,
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Update item quantity in cart (Add / Remove if quantity is 0)
  // @route   PUT /api/cart
  // @access  Private
  async updateCartItem(req, res, next) {
    try {
      const { productId, quantity } = req.body;
      if (!productId || quantity === undefined) {
        res.status(HTTP_STATUS.BAD_REQUEST);
        throw new Error('Product ID and quantity are required');
      }

      const cart = await cartService.updateCartItem(req.user._id, productId, quantity);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Cart updated successfully',
        data: cart,
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Remove single item from cart
  // @route   DELETE /api/cart/:productId
  // @access  Private
  async removeCartItem(req, res, next) {
    try {
      const cart = await cartService.removeItem(req.user._id, req.params.productId);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Item removed from cart',
        data: cart,
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Clear entire cart
  // @route   DELETE /api/cart
  // @access  Private
  async clearCart(req, res, next) {
    try {
      const cart = await cartService.clearCart(req.user._id);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Cart cleared successfully',
        data: cart,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CartController();
