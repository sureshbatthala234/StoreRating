/**
 * ownerController.js — Dashboard for store owners.
 * Returns the owner's store avg rating and all users who rated it.
 */
const pool = require('../config/db');

/**
 * GET /api/owner/dashboard
 * Returns the logged-in owner's store data:
 *  - store details
 *  - average rating
 *  - list of raters (name, email, rating, submitted_at)
 */
const getDashboard = async (req, res) => {
  try {
    const ownerId = req.user.id;

    // Find the store owned by this user
    const [storeRows] = await pool.query(
      'SELECT id, name, email, address, created_at FROM stores WHERE owner_id = ?',
      [ownerId]
    );

    if (storeRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No store found for this owner.',
      });
    }

    const store = storeRows[0];

    // Get avg rating
    const [[{ avg_rating, total_ratings }]] = await pool.query(
      `SELECT
         ROUND(AVG(rating), 2) AS avg_rating,
         COUNT(*)              AS total_ratings
       FROM ratings
       WHERE store_id = ?`,
      [store.id]
    );

    // Get list of users who rated this store
    const [raters] = await pool.query(
      `SELECT
         u.id         AS user_id,
         u.name,
         u.email,
         r.rating,
         r.created_at AS submitted_at
       FROM ratings r
       JOIN users u ON u.id = r.user_id
       WHERE r.store_id = ?
       ORDER BY r.created_at DESC`,
      [store.id]
    );

    return res.status(200).json({
      success: true,
      message: 'Owner dashboard data retrieved.',
      data: {
        store: {
          ...store,
          avg_rating:    avg_rating   || null,
          total_ratings: total_ratings || 0,
        },
        raters,
      },
    });
  } catch (err) {
    console.error('[ownerController.getDashboard]', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

module.exports = { getDashboard };
