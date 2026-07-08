const express = require('express');
const router = express.Router();
const addressController = require('../controllers/addressController');
const { authenticate } = require('../middleware/authMiddleware');

router.use(authenticate);

router.route('/')
  .get(addressController.getAddresses)
  .post(addressController.createAddress);

router.route('/:id')
  .get(addressController.getAddressById)
  .put(addressController.updateAddress)
  .delete(addressController.deleteAddress);

module.exports = router;
