const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const {
  recordView,
  getRecentlyViewed,
  clearRecentlyViewed,
} = require('../controllers/recentlyViewedController');

router.use(authenticate);

router.post('/', recordView);
router.get('/', getRecentlyViewed);
router.delete('/', clearRecentlyViewed);

module.exports = router;
