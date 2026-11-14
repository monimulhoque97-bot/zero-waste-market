const { sendError } = require('../utils/response');

/**
 * Role-Based Access Control (RBAC) Middleware
 * Restricts endpoint to specified roles (e.g. 'seller', 'customer', 'ngo')
 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'Authentication required before role check.', 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendError(
        res,
        `Access Forbidden. This action requires one of the following roles: [${allowedRoles.join(', ')}]. Your current role is '${req.user.role}'.`,
        403
      );
    }

    next();
  };
}

module.exports = {
  requireRole,
};
