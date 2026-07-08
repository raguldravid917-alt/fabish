const express = require('express');
const router = express.Router();
const couponController = require('../controllers/couponController');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const { ROLES } = require('../constants');

// Apply auth to all coupon endpoints
router.use(authenticate);

// Public/Customer endpoints (Apply coupon)
router.post('/apply', couponController.applyCoupon);

// Admin-only endpoints
router.use(authorize(ROLES.ADMIN));

router.route('/')
  .get(couponController.getCoupons)
  .post(couponController.createCoupon);

router.route('/:id')
  .put(couponController.updateCoupon)
  .delete(couponController.deleteCoupon);

module.exports = router;
