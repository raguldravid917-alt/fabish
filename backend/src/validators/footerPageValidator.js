const Joi = require('joi');

/* ─── Allowed HTML is NOT stripped from content ─────────────────────────── */
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const basePageFields = {
  title: Joi.string().min(2).max(200).required().messages({
    'string.min': 'Title must be at least 2 characters',
    'string.max': 'Title must not exceed 200 characters',
    'any.required': 'Title is required',
  }),
  slug: Joi.string()
    .max(200)
    .pattern(SLUG_PATTERN)
    .optional()
    .allow('')
    .messages({
      'string.pattern.base': 'Slug must be lowercase letters, numbers, and hyphens only',
      'string.max': 'Slug must not exceed 200 characters',
    }),
  shortDescription: Joi.string().max(500).allow('').optional().messages({
    'string.max': 'Short description must not exceed 500 characters',
  }),
  content: Joi.string().allow('').optional(),

  // Image fields (URLs passed when no file is uploaded)
  existingFeaturedImageUrl: Joi.string().allow('').optional(),
  existingBannerImageUrl: Joi.string().allow('').optional(),
  featuredImageAlt: Joi.string().max(200).allow('').optional(),
  bannerImageAlt: Joi.string().max(200).allow('').optional(),

  seoTitle: Joi.string().max(70).allow('').optional().messages({
    'string.max': 'SEO title must not exceed 70 characters',
  }),
  seoDescription: Joi.string().max(160).allow('').optional().messages({
    'string.max': 'SEO description must not exceed 160 characters',
  }),
  seoKeywords: Joi.alternatives().try(
    Joi.array().items(Joi.string()),
    Joi.string()
  ).optional(),

  status: Joi.string().valid('Published', 'Draft', 'Archived').optional().messages({
    'any.only': 'Status must be Published, Draft, or Archived',
  }),
  showInFooter: Joi.alternatives().try(Joi.boolean(), Joi.string()).optional(),
  displayOrder: Joi.alternatives().try(Joi.number().integer().min(0), Joi.string()).optional(),
};

const createFooterPageSchema = Joi.object({
  ...basePageFields,
  title: Joi.string().min(2).max(200).required().messages({
    'string.min': 'Title must be at least 2 characters',
    'any.required': 'Title is required',
  }),
});

const updateFooterPageSchema = Joi.object({
  ...basePageFields,
  title: Joi.string().min(2).max(200).optional(),
}).min(1);

const toggleStatusSchema = Joi.object({
  status: Joi.string().valid('Published', 'Draft', 'Archived').required().messages({
    'any.required': 'Status is required',
    'any.only': 'Status must be Published, Draft, or Archived',
  }),
});

const toggleVisibilitySchema = Joi.object({
  showInFooter: Joi.boolean().required().messages({
    'any.required': 'showInFooter boolean is required',
  }),
});

const reorderSchema = Joi.object({
  items: Joi.array()
    .items(
      Joi.object({
        id: Joi.string().required(),
        displayOrder: Joi.number().integer().min(0).required(),
      })
    )
    .min(1)
    .required()
    .messages({
      'array.min': 'At least one item is required for reorder',
      'any.required': 'Items array is required',
    }),
});

const bulkActionSchema = Joi.object({
  action: Joi.string().valid('delete', 'publish', 'unpublish').required().messages({
    'any.required': 'Bulk action is required',
    'any.only': 'Action must be delete, publish, or unpublish',
  }),
  ids: Joi.array().items(Joi.string()).min(1).required().messages({
    'array.min': 'At least one page ID is required',
    'any.required': 'IDs are required',
  }),
});

/**
 * Joi validation middleware generator.
 */
const validate = (schema) => (req, res, next) => {
  // For multipart/form-data requests, parse JSON fields
  ['seoKeywords', 'showInFooter', 'displayOrder'].forEach((key) => {
    if (req.body[key] && typeof req.body[key] === 'string') {
      try {
        req.body[key] = JSON.parse(req.body[key]);
      } catch (_) { /* leave as-is; Joi handles coercion */ }
    }
  });

  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    allowUnknown: false,
    stripUnknown: false,
  });

  if (error) {
    const errors = error.details.map((d) => ({
      field: d.path.join('.'),
      message: d.message.replace(/['"]/g, ''),
    }));
    return res.status(400).json({ success: false, message: 'Validation failed', errors });
  }

  req.body = value;
  next();
};

module.exports = {
  validateCreate: validate(createFooterPageSchema),
  validateUpdate: validate(updateFooterPageSchema),
  validateToggleStatus: validate(toggleStatusSchema),
  validateToggleVisibility: validate(toggleVisibilitySchema),
  validateReorder: validate(reorderSchema),
  validateBulkAction: validate(bulkActionSchema),
};
