/**
 * authorize.js — Role-based authorization middleware factory
 * Usage: authorize('admin') or authorize('admin', 'owner')
 */

/**
 * Returns Express middleware that allows access only to users whose
 * role is included in the provided allowedRoles list.
 *
 * @param {...string} allowedRoles - One or more accepted roles.
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthenticated. Please log in.',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access forbidden. Required role(s): ${allowedRoles.join(', ')}.`,
      });
    }

    next();
  };
};

module.exports = { authorize };
