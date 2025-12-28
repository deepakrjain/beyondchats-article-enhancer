/**
 * Global Error Handler Middleware
 * Catches and formats all errors
 */

/**
 * Error handler middleware
 * Must be the last middleware in the chain
 */
const errorHandler = (err, req, res, next) => {
  // Log error for debugging
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);

  // Default error
  let error = {
    success: false,
    error: err.message || 'Server Error'
  };

  let statusCode = err.statusCode || 500;

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    error.error = 'Resource not found';
    statusCode = 404;
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    error.error = 'Duplicate field value entered';
    statusCode = 400;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    error.error = Object.values(err.errors).map(e => e.message).join(', ');
    statusCode = 400;
  }

  res.status(statusCode).json(error);
};

module.exports = errorHandler;
