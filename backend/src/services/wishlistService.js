const wishlistRepository = require('../repositories/wishlistRepository');

class WishlistService {
  async getWishlist(userId) {
    return await wishlistRepository.findByUser(userId);
  }

  async toggleWishlist(userId, productId) {
    const wishlist = await wishlistRepository.findByUser(userId);
    const exists = wishlist.products.some(
      (p) => p && p._id.toString() === productId.toString()
    );

    if (exists) {
      return await wishlistRepository.removeProduct(userId, productId);
    } else {
      return await wishlistRepository.addProduct(userId, productId);
    }
  }

  async clearWishlist(userId) {
    return await wishlistRepository.clear(userId);
  }
}

module.exports = new WishlistService();
