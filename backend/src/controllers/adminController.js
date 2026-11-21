/**
 * adminController.js — Admin-only controller
 * Handles dashboard stats, user management, and store management.
 */
const bcrypt = require('bcryptjs');
const pool   = require('../config/db');

// ─── Dashboard ───────────────────────────────────────────────────────────────

/**
 * GET /api/admin/dashboard
 * Returns aggregate counts: total users, stores, and ratings.
 */
const getDashboard = async (req, res) => {
  try {
    const [[{ totalUsers }]]   = await pool.query('SELECT COUNT(*) AS totalUsers FROM users');
    const [[{ totalStores }]]  = await pool.query('SELECT COUNT(*) AS totalStores FROM stores');
    const [[{ totalRatings }]] = await pool.query('SELECT COUNT(*) AS totalRatings FROM ratings');

    return res.status(200).json({
      success: true,
      message: 'Dashboard data retrieved.',
      data: { totalUsers, totalStores, totalRatings },
    });
  } catch (err) {
    console.error('[adminController.getDashboard]', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// ─── User Management ─────────────────────────────────────────────────────────

/**
 * POST /api/admin/users
 * Admin creates a user with any role (admin / user / owner).
 */
const createUser = async (req, res) => {
  try {
    const { name, email, password, address, role } = req.body;

    // Check duplicate email
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'Email is already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, address || null, role || 'user']
    );

    return res.status(201).json({
      success: true,
      message: 'User created successfully.',
      data: { id: result.insertId, name, email, role: role || 'user' },
    });
  } catch (err) {
    console.error('[adminController.createUser]', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * GET /api/admin/users
 * List all users with optional filters (name, email, address, role)
 * and optional sort (sortBy, order). If a user is an owner, includes
 * their store's average rating.
 */
const listUsers = async (req, res) => {
  try {
    const { name, email, address, role, sortBy, order } = req.query;

    // Allowed columns for sorting to prevent SQL injection
    const allowedSortCols = ['name', 'email', 'role', 'created_at'];
    const sortCol   = allowedSortCols.includes(sortBy) ? sortBy : 'created_at';
    const sortOrder = order === 'asc' ? 'ASC' : 'DESC';

    // Build dynamic WHERE clause
    const conditions = [];
    const params     = [];

    if (name)    { conditions.push('u.name LIKE ?');    params.push(`%${name}%`); }
    if (email)   { conditions.push('u.email LIKE ?');   params.push(`%${email}%`); }
    if (address) { conditions.push('u.address LIKE ?'); params.push(`%${address}%`); }
    if (role)    { conditions.push('u.role = ?');       params.push(role); }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const sql = `
      SELECT
        u.id,
        u.name,
        u.email,
        u.address,
        u.role,
        u.created_at,
        s.id   AS store_id,
        s.name AS store_name,
        ROUND(AVG(r.rating), 2) AS avg_rating
      FROM users u
      LEFT JOIN stores s ON s.owner_id = u.id AND u.role = 'owner'
      LEFT JOIN ratings r ON r.store_id = s.id
      ${whereClause}
      GROUP BY u.id, s.id
      ORDER BY u.${sortCol} ${sortOrder}
    `;

    const [users] = await pool.query(sql, params);

    return res.status(200).json({
      success: true,
      message: 'Users retrieved successfully.',
      data: users,
    });
  } catch (err) {
    console.error('[adminController.listUsers]', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * GET /api/admin/users/:id
 * Get a single user. If owner, includes their store's avg rating.
 */
const getUserDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      `SELECT
         u.id, u.name, u.email, u.address, u.role, u.created_at,
         s.id   AS store_id,
         s.name AS store_name,
         s.email AS store_email,
         s.address AS store_address,
         ROUND(AVG(r.rating), 2) AS avg_rating
       FROM users u
       LEFT JOIN stores s ON s.owner_id = u.id AND u.role = 'owner'
       LEFT JOIN ratings r ON r.store_id = s.id
       WHERE u.id = ?
       GROUP BY u.id, s.id`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'User retrieved successfully.',
      data: rows[0],
    });
  } catch (err) {
    console.error('[adminController.getUserDetail]', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// ─── Store Management ─────────────────────────────────────────────────────────

/**
 * POST /api/admin/stores
 * Admin creates a store, optionally assigning an owner.
 */
const createStore = async (req, res) => {
  try {
    const { name, email, address, owner_id } = req.body;

    // Check duplicate store email
    const [existing] = await pool.query('SELECT id FROM stores WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'Store email is already registered.' });
    }

    // Validate owner exists and has role 'owner' (if supplied)
    if (owner_id) {
      const [ownerRows] = await pool.query(
        "SELECT id FROM users WHERE id = ? AND role = 'owner'",
        [owner_id]
      );
      if (ownerRows.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'owner_id must reference a user with role "owner".',
        });
      }
    }

    const [result] = await pool.query(
      'INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)',
      [name, email, address || null, owner_id || null]
    );

    return res.status(201).json({
      success: true,
      message: 'Store created successfully.',
      data: { id: result.insertId, name, email, address, owner_id },
    });
  } catch (err) {
    console.error('[adminController.createStore]', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * GET /api/admin/stores
 * List all stores with optional filters (name, email, address) and sort.
 * Includes avg rating computed from ratings table.
 */
const listStores = async (req, res) => {
  try {
    const { name, email, address, sortBy, order } = req.query;

    const allowedSortCols = ['name', 'email', 'address', 'created_at', 'avg_rating'];
    const sortCol   = allowedSortCols.includes(sortBy) ? sortBy : 'created_at';
    const sortOrder = order === 'asc' ? 'ASC' : 'DESC';

    const conditions = [];
    const params     = [];

    if (name)    { conditions.push('s.name LIKE ?');    params.push(`%${name}%`); }
    if (email)   { conditions.push('s.email LIKE ?');   params.push(`%${email}%`); }
    if (address) { conditions.push('s.address LIKE ?'); params.push(`%${address}%`); }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const sql = `
      SELECT
        s.id,
        s.name,
        s.email,
        s.address,
        s.owner_id,
        u.name  AS owner_name,
        u.email AS owner_email,
        s.created_at,
        ROUND(AVG(r.rating), 2) AS avg_rating,
        COUNT(r.id)             AS total_ratings
      FROM stores s
      LEFT JOIN users u   ON u.id = s.owner_id
      LEFT JOIN ratings r ON r.store_id = s.id
      ${whereClause}
      GROUP BY s.id
      ORDER BY ${sortCol === 'avg_rating' ? 'avg_rating' : `s.${sortCol}`} ${sortOrder}
    `;

    const [stores] = await pool.query(sql, params);

    return res.status(200).json({
      success: true,
      message: 'Stores retrieved successfully.',
      data: stores,
    });
  } catch (err) {
    console.error('[adminController.listStores]', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

module.exports = {
  getDashboard,
  createUser,
  listUsers,
  getUserDetail,
  createStore,
  listStores,
};
