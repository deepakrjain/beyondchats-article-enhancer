/**
 * Validation Middleware
 * Uses Joi for validating incoming request data
 */

const Joi = require('joi');

/**
 * Validation schema for creating an article
 */
const articleCreateSchema = Joi.object({
  title: Joi.string()
    .required()
    .trim()
    .max(500)
    .messages({
      'string.empty': 'Title is required',
      'string.max': 'Title cannot exceed 500 characters'
    }),

  content: Joi.string()
    .required()
    .messages({
      'string.empty': 'Content is required'
    }),

  author: Joi.string()
    .trim()
    .allow('')
    .default('Unknown'),

  date: Joi.date()
    .iso()
    .default(Date.now),

  url: Joi.string()
    .uri()
    .required()
    .messages({
      'string.empty': 'URL is required',
      'string.uri': 'URL must be a valid URI'
    }),

  isUpdated: Joi.boolean()
    .default(false),

  originalArticleId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .allow(null)
    .messages({
      'string.pattern.base': 'Invalid MongoDB ObjectId format'
    }),

  references: Joi.array().items(
    Joi.object({
      url: Joi.string().uri(),
      title: Joi.string(),
      scrapedAt: Joi.date()
    })
  )
});

/**
 * Validation schema for updating an article
 */
const articleUpdateSchema = Joi.object({
  title: Joi.string()
    .trim()
    .max(500),

  content: Joi.string(),

  author: Joi.string()
    .trim()
    .allow(''),

  date: Joi.date().iso(),

  url: Joi.string().uri(),

  isUpdated: Joi.boolean(),

  originalArticleId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .allow(null),

  references: Joi.array().items(
    Joi.object({
      url: Joi.string().uri(),
      title: Joi.string(),
      scrapedAt: Joi.date()
    })
  )
}).min(1); // At least one field must be provided

/**
 * Middleware to validate article creation
 */
const validateArticle = (req, res, next) => {
  const { error, value } = articleCreateSchema.validate(req.body, {
    abortEarly: false, // Return all errors, not just the first one
    stripUnknown: true // Remove unknown fields
  });

  if (error) {
    const errors = error.details.map(detail => detail.message);
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors
    });
  }

  req.body = value; // Replace body with validated and sanitized data
  next();
};

/**
 * Middleware to validate article updates
 */
const validateArticleUpdate = (req, res, next) => {
  const { error, value } = articleUpdateSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    const errors = error.details.map(detail => detail.message);
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors
    });
  }

  req.body = value;
  next();
};

module.exports = {
  validateArticle,
  validateArticleUpdate
};
