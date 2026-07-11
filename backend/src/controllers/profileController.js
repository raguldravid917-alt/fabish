const User = require('../models/User');
const uploadService = require('../services/uploadService');
const { HTTP_STATUS } = require('../constants');
const bcrypt = require('bcryptjs');

class ProfileController {
  // @desc    Update user profile details
  // @route   PUT /api/profile or PUT /api/auth/profile
  // @access  Private
  async updateProfile(req, res, next) {
    try {
      const { name, email, phone, password } = req.body ?? {};
      const user = await User.findById(req.user._id);

      if (!user) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: 'User not found',
        });
      }

      if (email && email.toLowerCase() !== user.email.toLowerCase()) {
        const emailExists = await User.findOne({ email: email.toLowerCase() });
        if (emailExists) {
          return res.status(HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            message: 'Email address is already in use by another account',
          });
        }
        user.email = email.toLowerCase();
      }

      if (name?.trim()) user.name = name.trim();
      if (phone !== undefined) user.phone = phone.trim();
      
      if (password) {
        if (password.length < 8) {
          return res.status(HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            message: 'Password must be at least 8 characters long',
          });
        }
        user.password = password; // pre-save hook will hash it automatically
      }

      await user.save();

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone || '',
          avatar: user.avatar || '',
          role: user.role,
          isAdmin: user.isAdmin,
          addresses: user.addresses || [],
          rewardPoints: user.rewardPoints || 0,
          rewardHistory: user.rewardHistory || [],
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Upload or update profile photo
  // @route   PUT /api/profile/photo or PUT /api/auth/profile/photo
  // @access  Private
  async updateProfilePhoto(req, res, next) {
    try {
      if (!req.file) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: 'Please upload an image file',
        });
      }

      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: 'User not found',
        });
      }

      // Delete old photo if it exists
      if (user.avatar) {
        try {
          await uploadService.deleteImage(user.avatar);
        } catch (err) {
          console.error('Failed to delete old avatar:', err.message);
        }
      }

      // Upload new photo
      const uploadResult = await uploadService.uploadFile(req.file, 'fabish/avatars');
      if (!uploadResult) {
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: 'Failed to upload photo',
        });
      }

      user.avatar = uploadResult.secure_url;
      await user.save();

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Profile photo updated successfully',
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone || '',
          avatar: user.avatar,
          role: user.role,
          isAdmin: user.isAdmin,
          addresses: user.addresses || [],
          rewardPoints: user.rewardPoints || 0,
          rewardHistory: user.rewardHistory || [],
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Remove profile photo
  // @route   DELETE /api/profile/photo or DELETE /api/auth/profile/photo
  // @access  Private
  async removeProfilePhoto(req, res, next) {
    try {
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: 'User not found',
        });
      }

      if (user.avatar) {
        try {
          await uploadService.deleteImage(user.avatar);
        } catch (err) {
          console.error('Failed to delete avatar:', err.message);
        }
        user.avatar = '';
        await user.save();
      }

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Profile photo removed successfully',
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone || '',
          avatar: '',
          role: user.role,
          isAdmin: user.isAdmin,
          addresses: user.addresses || [],
          rewardPoints: user.rewardPoints || 0,
          rewardHistory: user.rewardHistory || [],
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // @desc    Get current user reward points and history
  // @route   GET /api/profile/rewards or GET /api/auth/profile/rewards
  // @access  Private
  async getRewards(req, res, next) {
    try {
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: 'User not found',
        });
      }

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data: {
          rewardPoints: user.rewardPoints || 0,
          rewardHistory: user.rewardHistory || [],
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ProfileController();
