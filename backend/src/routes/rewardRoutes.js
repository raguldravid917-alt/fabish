const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const { getRewards } = require('../controllers/rewardController');

router.use(authenticate);

router.get('/', getRewards);

module.exports = router;
