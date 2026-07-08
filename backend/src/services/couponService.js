const couponRepository = require('../repositories/couponRepository');

class CouponService {
  async getCouponByCode(code) {
    const coupon = await couponRepository.findByCode(code);
    if (!coupon) {
      throw new Error('Coupon code is invalid or inactive');
    }
    if (!coupon.isValid()) {
      throw new Error('Coupon code has expired');
    }
    return coupon;
  }

  async createCoupon(couponData) {
    return await couponRepository.create(couponData);
  }

  async getCoupons() {
    return await couponRepository.findAll();
  }

  async updateCoupon(id, updateData) {
    const coupon = await couponRepository.update(id, updateData);
    if (!coupon) {
      throw new Error('Coupon not found');
    }
    return coupon;
  }

  async deleteCoupon(id) {
    const coupon = await couponRepository.delete(id);
    if (!coupon) {
      throw new Error('Coupon not found');
    }
    return coupon;
  }
}

module.exports = new CouponService();
