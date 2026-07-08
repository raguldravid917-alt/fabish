const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController');
const { authenticate } = require('../middleware/authMiddleware');

router.use(authenticate);

router.route('/')
  .get(wishlistController.getWishlist)
  .delete(wishlistController.clearWishlist);

router.post('/toggle', wishlistController.toggleWishlist);

module.exports = router;
