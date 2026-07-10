const couponService = require('../services/couponService');
const { HTTP_STATUS } = require('../constants');

class CouponController {
  // @desc    Apply coupon code
  // @route   POST /api/coupons/apply
  // @access  Public
  async applyCoupon(req, res, next) {
    const { code, cartTotal } = req.body;
    try {
      if (!code) {
        res.status(HTTP_STATUS.BAD_REQUEST);
        throw new Error('Coupon code is required');
      }

      const coupon = await couponService.getCouponByCode(code);

      // Validate minimum purchase amount
      if (cartTotal !== undefined && coupon.minimumOrderAmount && cartTotal < coupon.minimumOrderAmount) {
        throw new Error(`Minimum purchase of Rs. ${coupon.minimumOrderAmount.toLocaleString('en-IN')} required to use this coupon`);
      }

      console.log(`[COUPON_APPLIED] Coupon applied successfully. Code: ${coupon.code.toUpperCase()}, DiscountType: ${coupon.discountType}, Discount: ${coupon.discountPercentage || coupon.discountValue}, User: ${req.user ? req.user._id : 'Guest'}`);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Coupon applied successfully',
        data: coupon,
      });
    } catch (error) {
      console.error(`[COUPON_VALIDATION_FAILED] Coupon validation failed. Code: ${code ? code.toUpperCase() : 'N/A'}, Reason: ${error.message}`);
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: error.message || 'Coupon validation failed',
      });
    }
  }

  // @desc    Get all coupons (admin only)
  // @route   GET /api/coupons
  // @access  Private/Admin
  async getCoupons(req, res, next) {
    try {
      const coupons = await couponService.getCoupons();
      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: coupons,
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Get public active coupons
  // @route   GET /api/coupons/public
  // @access  Public
  async getPublicCoupons(req, res, next) {
    try {
      const coupons = await couponService.getPublicCoupons();
      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: coupons,
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Create new coupon (admin only)
  // @route   POST /api/coupons
  // @access  Private/Admin
  async createCoupon(req, res, next) {
    try {
      console.log('DEBUG: Incoming coupon create request body:', req.body);
      const coupon = await couponService.createCoupon(req.body);
      console.log(`[COUPON_CREATED] Coupon created successfully. Code: ${coupon.code}, DiscountType: ${coupon.discountType}, Discount: ${coupon.discountPercentage || coupon.discountValue}`);
      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: 'Coupon created successfully',
        data: coupon,
      });
    } catch (error) {
      console.error('DEBUG: Coupon creation failed with error:', error.message, error.errors);
      res.status(HTTP_STATUS.BAD_REQUEST);
      next(error);
    }
  }

  // @desc    Update coupon (admin only)
  // @route   PUT /api/coupons/:id
  // @access  Private/Admin
  async updateCoupon(req, res, next) {
    try {
      console.log('DEBUG: Incoming coupon update request body:', req.body);
      const coupon = await couponService.updateCoupon(req.params.id, req.body);
      console.log(`[COUPON_UPDATED] Coupon updated successfully. ID: ${req.params.id}, Code: ${coupon.code}, DiscountType: ${coupon.discountType}, Discount: ${coupon.discountPercentage || coupon.discountValue}`);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Coupon updated successfully',
        data: coupon,
      });
    } catch (error) {
      console.error('DEBUG: Coupon update failed with error:', error.message, error.errors);
      res.status(HTTP_STATUS.BAD_REQUEST);
      next(error);
    }
  }

  // @desc    Delete coupon (admin only)
  // @route   DELETE /api/coupons/:id
  // @access  Private/Admin
  async deleteCoupon(req, res, next) {
    try {
      const coupon = await couponService.deleteCoupon(req.params.id);
      console.log(`[COUPON_DELETED] Coupon deleted successfully. ID: ${req.params.id}, Code: ${coupon ? coupon.code : 'unknown'}`);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Coupon deleted successfully',
      });
    } catch (error) {
      res.status(HTTP_STATUS.BAD_REQUEST);
      next(error);
    }
  }
}

module.exports = new CouponController();
