const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { createReviewRules } = require('../validators/reviewValidator');
const { authenticate } = require('../middleware/authMiddleware');

// Public route to view reviews
router.get('/product/:productId', reviewController.getProductReviews);

// Protected routes to submit or delete review
router.post('/', authenticate, createReviewRules, reviewController.createReview);
router.delete('/:id', authenticate, reviewController.deleteReview);

module.exports = router;
