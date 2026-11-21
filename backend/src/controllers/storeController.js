/**
 * storeController.js — Store browsing and rating submission for normal users.
 */
const pool = require('../config/db');

/**
 * GET /api/stores
 * List all stores with optional name/address search.
 * Also returns each store's avg rating and the requesting user's own rating.
 */
const listStores = async (req, res) => {
  try {
    const { name, address } = req.query;
    const userId = req.user.id;

    const conditions = [];
    const params     = [];

    if (name)    { conditions.push('s.name LIKE ?');    params.push(`%${name}%`); }
    if (address) { conditions.push('s.address LIKE ?'); params.push(`%${address}%`); }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    // Append userId twice — once for the avg join, once for the user's own rating subquery
    params.push(userId);

    const sql = `
      SELECT
        s.id,
        s.name,
        s.email,
        s.address,
        s.owner_id,
        s.created_at,
        ROUND(AVG(r.rating), 2)      AS avg_rating,
        COUNT(r.id)                  AS total_ratings,
        (
          SELECT rating
          FROM   ratings
          WHERE  store_id = s.id
            AND  user_id  = ?
          LIMIT 1
        )                            AS my_rating
      FROM stores s
      LEFT JOIN ratings r ON r.store_id = s.id
      ${whereClause}
      GROUP BY s.id
      ORDER BY s.name ASC
    `;

    const [stores] = await pool.query(sql, params);

    return res.status(200).json({
      success: true,
      message: 'Stores retrieved successfully.',
      data: stores,
    });
  } catch (err) {
    console.error('[storeController.listStores]', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

/**
 * POST /api/stores/:id/ratings
 * Submit or update a rating (1–5) for a store by the authenticated user.
 * Uses INSERT ... ON DUPLICATE KEY UPDATE to handle updates atomically.
 */
const submitRating = async (req, res) => {
  try {
    const storeId = parseInt(req.params.id, 10);
    const userId  = req.user.id;
    const { rating } = req.body;

    // Verify store exists
    const [storeRows] = await pool.query('SELECT id FROM stores WHERE id = ?', [storeId]);
    if (storeRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Store not found.' });
    }

    // Upsert rating
    await pool.query(
      `INSERT INTO ratings (store_id, user_id, rating)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE rating = VALUES(rating), created_at = CURRENT_TIMESTAMP`,
      [storeId, userId, rating]
    );

    // Fetch updated avg for response
    const [[{ avg_rating }]] = await pool.query(
      'SELECT ROUND(AVG(rating), 2) AS avg_rating FROM ratings WHERE store_id = ?',
      [storeId]
    );

    return res.status(200).json({
      success: true,
      message: 'Rating submitted successfully.',
      data: { store_id: storeId, your_rating: rating, avg_rating },
    });
  } catch (err) {
    console.error('[storeController.submitRating]', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

module.exports = { listStores, submitRating };
