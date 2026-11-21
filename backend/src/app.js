/**
 * app.js — Express application entry point
 *
 * Mounts:
 *   /api/auth    — public auth routes (signup, login, change-password)
 *   /api/admin   — admin-only routes
 *   /api/stores  — authenticated user store browsing + rating
 *   /api/owner   — owner-only dashboard
 */
require('dotenv').config();

const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');

// Import routers
const authRouter   = require('./routes/auth');
const adminRouter  = require('./routes/admin');
const storesRouter = require('./routes/stores');
const ownerRouter  = require('./routes/owner');

// Initialize DB connection pool (side-effect: validates connection on startup)
require('./config/db');

const app  = express();
const PORT = process.env.PORT || 5000;

// ─── Global Middleware ───────────────────────────────────────────────────────

// Security headers
app.use(helmet());

// CORS — allow all origins in development; tighten in production
app.use(
  cors({
    origin:      process.env.CLIENT_ORIGIN || '*',
    methods:     ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Parse JSON bodies
app.use(express.json());

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// ─── Routes ──────────────────────────────────────────────────────────────────

app.use('/api/auth',   authRouter);
app.use('/api/admin',  adminRouter);
app.use('/api/stores', storesRouter);
app.use('/api/owner',  ownerRouter);

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.status(200).json({ success: true, message: 'Store Rating API is running.' });
});

// 404 handler — catch unmatched routes
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' });
});

// ─── Global Error Handler ────────────────────────────────────────────────────

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('[GlobalErrorHandler]', err);

  const statusCode = err.statusCode || err.status || 500;
  const message    = err.message    || 'An unexpected error occurred.';

  return res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ─── Start Server ────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`[Server] Store Rating API running on http://localhost:${PORT}`);
  console.log(`[Server] Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app; // exported for testing
