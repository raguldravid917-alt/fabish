const crypto = require('crypto');
const userRepository = require('../repositories/userRepository');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/token');

class AuthService {
  // Existing registration, login, refresh, logout, updateProfile methods...
  async register(name, email, password) {
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    const user = await userRepository.create({
      name,
      email,
      password,
      rewardPoints: 100,
      lifetimeEarned: 100,
      tier: 'Bronze',
      rewardHistory: [{
        points: 100,
        type: 'Registration Bonus',
        reason: 'Welcome bonus on new customer registration',
      }]
    });
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Save refresh token to user document
    await userRepository.update(user._id, { refreshToken });

    return {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isAdmin: user.isAdmin,
      },
      accessToken,
      refreshToken,
    };
  }

  async login(email, password) {
    const user = await userRepository.findByEmailWithPassword(email);

    if (!user) {
      throw new Error('Email does not exist');
    }
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      throw new Error('Incorrect password');
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Save refresh token to user document
    await userRepository.update(user._id, { refreshToken });

    return {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isAdmin: user.isAdmin,
      },
      accessToken,
      refreshToken,
    };
  }

  async adminLogin(email, password) {
    const user = await userRepository.findByEmailWithPassword(email);

    if (!user) {
      throw new Error('Email does not exist');
    }
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      throw new Error('Incorrect password');
    }

    // Only allow Admin role users
    if (!user.isAdmin && user.role !== 'Admin') {
      throw new Error('Invalid credentials or insufficient privileges');
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    await userRepository.update(user._id, { refreshToken });

    return {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isAdmin: user.isAdmin,
      },
      accessToken,
      refreshToken,
    };
  }

  async refresh(token) {
    if (!token) {
      throw new Error('Refresh token is required');
    }

    const decoded = verifyRefreshToken(token);
    if (!decoded) {
      throw new Error('Invalid or expired refresh token');
    }

    const user = await userRepository.findById(decoded.id);
    // Exclude checking the exact token value if user document does not have select +refreshToken,
    // or select it explicitly to match for extra security. Let's do that:
    const dbUser = await userRepository.findByIdWithRefreshToken(decoded.id);
    if (!dbUser || dbUser.refreshToken !== token) {
      throw new Error('Refresh token mismatch or user not found');
    }

    const accessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    // Update refresh token rotation
    await userRepository.update(user._id, { refreshToken: newRefreshToken });

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(userId) {
    await userRepository.update(userId, { refreshToken: null });
    return true;
  }

  async updateProfile(userId, updateData) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Only update name and email, and password if provided
    const payload = {};
    if (updateData.name) payload.name = updateData.name;
    if (updateData.email) {
      const emailExists = await userRepository.findByEmail(updateData.email);
      if (emailExists && emailExists._id.toString() !== userId.toString()) {
        throw new Error('Email is already in use');
      }
      payload.email = updateData.email;
    }
    if (updateData.password) {
      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      payload.password = await bcrypt.hash(updateData.password, salt);
    }

    const updatedUser = await userRepository.update(userId, payload);
    const accessToken = generateAccessToken(updatedUser._id);

    return {
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        isAdmin: updatedUser.isAdmin,
      },
      accessToken,
    };
  }

  async forgotPassword(email) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new Error('No account found with that email address');
    }

    // Generate token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to expire
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetExpire = Date.now() + 30 * 60 * 1000; // 30 minutes expiration

    // Save to User collection
    await userRepository.update(user._id, {
      resetPasswordToken: hashedToken,
      resetPasswordExpire: resetExpire,
    });

    return resetToken;
  }

  async resetPassword(resetToken, newPassword) {
    // Hash token to match database record
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    const user = await userRepository.findByResetToken(hashedToken);
    if (!user) {
      throw new Error('Invalid or expired reset token');
    }

    // Set new password (this triggers model pre-save hook)
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    
    await user.save();
    return true;
  }
}

module.exports = new AuthService();
