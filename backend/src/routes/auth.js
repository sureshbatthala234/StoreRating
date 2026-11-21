/**
 * auth.js — Authentication routes
 * POST /api/auth/signup
 * POST /api/auth/login
 * PUT  /api/auth/password  (authenticated)
 */
const express  = require('express');
const { body } = require('express-validator');
const router   = express.Router();

const { signup, login, changePassword } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { validate }     = require('../middleware/validate');

// ─── Validators ──────────────────────────────────────────────────────────────

const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,16}$/;

const signupValidators = [
  body('name')
    .trim()
    .isLength({ min: 20, max: 60 })
    .withMessage('Name must be between 20 and 60 characters.'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('A valid email address is required.')
    .normalizeEmail(),
  body('password')
    .matches(passwordRegex)
    .withMessage(
      'Password must be 8–16 characters and contain at least one uppercase letter and one special character (!@#$%^&*).'
    ),
  body('address')
    .optional()
    .trim()
    .isLength({ max: 400 })
    .withMessage('Address must not exceed 400 characters.'),
];

const loginValidators = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('A valid email address is required.')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required.'),
];

const changePasswordValidators = [
  body('oldPassword')
    .notEmpty()
    .withMessage('Old password is required.'),
  body('newPassword')
    .matches(passwordRegex)
    .withMessage(
      'New password must be 8–16 characters and contain at least one uppercase letter and one special character (!@#$%^&*).'
    ),
];

// ─── Routes ──────────────────────────────────────────────────────────────────

// POST /api/auth/signup
router.post('/signup', signupValidators, validate, signup);

// POST /api/auth/login
router.post('/login', loginValidators, validate, login);

// PUT /api/auth/password
router.put('/password', authenticate, changePasswordValidators, validate, changePassword);

module.exports = router;
