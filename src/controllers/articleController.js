/**
 * Article Controller
 * Handles all business logic for article CRUD operations
 */

const Article = require('../models/Article');

/**
 * @desc    Get all articles
 * @route   GET /api/articles
 * @access  Public
 */
const getAllArticles = async (req, res, next) => {
  try {
    const { isUpdated, limit = 50, page = 1, sortBy = 'createdAt', order = 'desc' } = req.query;

    // Build query filter
    const filter = {};
    if (isUpdated !== undefined) {
      filter.isUpdated = isUpdated === 'true';
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOrder = order === 'desc' ? -1 : 1;

    // Execute query with pagination
    const articles = await Article.find(filter)
      .sort({ [sortBy]: sortOrder })
      .limit(parseInt(limit))
      .skip(skip)
      .select('-__v');

    // Get total count for pagination
    const total = await Article.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: articles.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: articles
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single article by ID
 * @route   GET /api/articles/:id
 * @access  Public
 */
const getArticleById = async (req, res, next) => {
  try {
    const article = await Article.findById(req.params.id)
      .populate('originalArticleId', 'title url date')
      .select('-__v');

    if (!article) {
      return res.status(404).json({
        success: false,
        error: 'Article not found'
      });
    }

    res.status(200).json({
      success: true,
      data: article
    });

  } catch (error) {
    // Handle invalid MongoDB ObjectId
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid article ID format'
      });
    }
    next(error);
  }
};

/**
 * @desc    Create new article
 * @route   POST /api/articles
 * @access  Public
 */
const createArticle = async (req, res, next) => {
  try {
    const article = await Article.create(req.body);

    res.status(201).json({
      success: true,
      data: article
    });

  } catch (error) {
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: messages.join(', ')
      });
    }
    next(error);
  }
};

/**
 * @desc    Update article
 * @route   PUT /api/articles/:id
 * @access  Public
 */
const updateArticle = async (req, res, next) => {
  try {
    const article = await Article.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true, // Return updated document
        runValidators: true // Run schema validators
      }
    );

    if (!article) {
      return res.status(404).json({
        success: false,
        error: 'Article not found'
      });
    }

    res.status(200).json({
      success: true,
      data: article
    });

  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid article ID format'
      });
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: messages.join(', ')
      });
    }
    next(error);
  }
};

/**
 * @desc    Delete article
 * @route   DELETE /api/articles/:id
 * @access  Public
 */
const deleteArticle = async (req, res, next) => {
  try {
    const article = await Article.findByIdAndDelete(req.params.id);

    if (!article) {
      return res.status(404).json({
        success: false,
        error: 'Article not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {},
      message: 'Article deleted successfully'
    });

  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid article ID format'
      });
    }
    next(error);
  }
};

/**
 * @desc    Get original and enhanced version of an article
 * @route   GET /api/articles/:id/comparison
 * @access  Public
 */
const getArticleComparison = async (req, res, next) => {
  try {
    const original = await Article.findById(req.params.id);

    if (!original) {
      return res.status(404).json({
        success: false,
        error: 'Article not found'
      });
    }

    // Find enhanced version if exists
    let enhanced = null;
    if (original.isUpdated) {
      // This is already an enhanced version
      enhanced = original;
      original = await Article.findById(original.originalArticleId);
    } else {
      // Find enhanced version of this original
      enhanced = await Article.findOne({ originalArticleId: original._id });
    }

    res.status(200).json({
      success: true,
      data: {
        original,
        enhanced
      }
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
  getArticleComparison
};
