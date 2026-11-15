/**
 * Centralized error handling middleware
 */
const errorHandler = (err, req, res, _next) => {
  console.error(`[ErrorHandler] ${err.message}`);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      details: messages,
    });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue).join(', ');
    return res.status(409).json({
      success: false,
      error: `Duplicate value for: ${field}`,
    });
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: `Invalid value for ${err.path}: ${err.value}`,
    });
  }

  return res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || 'Internal Server Error',
  });
};

module.exports = errorHandler;
