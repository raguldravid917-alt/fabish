const cartRepository = require('../repositories/cartRepository');

class CartService {
  async getCart(userId) {
    return await cartRepository.findByUser(userId);
  }

  async updateCartItem(userId, productId, quantity) {
    return await cartRepository.updateItemQuantity(userId, productId, quantity);
  }

  async removeItem(userId, productId) {
    return await cartRepository.removeItem(userId, productId);
  }

  async clearCart(userId) {
    return await cartRepository.clear(userId);
  }
}

module.exports = new CartService();
