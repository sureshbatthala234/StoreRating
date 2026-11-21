/**
 * stores.js — Store routes (authenticated users)
 * GET  /api/stores          — list / search stores
 * POST /api/stores/:id/ratings — submit or update a rating
 */
const express  = require('express');
const { body } = require('express-validator');
const router   = express.Router();

const { listStores, submitRating } = require('../controllers/storeController');
const { authenticate } = require('../middleware/auth');
const { validate }     = require('../middleware/validate');

// All store routes require authentication
router.use(authenticate);

// ─── Validators ──────────────────────────────────────────────────────────────

const ratingValidators = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5.'),
];

// ─── Routes ──────────────────────────────────────────────────────────────────

// GET /api/stores?name=&address=
router.get('/', listStores);

// POST /api/stores/:id/ratings
router.post('/:id/ratings', ratingValidators, validate, submitRating);

module.exports = router;
