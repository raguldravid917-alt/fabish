const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const { ROLES } = require('../constants');

// Public endpoints
router.get('/', blogController.getBlogs);
router.get('/:slug', blogController.getBlogBySlug);

// Admin-only endpoints
router.use(authenticate, authorize(ROLES.ADMIN));

router.post('/', blogController.createBlog);
router.route('/:id')
  .put(blogController.updateBlog)
  .delete(blogController.deleteBlog);

module.exports = router;
