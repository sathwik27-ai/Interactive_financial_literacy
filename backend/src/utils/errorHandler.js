// Global error handler middleware

const logger = require('./logger');

const errorHandler = (err, req, res, next) => {
  logger.error(`Error: ${err.message}`);
  
  // Prisma errors
  if (err.code === 'P2002') {
    return res.status(400).json({ error: 'Duplicate entry', details: err.meta });
  }
  
  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: 'Validation failed', details: err.message });
  }
  
  // Default error
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;

