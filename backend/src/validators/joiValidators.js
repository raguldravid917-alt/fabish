const Joi = require('joi');

// Simple XSS sanitizer to strip HTML tags from standard text inputs
const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  return str
    .replace(/<[^>]*>/g, '') // Strip HTML tags
    .replace(/\$/g, '');     // Strip NoSQL operator prefix $ if needed
};

const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      if (key === 'description') continue; // Don't strip HTML from rich text description
      if (typeof obj[key] === 'string') {
        obj[key] = sanitizeString(obj[key]);
      } else if (Array.isArray(obj[key])) {
        obj[key] = obj[key].map(item => typeof item === 'string' ? sanitizeString(item) : item);
      } else if (typeof obj[key] === 'object') {
        obj[key] = sanitizeObject(obj[key]);
      }
    }
  }
  return obj;
};

// Joi schemas
const variantValidationSchema = Joi.object({
  _id: Joi.string().optional(),
  name: Joi.string().required().messages({
    'any.required': 'Variant name is required',
  }),
  sku: Joi.string().allow('').optional(),
  price: Joi.number().min(0.01).required().messages({
    'number.min': 'Variant price must be greater than zero',
    'any.required': 'Variant price is required',
  }),
  stock: Joi.number().integer().min(0).required().messages({
    'number.min': 'Variant stock cannot be negative',
    'any.required': 'Variant stock is required',
  }),
});

const productCreateSchema = Joi.object({
  title: Joi.string().min(3).required().messages({
    'string.min': 'Product title must be at least 3 characters',
    'any.required': 'Product title is required',
  }),
  description: Joi.string().required().messages({
    'any.required': 'Product description is required',
  }),
  price: Joi.number().min(0).required().messages({
    'number.min': 'Price must be a positive number',
    'any.required': 'Price is required',
  }),
  comparePrice: Joi.number().min(0).default(0.0).optional(),
  category: Joi.string().required().messages({
    'any.required': 'Category ID or Slug is required',
  }),
  stock: Joi.number().integer().min(0).default(10).optional(),
  status: Joi.string().valid('Published', 'Draft', 'Hidden').default('Published').optional(),
  tags: Joi.any().optional(),
  variants: Joi.array().items(variantValidationSchema).optional(),
  badges: Joi.any().optional(),
  slug: Joi.string().optional(),
  productName: Joi.string().optional(),
  seoTitle: Joi.string().allow('').optional(),
  seoDescription: Joi.string().allow('').optional(),
  featured: Joi.boolean().default(false).optional(),
  bestSeller: Joi.boolean().default(false).optional(),
  newArrival: Joi.boolean().default(false).optional(),
  trending: Joi.boolean().default(false).optional(),
});

const productUpdateSchema = Joi.object({
  title: Joi.string().min(3).optional(),
  description: Joi.string().optional(),
  price: Joi.number().min(0).optional(),
  comparePrice: Joi.number().min(0).optional(),
  category: Joi.string().optional(),
  stock: Joi.number().integer().min(0).optional(),
  status: Joi.string().valid('Published', 'Draft', 'Hidden').optional(),
  tags: Joi.any().optional(),
  variants: Joi.array().items(variantValidationSchema).optional(),
  badges: Joi.any().optional(),
  slug: Joi.string().optional(),
  productName: Joi.string().optional(),
  seoTitle: Joi.string().allow('').optional(),
  seoDescription: Joi.string().allow('').optional(),
  images: Joi.any().optional(), // allow list of already-uploaded images in updates
  existingImages: Joi.any().optional(),
  thumbnail: Joi.string().allow('').optional(),
  featured: Joi.boolean().optional(),
  bestSeller: Joi.boolean().optional(),
  newArrival: Joi.boolean().optional(),
  trending: Joi.boolean().optional(),
});

const categorySchema = Joi.object({
  name: Joi.string().min(2).required().messages({
    'string.min': 'Category name must be at least 2 characters',
    'any.required': 'Category name is required',
  }),
  slug: Joi.string().optional(),
  description: Joi.string().allow('').optional(),
  image: Joi.string().allow('').optional(),
  status: Joi.string().valid('Published', 'Draft', 'Hidden').default('Published').optional(),
  seoTitle: Joi.string().allow('').optional(),
  seoDescription: Joi.string().allow('').optional(),
  parentCategory: Joi.string().allow(null, '').optional(),
});

// Middleware generator
const validate = (schema) => {
  return (req, res, next) => {
    // Sanitize request body inputs first
    req.body = sanitizeObject(req.body);

    // Try parsing variants/tags/badges if they are sent as JSON strings via Multipart Form Data
    if (req.body.variants && typeof req.body.variants === 'string') {
      try {
        req.body.variants = JSON.parse(req.body.variants);
      } catch (e) {
        // Leave as string to let Joi handle invalid type
      }
    }
    if (req.body.tags && typeof req.body.tags === 'string') {
      try {
        req.body.tags = JSON.parse(req.body.tags);
      } catch (e) {}
    }
    if (req.body.badges && typeof req.body.badges === 'string') {
      try {
        req.body.badges = JSON.parse(req.body.badges);
      } catch (e) {}
    }

    const { error, value } = schema.validate(req.body, { abortEarly: false, allowUnknown: true });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message.replace(/['"]/g, ''),
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
    }

    // Replace body with validated/casted values
    req.body = value;
    next();
  };
};

module.exports = {
  validateProductCreate: validate(productCreateSchema),
  validateProductUpdate: validate(productUpdateSchema),
  validateCategory: validate(categorySchema),
};
