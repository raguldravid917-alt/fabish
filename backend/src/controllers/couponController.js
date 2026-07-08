const couponService = require('../services/couponService');
const { HTTP_STATUS } = require('../constants');

class CouponController {
  // @desc    Apply coupon code
  // @route   POST /api/coupons/apply
  // @access  Private
  async applyCoupon(req, res, next) {
    try {
      const { code } = req.body;
      if (!code) {
        res.status(HTTP_STATUS.BAD_REQUEST);
        throw new Error('Coupon code is required');
      }

      const coupon = await couponService.getCouponByCode(code);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Coupon applied successfully',
        data: coupon,
      });
    } catch (error) {
      res.status(HTTP_STATUS.BAD_REQUEST);
      next(error);
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

  // @desc    Create new coupon (admin only)
  // @route   POST /api/coupons
  // @access  Private/Admin
  async createCoupon(req, res, next) {
    try {
      const coupon = await couponService.createCoupon(req.body);
      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: 'Coupon created successfully',
        data: coupon,
      });
    } catch (error) {
      res.status(HTTP_STATUS.BAD_REQUEST);
      next(error);
    }
  }

  // @desc    Update coupon (admin only)
  // @route   PUT /api/coupons/:id
  // @access  Private/Admin
  async updateCoupon(req, res, next) {
    try {
      const coupon = await couponService.updateCoupon(req.params.id, req.body);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Coupon updated successfully',
        data: coupon,
      });
    } catch (error) {
      res.status(HTTP_STATUS.BAD_REQUEST);
      next(error);
    }
  }

  // @desc    Delete coupon (admin only)
  // @route   DELETE /api/coupons/:id
  // @access  Private/Admin
  async deleteCoupon(req, res, next) {
    try {
      await couponService.deleteCoupon(req.params.id);
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
