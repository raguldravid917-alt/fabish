const categoryService = require('../services/categoryService');
const { HTTP_STATUS } = require('../constants');

class CategoryController {
  // @desc    Get all categories
  // @route   GET /api/categories
  // @access  Public
  async getCategories(req, res, next) {
    try {
      const includeDeleted = req.query.includeDeleted === 'true';
      const categories = await categoryService.getCategories(includeDeleted);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: categories,
        message: 'Categories fetched successfully',
      });
    } catch (error) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message || 'Failed to fetch categories'
      });
    }
  }

  // @desc    Get category by slug
  // @route   GET /api/categories/:slug
  // @access  Public
  async getCategoryBySlug(req, res, next) {
    try {
      const category = await categoryService.getCategoryBySlug(req.params.slug);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: category,
      });
    } catch (error) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: error.message || 'Category not found'
      });
    }
  }

  // @desc    Create a category
  // @route   POST /api/categories
  // @access  Private/Admin
  async createCategory(req, res, next) {
    try {
      const file = req.file || null;
      const category = await categoryService.createCategory(req.body, file);
      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: 'Category created successfully',
        data: category,
      });
    } catch (error) {
      // FIX: Ensure response is sent back to frontend to stop infinite loading
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: error.message || 'Failed to create category. Please check your inputs.'
      });
    }
  }

  // @desc    Update a category
  // @route   PUT /api/categories/:id
  // @access  Private/Admin
  async updateCategory(req, res, next) {
    try {
      const file = req.file || null;
      const category = await categoryService.updateCategory(req.params.id, req.body, file);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Category updated successfully',
        data: category,
      });
    } catch (error) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: error.message || 'Failed to update category.'
      });
    }
  }

  // @desc    Delete a category (soft-delete)
  // @route   DELETE /api/categories/:id
  // @access  Private/Admin
  async deleteCategory(req, res, next) {
    try {
      await categoryService.deleteCategory(req.params.id);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Category soft-deleted successfully',
      });
    } catch (error) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: error.message || 'Failed to delete category.'
      });
    }
  }

  // @desc    Restore a soft-deleted category
  // @route   PATCH /api/categories/:id/restore
  // @access  Private/Admin
  async restoreCategory(req, res, next) {
    try {
      const category = await categoryService.restoreCategory(req.params.id);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Category restored successfully',
        data: category,
      });
    } catch (error) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: error.message || 'Failed to restore category.'
      });
    }
  }
}

module.exports = new CategoryController();