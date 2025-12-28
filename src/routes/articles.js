/**
 * Article Routes
 * Defines all API endpoints for article management
 */

const express = require('express');
const router = express.Router();
const {
  getAllArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
  getArticleComparison
} = require('../controllers/articleController');

const { validateArticle, validateArticleUpdate } = require('../middleware/validation');

// Article CRUD routes
router.route('/')
  .get(getAllArticles)
  .post(validateArticle, createArticle);

router.route('/:id')
  .get(getArticleById)
  .put(validateArticleUpdate, updateArticle)
  .delete(deleteArticle);

// Special route for comparison
router.get('/:id/comparison', getArticleComparison);

module.exports = router;
