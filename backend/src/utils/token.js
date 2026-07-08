const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'fabishsecretkey1234567890jwt';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fabishrefreshkey0987654321jwt';

const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, {
    expiresIn: '7d', // Match session lifetime (refresh cookies unreliable in cross-origin dev)
  });
};

const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_REFRESH_SECRET, {
    expiresIn: '7d', // Long-lived session token
  });
};

const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET);
  } catch (error) {
    return null;
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
