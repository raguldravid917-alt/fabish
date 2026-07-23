const User = require('../models/User');
const RewardTransaction = require('../models/RewardTransaction');

// @desc    Get logged in user's reward points balance and history
// @route   GET /api/rewards
// @access  Private
const getRewards = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('rewardPoints role name email createdAt').lean();
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const transactions = await RewardTransaction.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    const points = user.rewardPoints || 0;
    const tier = points > 1000 ? 'Gold' : points > 300 ? 'Silver' : 'Bronze';

    return res.status(200).json({
      success: true,
      data: {
        points,
        tier,
        transactions,
      },
    });
  } catch (error) {
    console.error('[RewardController] Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch rewards' });
  }
};

module.exports = {
  getRewards,
};
