const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { authenticate } = require('../middleware/authMiddleware');

router.use(authenticate);

router.route('/')
  .get(cartController.getCart)
  .put(cartController.updateCartItem)
  .delete(cartController.clearCart);

router.delete('/:productId', cartController.removeCartItem);

module.exports = router;
