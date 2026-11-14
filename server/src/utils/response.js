/**
 * Standardised API Response Utility
 */

function sendSuccess(res, data = null, message = 'Success', statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  });
}

function sendError(res, message = 'Internal Server Error', statusCode = 500, details = null) {
  const payload = {
    success: false,
    message,
    timestamp: new Date().toISOString(),
  };

  if (details && process.env.NODE_ENV !== 'production') {
    payload.details = details;
  }

  return res.status(statusCode).json(payload);
}

function sendPaginated(res, items = [], pagination = {}, message = 'Data fetched successfully') {
  return res.status(200).json({
    success: true,
    message,
    data: items,
    pagination: {
      total: pagination.total || items.length,
      page: pagination.page || 1,
      limit: pagination.limit || items.length,
      totalPages: pagination.totalPages || 1,
    },
    timestamp: new Date().toISOString(),
  });
}

module.exports = {
  sendSuccess,
  sendError,
  sendPaginated,
};
