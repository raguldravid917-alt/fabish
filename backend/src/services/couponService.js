const couponRepository = require('../repositories/couponRepository');

class CouponService {
  async getCouponByCode(code) {
    const coupon = await couponRepository.findByCode(code);
    if (!coupon) {
      throw new Error('Coupon code is invalid or inactive');
    }
    if (!coupon.isValid()) {
      throw new Error('Coupon code has expired or usage limit reached');
    }
    return coupon;
  }

  async createCoupon(couponData) {
    return await couponRepository.create(couponData);
  }

  async getCoupons() {
    return await couponRepository.findAll();
  }

  async getPublicCoupons() {
    const coupons = await couponRepository.findAll();
    const now = new Date();
    return coupons.filter(c => {
      const exp = new Date(c.expiryDate);
      if (exp.getUTCHours() === 0 && exp.getUTCMinutes() === 0) {
        exp.setUTCHours(23, 59, 59, 999);
      }
      const isActive = c.isActive && !c.isDeleted;
      const isUsageLimitValid = c.usageLimit === null || c.usageLimit === undefined || c.usedCount < c.usageLimit;
      return isActive && isUsageLimitValid && now <= exp;
    });
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
