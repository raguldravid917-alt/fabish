const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const { validateCategory } = require('../validators/joiValidators');
const upload = require('../middleware/uploadMiddleware');
const { ROLES } = require('../constants');

// Public routes
router.get('/', categoryController.getCategories);
router.get('/:slug', categoryController.getCategoryBySlug);

// Admin only routes
router.use(authenticate, authorize(ROLES.ADMIN));
router.post('/', upload.single('image'), validateCategory, categoryController.createCategory);
router.route('/:id')
  .put(upload.single('image'), validateCategory, categoryController.updateCategory)
  .delete(categoryController.deleteCategory);
router.patch('/:id/restore', categoryController.restoreCategory);

module.exports = router;
