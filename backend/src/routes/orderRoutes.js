const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { createOrderRules } = require('../validators/orderValidator');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const { ROLES } = require('../constants');

// Apply authentication to all order routes
router.use(authenticate);

// Customer routes
router.post('/', createOrderRules, orderController.createOrder);
router.post('/razorpay', createOrderRules, orderController.createRazorpayOrder);
router.post('/verify', orderController.verifyRazorpayPayment);
router.get('/myorders', orderController.getMyOrders);
router.route('/:id')
  .get(orderController.getOrderById);
router.get('/:id/invoice', orderController.getOrderInvoice);
router.put('/:id/pay', orderController.payOrder);

// Admin only routes
router.get('/stats', authorize(ROLES.ADMIN), orderController.getStats);
router.put('/:id/deliver', authorize(ROLES.ADMIN), orderController.deliverOrder);
router.put('/:id/status', authorize(ROLES.ADMIN), orderController.updateOrderStatus);
router.get('/', authorize(ROLES.ADMIN), orderController.getAllOrders);

module.exports = router;
