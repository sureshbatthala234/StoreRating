/**
 * authController.js — Authentication controller
 * Handles signup, login, and change-password operations.
 */
const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const pool   = require('../config/db');

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Generate a signed JWT for the given user payload.
 */
const signToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

// ─── Controllers ────────────────────────────────────────────────────────────

/**
 * POST /api/auth/signup
 * Register a new user with role 'user'.
 */
const signup = async (req, res) => {
  try {
    const { name, email, password, address } = req.body;

    // Check for existing email
    const [existing] = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );
    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Email is already registered.',
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const [result] = await pool.query(
      `INSERT INTO users (name, email, password, address, role)
       VALUES (?, ?, ?, ?, 'user')`,
      [name, email, hashedPassword, address || null]
    );

    const userId = result.insertId;

    // Build JWT payload
    const token = signToken({ id: userId, email, role: 'user', name });

    return res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      data: {
        token,
        user: { id: userId, name, email, role: 'user' },
      },
    });
  } catch (err) {
    console.error('[authController.signup]', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * POST /api/auth/login
 * Authenticate a user and return a JWT.
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Fetch user by email
    const [rows] = await pool.query(
      'SELECT id, name, email, password, role FROM users WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const user = rows[0];

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Sign token
    const token = signToken({
      id:    user.id,
      email: user.email,
      role:  user.role,
      name:  user.name,
    });

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        token,
        user: {
          id:    user.id,
          name:  user.name,
          email: user.email,
          role:  user.role,
        },
      },
    });
  } catch (err) {
    console.error('[authController.login]', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * PUT /api/auth/password
 * Authenticated. Change the current user's password.
 */
const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Fetch current hashed password
    const [rows] = await pool.query(
      'SELECT password FROM users WHERE id = ?',
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Verify old password
    const isMatch = await bcrypt.compare(oldPassword, rows[0].password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Old password is incorrect.',
      });
    }

    // Hash and store new password
    const hashedNew = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashedNew, userId]);

    return res.status(200).json({
      success: true,
      message: 'Password updated successfully.',
      data: null,
    });
  } catch (err) {
    console.error('[authController.changePassword]', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

module.exports = { signup, login, changePassword };
