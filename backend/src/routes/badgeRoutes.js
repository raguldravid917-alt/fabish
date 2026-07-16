const express = require('express');
const router = express.Router();
const Badge = require('../models/Badge');
const { HTTP_STATUS } = require('../constants');

// @desc    Get all available badges
// @route   GET /api/badges
// @access  Public
router.get('/', async (req, res, next) => {
  try {
    const badges = await Badge.find().sort({ name: 1 });
    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: badges,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
