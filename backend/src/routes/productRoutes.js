const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { validateProductCreate, validateProductUpdate } = require('../validators/joiValidators');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { ROLES } = require('../constants');

// Public routes
router.get('/', productController.getProducts);
router.get('/statuses', productController.getStatuses);
router.get('/check-name', productController.checkName);
router.get('/slug/:slug', productController.getProductBySlug);
router.post('/upload', upload.single('image'), productController.uploadImage);
router.get('/:id', productController.getProductById);

// Protected admin routes
router.use(authenticate, authorize(ROLES.ADMIN));

router.post('/', upload.array('images', 10), validateProductCreate, productController.createProduct);
router.route('/:id')
  .put(upload.array('images', 10), validateProductUpdate, productController.updateProduct)
  .patch(upload.array('images', 10), validateProductUpdate, productController.updateProduct)
  .delete(productController.deleteProduct);

// Status and metadata patch endpoints
router.patch('/bulk-status', productController.bulkStatus);
router.patch('/:id/restore', productController.restoreProduct);
router.patch('/:id/featured', productController.patchFeatured);
router.patch('/:id/trending', productController.patchTrending);
router.patch('/:id/bestseller', productController.patchBestSeller);
router.patch('/:id/newarrival', productController.patchNewArrival);
router.patch('/:id/status', productController.patchStatus);

module.exports = router;
