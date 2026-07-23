const RecentlyViewed = require('../models/RecentlyViewed');
const Product = require('../models/Product');

// @desc    Record product view for logged-in user
// @route   POST /api/recently-viewed
// @access  Private
const recordView = async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({ success: false, message: 'productId is required' });
    }

    const productExists = await Product.exists({ _id: productId });
    if (!productExists) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const record = await RecentlyViewed.findOneAndUpdate(
      { user: req.user._id, product: productId },
      { viewedAt: new Date() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({
      success: true,
      data: record,
    });
  } catch (error) {
    console.error('[RecentlyViewedController] Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to record product view' });
  }
};

// @desc    Get recently viewed products for logged-in user
// @route   GET /api/recently-viewed
// @access  Private
const getRecentlyViewed = async (req, res) => {
  try {
    const records = await RecentlyViewed.find({ user: req.user._id })
      .sort({ viewedAt: -1 })
      .limit(20)
      .populate({
        path: 'product',
        select: 'title name price comparePrice category images stock rating reviewsCount slug',
        populate: { path: 'category', select: 'name slug' },
      })
      .lean();

    // Map to list of valid populated products
    const products = records
      .filter((r) => r.product != null)
      .map((r) => ({
        ...r.product,
        viewedAt: r.viewedAt,
      }));

    return res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error('[RecentlyViewedController] Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch recently viewed products' });
  }
};

// @desc    Clear browsing history for logged-in user
// @route   DELETE /api/recently-viewed
// @access  Private
const clearRecentlyViewed = async (req, res) => {
  try {
    await RecentlyViewed.deleteMany({ user: req.user._id });
    return res.status(200).json({
      success: true,
      message: 'Browsing history cleared',
    });
  } catch (error) {
    console.error('[RecentlyViewedController] Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to clear browsing history' });
  }
};

module.exports = {
  recordView,
  getRecentlyViewed,
  clearRecentlyViewed,
};
