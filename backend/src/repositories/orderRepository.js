const Order = require('../models/Order');

class OrderRepository {
  async findById(id) {
    return await Order.findById(id).populate('user', 'name email').lean();
  }

  async findByUser(userId) {
    const User = require('../models/User');
    const userDoc = await User.findById(userId).select('email').lean();
    const conditions = [{ user: userId }];
    if (userDoc && userDoc.email) {
      conditions.push({ 'customerDetails.email': new RegExp(`^${userDoc.email}$`, 'i') });
    }
    return await Order.find({ $or: conditions }).sort({ createdAt: -1 }).lean();
  }

  async create(orderData) {
    return await Order.create(orderData);
  }

  async update(id, updateData) {
    return await Order.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
  }

  async findAll() {
    return await Order.find({})
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .lean();
  }

  async getSalesStats() {
    return await Order.aggregate([
      { $match: { isPaid: true } },
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$totalPrice' },
          count: { $sum: 1 },
        },
      },
    ]);
  }
}

module.exports = new OrderRepository();
