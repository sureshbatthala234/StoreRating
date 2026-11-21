/**
 * validate.js — express-validator result checker middleware
 * Place this after your validation chain in a route to automatically
 * respond 422 if any validation errors exist.
 */
const { validationResult } = require('express-validator');

/**
 * validate — Express middleware
 * Checks for express-validator errors. If present, returns 422 with
 * the array of errors. Otherwise, calls next().
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed.',
      errors: errors.array().map((e) => ({
        field:   e.path || e.param,
        message: e.msg,
      })),
    });
  }

  next();
};

module.exports = { validate };
