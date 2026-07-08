const Cart = require('../models/Cart');

class CartRepository {
  async findByUser(userId) {
    let cart = await Cart.findOne({ user: userId }).populate('items.product');
    if (!cart) {
      cart = await Cart.create({ user: userId, items: [] });
    }
    return cart;
  }

  async updateItemQuantity(userId, productId, quantity) {
    const cart = await this.findByUser(userId);
    const existingItem = cart.items.find(
      (item) => item.product && item.product._id.toString() === productId.toString()
    );

    if (existingItem) {
      if (quantity <= 0) {
        cart.items = cart.items.filter(
          (item) => !item.product || item.product._id.toString() !== productId.toString()
        );
      } else {
        existingItem.quantity = quantity;
      }
    } else if (quantity > 0) {
      cart.items.push({ product: productId, quantity });
    }

    await cart.save();
    return await cart.populate('items.product');
  }

  async removeItem(userId, productId) {
    return await Cart.findOneAndUpdate(
      { user: userId },
      { $pull: { items: { product: productId } } },
      { new: true }
    ).populate('items.product');
  }

  async clear(userId) {
    return await Cart.findOneAndUpdate(
      { user: userId },
      { $set: { items: [] } },
      { new: true }
    );
  }
}

module.exports = new CartRepository();
