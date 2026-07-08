const Coupon = require('../models/Coupon');

class CouponRepository {
  async findByCode(code) {
    return await Coupon.findOne({
      code: code.toUpperCase(),
      isActive: true,
    });
  }

  async create(couponData) {
    return await Coupon.create({
      ...couponData,
      code: couponData.code.toUpperCase(),
    });
  }

  async update(id, updateData) {
    if (updateData.code) {
      updateData.code = updateData.code.toUpperCase();
    }
    return await Coupon.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
  }

  async delete(id) {
    return await Coupon.findByIdAndDelete(id);
  }

  async findAll() {
    return await Coupon.find({}).sort({ expiryDate: -1 }).lean();
  }
}

module.exports = new CouponRepository();
