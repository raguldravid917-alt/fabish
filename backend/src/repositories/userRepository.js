const User = require('../models/User');

class UserRepository {
  async findById(id) {
    return await User.findById(id).lean();
  }

  async findByIdWithPassword(id) {
    return await User.findById(id).select('+password');
  }

  async findByIdWithRefreshToken(id) {
    return await User.findById(id).select('+refreshToken');
  }


  async findByEmail(email) {
    return await User.findOne({ email }).lean();
  }

  async findByEmailWithPassword(email) {
    return await User.findOne({ email }).select('+password');
  }

  async create(userData) {
    return await User.create(userData);
  }

  async update(id, updateData) {
    return await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
  }

  async delete(id) {
    const Address = require('../models/Address');
    await Address.deleteMany({ user: id });
    return await User.findByIdAndDelete(id);
  }

  async findByResetToken(token) {
    return await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() },
    }).select('+password +resetPasswordToken +resetPasswordExpire');
  }

  async findAll() {
    return await User.find({}).lean();
  }
}

module.exports = new UserRepository();
