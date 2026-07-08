const productService = require('../services/productService');
const { HTTP_STATUS, PRODUCT_STATUS } = require('../constants');

class ProductController {
  // @desc    Get all products with filtering, search, sorting & pagination
  // @route   GET /api/products
  // @access  Public
  async getProducts(req, res, next) {
    try {
      const result = await productService.getProducts(req.query);
      
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Products retrieved successfully',
        data: result.products, // existing frontend expects list directly or wrapped in "products"
        products: result.products, // double exposure to keep compatibility with both frontend versions
        pagination: {
          page: Number(req.query.page) || 1,
          pages: result.pages,
          total: result.total,
        },
        page: Number(req.query.page) || 1, // for frontend count sync compatibility
        pages: result.pages,
        totalProducts: result.total,
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Get single product by ID
  // @route   GET /api/products/:id
  // @access  Public
  async getProductById(req, res, next) {
    try {
      const product = await productService.getProductById(req.params.id);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: product,
      });
    } catch (error) {
      res.status(HTTP_STATUS.NOT_FOUND);
      next(error);
    }
  }

  // @desc    Get product by slug
  // @route   GET /api/products/slug/:slug
  // @access  Public
  async getProductBySlug(req, res, next) {
    try {
      const product = await productService.getProductBySlug(req.params.slug);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: product,
      });
    } catch (error) {
      // Compatibility fallback: return raw product as root if requested by frontend detail page
      res.status(HTTP_STATUS.OK).json(error.message === 'Product not found' ? null : error.message);
    }
  }

  // @desc    Create a product
  // @route   POST /api/products
  // @access  Private/Admin
  async createProduct(req, res, next) {
    try {
      const files = req.files || (req.file ? [req.file] : []);
      
      // Parse tags if sent as string
      if (req.body.tags && typeof req.body.tags === 'string') {
        req.body.tags = req.body.tags.split(',').map((t) => t.trim()).filter(Boolean);
      }

      const createdProduct = await productService.createProduct(req.body, files, req.user._id);

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: 'Product created successfully',
        data: createdProduct,
      });
    } catch (error) {
      res.status(HTTP_STATUS.BAD_REQUEST);
      next(error);
    }
  }

  // @desc    Update a product
  // @route   PUT /api/products/:id
  // @access  Private/Admin
  async updateProduct(req, res, next) {
    try {
      const files = req.files || (req.file ? [req.file] : []);
      
      if (req.body.tags && typeof req.body.tags === 'string') {
        req.body.tags = req.body.tags.split(',').map((t) => t.trim()).filter(Boolean);
      }

      const updatedProduct = await productService.updateProduct(
        req.params.id,
        req.body,
        files,
        req.user._id
      );

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Product updated successfully',
        data: updatedProduct,
      });
    } catch (error) {
      res.status(HTTP_STATUS.BAD_REQUEST);
      next(error);
    }
  }

  // @desc    Delete a product (soft delete)
  // @route   DELETE /api/products/:id
  // @access  Private/Admin
  async deleteProduct(req, res, next) {
    try {
      await productService.deleteProduct(req.params.id);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Product deleted successfully',
      });
    } catch (error) {
      if (error.message === 'Product not found') {
        res.status(HTTP_STATUS.NOT_FOUND);
      } else if (error.message === 'Invalid product ID format') {
        res.status(HTTP_STATUS.BAD_REQUEST);
      } else {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR);
      }
      next(error);
    }
  }

  // @desc    Restore a soft-deleted product
  // @route   PATCH /api/products/:id/restore
  // @access  Private/Admin
  async restoreProduct(req, res, next) {
    try {
      const product = await productService.restoreProduct(req.params.id);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Product restored successfully',
        data: product,
      });
    } catch (error) {
      res.status(HTTP_STATUS.NOT_FOUND);
      next(error);
    }
  }

  // @desc    Update featured status
  // @route   PATCH /api/products/:id/featured
  // @access  Private/Admin
  async patchFeatured(req, res, next) {
    try {
      const featured = req.body.featured === true || req.body.featured === 'true';
      const product = await productService.updateFeaturedStatus(req.params.id, featured);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Product featured status updated',
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Update trending status
  // @route   PATCH /api/products/:id/trending
  // @access  Private/Admin
  async patchTrending(req, res, next) {
    try {
      const trending = req.body.trending === true || req.body.trending === 'true';
      const product = await productService.updateTrendingStatus(req.params.id, trending);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Product trending status updated',
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Update bestseller status
  // @route   PATCH /api/products/:id/bestseller
  // @access  Private/Admin
  async patchBestSeller(req, res, next) {
    try {
      const bestSeller = req.body.bestSeller === true || req.body.bestSeller === 'true';
      const product = await productService.updateBestSellerStatus(req.params.id, bestSeller);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Product bestseller status updated',
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Update newarrival status
  // @route   PATCH /api/products/:id/newarrival
  // @access  Private/Admin
  async patchNewArrival(req, res, next) {
    try {
      const newArrival = req.body.newArrival === true || req.body.newArrival === 'true';
      const product = await productService.updateNewArrivalStatus(req.params.id, newArrival);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Product newarrival status updated',
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Update status (Published/Hidden/Draft)
  // @route   PATCH /api/products/:id/status
  // @access  Private/Admin
  async patchStatus(req, res, next) {
    try {
      const { status } = req.body;
      const product = await productService.updateStatus(req.params.id, status);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: `Product status updated to ${status}`,
        data: product,
      });
    } catch (error) {
      res.status(HTTP_STATUS.BAD_REQUEST);
      next(error);
    }
  }

  // @desc    Bulk Update State (Delete, Publish, Hide)
  // @route   POST /api/products/bulk-status
  // @access  Private/Admin
  async bulkStatus(req, res, next) {
    try {
      const { ids, action } = req.body; // action: 'delete' | 'publish' | 'hide'
      if (!Array.isArray(ids) || ids.length === 0) {
        res.status(HTTP_STATUS.BAD_REQUEST);
        throw new Error('Valid list of product IDs is required');
      }

      let result;
      if (action === 'delete') {
        result = await productService.bulkDelete(ids);
      } else if (action === 'publish') {
        result = await productService.bulkPublish(ids);
      } else if (action === 'hide') {
        result = await productService.bulkHide(ids);
      } else {
        res.status(HTTP_STATUS.BAD_REQUEST);
        throw new Error('Invalid bulk action');
      }

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: `Bulk ${action} action executed successfully`,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ProductController();
