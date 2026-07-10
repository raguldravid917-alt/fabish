const { body, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  next();
};

const addressRules = [
  body('fullName')
    .trim()
    .notEmpty()
    .withMessage('Full name is required'),
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^\+?[0-9\s-]{10,15}$/)
    .withMessage('Please enter a valid phone number (at least 10 digits)'),
  body('addressLine1')
    .trim()
    .notEmpty()
    .withMessage('Address line 1 is required'),
  body('city')
    .trim()
    .notEmpty()
    .withMessage('City is required'),
  body('state')
    .trim()
    .notEmpty()
    .withMessage('State is required'),
  body('postalCode')
    .trim()
    .notEmpty()
    .withMessage('PIN / Postal code is required')
    .matches(/^[a-zA-Z0-9\s-]{3,10}$/)
    .withMessage('Please enter a valid PIN / Postal code (3-10 characters)'),
  body('country')
    .trim()
    .notEmpty()
    .withMessage('Country is required'),
  body('addressType')
    .optional()
    .isIn(['Home', 'Office', 'Other'])
    .withMessage('Address type must be Home, Office, or Other'),
  validate,
];

module.exports = {
  addressRules,
};
