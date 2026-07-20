const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const { ROLES } = require('../constants');

const upload = require('../middleware/uploadMiddleware');

// Public endpoints
router.get('/categories', blogController.getCategories);  // Must be before /:slug
router.get('/', blogController.getBlogs);
router.get('/:slug', blogController.getBlogBySlug);

// Admin-only endpoints
router.use(authenticate, authorize(ROLES.ADMIN));

router.post('/', upload.single('image'), blogController.createBlog);
router.route('/:id')
  .put(upload.single('image'), blogController.updateBlog)
  .delete(blogController.deleteBlog);

module.exports = router;
