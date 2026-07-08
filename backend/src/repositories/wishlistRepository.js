const Wishlist = require('../models/Wishlist');

class WishlistRepository {
  async findByUser(userId) {
    let wishlist = await Wishlist.findOne({ user: userId }).populate('products');
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: userId, products: [] });
    }
    return wishlist;
  }

  async addProduct(userId, productId) {
    return await Wishlist.findOneAndUpdate(
      { user: userId },
      { $addToSet: { products: productId } },
      { new: true, upsert: true }
    ).populate('products');
  }

  async removeProduct(userId, productId) {
    return await Wishlist.findOneAndUpdate(
      { user: userId },
      { $pull: { products: productId } },
      { new: true }
    ).populate('products');
  }

  async clear(userId) {
    return await Wishlist.findOneAndUpdate(
      { user: userId },
      { $set: { products: [] } },
      { new: true }
    );
  }
}

module.exports = new WishlistRepository();
