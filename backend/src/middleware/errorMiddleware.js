const { HTTP_STATUS } = require('../constants');

/**
 * Express middleware to handle 404 Route Not Found.
 */
const notFoundHandler = (req, res, next) => {
  const error = new Error(`Resource Not Found - ${req.originalUrl}`);
  res.status(HTTP_STATUS.NOT_FOUND);
  next(error);
};

/**
 * Global Express Error Handler.
 * Returns normalized API error response.
 */
const errorHandler = (err, req, res, next) => {
  let statusCode =
    res.statusCode && res.statusCode !== HTTP_STATUS.OK
      ? res.statusCode
      : HTTP_STATUS.INTERNAL_SERVER_ERROR;

  let errors = err.errors || null;
  let message = err.message || 'Internal Server Error';

  // Format Mongoose validation errors to return key-value pairs of field: error_message
  if (err.name === 'ValidationError') {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = 'Validation Error';
    errors = {};
    for (const key in err.errors) {
      errors[key] = err.errors[key].message;
    }
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = {
  notFoundHandler,
  errorHandler,
};
