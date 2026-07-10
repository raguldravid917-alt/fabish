const Coupon = require('../models/Coupon');

class CouponRepository {
  async findByCode(code) {
    return await Coupon.findOne({
      code: code.toUpperCase(),
      isActive: true,
      isDeleted: false,
    });
  }

  async create(couponData) {
    let expiryDate = couponData.expiryDate;
    if (expiryDate) {
      const exp = new Date(expiryDate);
      exp.setUTCHours(23, 59, 59, 999);
      expiryDate = exp;
    }

    const isFreeShipping = couponData.discountType === 'FreeShipping';
    const val = isFreeShipping ? 0 : (couponData.discountValue !== undefined ? couponData.discountValue : couponData.discountPercentage);
    const pct = isFreeShipping ? 0 : (couponData.discountPercentage !== undefined ? couponData.discountPercentage : couponData.discountValue);

    return await Coupon.create({
      ...couponData,
      discountValue: val,
      discountPercentage: pct,
      code: couponData.code.toUpperCase(),
      expiryDate,
    });
  }

  async update(id, updateData) {
    if (updateData.code) {
      updateData.code = updateData.code.toUpperCase();
    }
    
    if (updateData.expiryDate) {
      const exp = new Date(updateData.expiryDate);
      exp.setUTCHours(23, 59, 59, 999);
      updateData.expiryDate = exp;
    }

    const isFreeShipping = updateData.discountType === 'FreeShipping';
    if (isFreeShipping) {
      updateData.discountValue = 0;
      updateData.discountPercentage = 0;
    } else {
      const val = updateData.discountValue !== undefined ? updateData.discountValue : updateData.discountPercentage;
      const pct = updateData.discountPercentage !== undefined ? updateData.discountPercentage : updateData.discountValue;
      if (val !== undefined) updateData.discountValue = val;
      if (pct !== undefined) updateData.discountPercentage = pct;
    }

    return await Coupon.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
  }

  async delete(id) {
    return await Coupon.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
  }

  async findAll() {
    return await Coupon.find({ isDeleted: false }).sort({ expiryDate: -1 }).lean();
  }
}

module.exports = new CouponRepository();
