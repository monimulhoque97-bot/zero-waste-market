const { sendError } = require('../utils/response');

/**
 * 404 Route Not Found Handler
 */
function notFoundHandler(req, res, next) {
  sendError(res, `Resource not found at endpoint [${req.method}] ${req.originalUrl}`, 404);
}

/**
 * Global Error Handling Middleware
 */
function errorHandler(err, req, res, next) {
  console.error(`💥 [Error] ${req.method} ${req.url}:`, err);

  if (err.type === 'entity.parse.failed') {
    return sendError(res, 'Malformed JSON payload in request body.', 400);
  }

  if (err.code === 'LIMIT_FILE_SIZE') {
    return sendError(res, 'File size exceeds maximum permitted limit (5MB).', 400);
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'An unexpected internal server error occurred.';

  sendError(res, message, statusCode, process.env.NODE_ENV === 'development' ? err.stack : null);
}

module.exports = {
  notFoundHandler,
  errorHandler,
};
