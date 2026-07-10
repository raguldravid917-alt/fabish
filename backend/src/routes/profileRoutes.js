const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { authenticate } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.use(authenticate);

router.route('/')
  .put(profileController.updateProfile);

router.route('/photo')
  .put(upload.single('avatar'), profileController.updateProfilePhoto)
  .delete(profileController.removeProfilePhoto);

module.exports = router;
