/**
 * admin.js — Admin routes (all protected: authenticate + authorize('admin'))
 * GET  /api/admin/dashboard
 * POST /api/admin/users
 * GET  /api/admin/users
 * GET  /api/admin/users/:id
 * POST /api/admin/stores
 * GET  /api/admin/stores
 */
const express  = require('express');
const { body } = require('express-validator');
const router   = express.Router();

const {
  getDashboard,
  createUser,
  listUsers,
  getUserDetail,
  createStore,
  listStores,
} = require('../controllers/adminController');

const { authenticate } = require('../middleware/auth');
const { authorize }    = require('../middleware/authorize');
const { validate }     = require('../middleware/validate');

// Apply authentication + admin authorization to ALL routes in this router
router.use(authenticate, authorize('admin'));

// ─── Validators ──────────────────────────────────────────────────────────────

const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,16}$/;

const createUserValidators = [
  body('name')
    .trim()
    .isLength({ min: 20, max: 60 })
    .withMessage('Name must be between 20 and 60 characters.'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('A valid email is required.')
    .normalizeEmail(),
  body('password')
    .matches(passwordRegex)
    .withMessage('Password must be 8–16 chars with at least one uppercase letter and one special character.'),
  body('address')
    .optional()
    .trim()
    .isLength({ max: 400 })
    .withMessage('Address must not exceed 400 characters.'),
  body('role')
    .optional()
    .isIn(['admin', 'user', 'owner'])
    .withMessage('Role must be one of: admin, user, owner.'),
];

const createStoreValidators = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 60 })
    .withMessage('Store name is required and must not exceed 60 characters.'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('A valid store email is required.')
    .normalizeEmail(),
  body('address')
    .optional()
    .trim()
    .isLength({ max: 400 })
    .withMessage('Address must not exceed 400 characters.'),
  body('owner_id')
    .optional()
    .isInt({ gt: 0 })
    .withMessage('owner_id must be a positive integer.'),
];

// ─── Routes ──────────────────────────────────────────────────────────────────

router.get('/dashboard',  getDashboard);

router.post('/users',     createUserValidators, validate, createUser);
router.get('/users',      listUsers);
router.get('/users/:id',  getUserDetail);

router.post('/stores',    createStoreValidators, validate, createStore);
router.get('/stores',     listStores);

module.exports = router;
