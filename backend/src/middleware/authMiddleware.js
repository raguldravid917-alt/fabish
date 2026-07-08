const { verifyAccessToken } = require('../utils/token');
const userRepository = require('../repositories/userRepository');
const { ROLES } = require('../constants');

const authenticate = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = verifyAccessToken(token);

      if (!decoded) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized, access token expired or invalid',
        });
      }

      const user = await userRepository.findById(decoded.id);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized, user not found',
        });
      }

      req.user = user;
      return next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed',
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token provided',
    });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, user credentials missing',
      });
    }

    // Support both checking explicitly the role list and legacy isAdmin boolean
    const hasRole = roles.includes(req.user.role) || (roles.includes(ROLES.ADMIN) && req.user.isAdmin);

    if (!hasRole) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to perform this action',
      });
    }

    next();
  };
};

module.exports = {
  authenticate,
  authorize,
};
