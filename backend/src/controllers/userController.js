const userRepository = require('../repositories/userRepository');
const { HTTP_STATUS } = require('../constants');

class UserController {
  // @desc    Get all registered users (admin only)
  // @route   GET /api/users
  // @access  Private/Admin
  async getUsers(req, res, next) {
    try {
      const users = await userRepository.findAll();
      res.status(HTTP_STATUS.OK).json(users);
    } catch (error) {
      next(error);
    }
  }

  // @desc    Delete a user account (admin only)
  // @route   DELETE /api/users/:id
  // @access  Private/Admin
  async deleteUser(req, res, next) {
    try {
      const user = await userRepository.findById(req.params.id);
      
      if (!user) {
        res.status(HTTP_STATUS.NOT_FOUND);
        throw new Error('User not found');
      }

      if (user.isAdmin) {
        res.status(HTTP_STATUS.BAD_REQUEST);
        throw new Error('Cannot delete admin user accounts');
      }

      await userRepository.delete(req.params.id);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'User account deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();
