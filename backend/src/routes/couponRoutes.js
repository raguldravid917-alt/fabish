const express = require('express');
const router = express.Router();
const couponController = require('../controllers/couponController');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const { ROLES } = require('../constants');

// Public/Customer endpoints (no authentication required)
router.post('/apply', couponController.applyCoupon);
router.get('/public', couponController.getPublicCoupons);

// Admin-only endpoints (requires authentication and admin role)
router.use(authenticate);
router.use(authorize(ROLES.ADMIN));

router.route('/')
  .get(couponController.getCoupons)
  .post(couponController.createCoupon);

router.route('/:id')
  .put(couponController.updateCoupon)
  .delete(couponController.deleteCoupon);

module.exports = router;
