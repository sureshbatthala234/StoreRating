/**
 * owner.js — Owner routes (authenticated + role='owner')
 * GET /api/owner/dashboard
 */
const express = require('express');
const router  = express.Router();

const { getDashboard }  = require('../controllers/ownerController');
const { authenticate }  = require('../middleware/auth');
const { authorize }     = require('../middleware/authorize');

// All owner routes require authentication + owner role
router.use(authenticate, authorize('owner'));

// GET /api/owner/dashboard
router.get('/dashboard', getDashboard);

module.exports = router;
