const express = require('express');
const router = express.Router();
const addressController = require('../controllers/addressController');
const { addressRules } = require('../validators/addressValidator');
const { authenticate } = require('../middleware/authMiddleware');

router.use(authenticate);

router.patch('/default', addressController.setDefaultAddress);
router.patch('/:id/default', addressController.setDefaultAddress);

router.route('/')
  .get(addressController.getAddresses)
  .post(addressRules, addressController.createAddress);

router.route('/:id')
  .get(addressController.getAddressById)
  .put(addressRules, addressController.updateAddress)
  .delete(addressController.deleteAddress);

module.exports = router;
