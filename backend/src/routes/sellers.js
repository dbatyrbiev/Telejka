const express = require('express');
const db = require('../config/database');
const { verifyToken, verifySellerToken } = require('../middleware/auth');

const router = express.Router();

// Get all sellers
router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, username, first_name, last_name, photo_url, created_at,
              (SELECT COUNT(*) FROM products WHERE seller_id = users.id) as product_count,
              (SELECT AVG(rating) FROM reviews WHERE seller_id = users.id) as avg_rating
       FROM users
       WHERE user_type = 'seller'
       ORDER BY created_at DESC`
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Get sellers error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get seller profile
router.get('/:id', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, username, first_name, last_name, photo_url, created_at,
              (SELECT COUNT(*) FROM products WHERE seller_id = users.id) as product_count,
              (SELECT AVG(rating) FROM reviews WHERE seller_id = users.id) as avg_rating
       FROM users
       WHERE id = $1 AND user_type = 'seller'`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Seller not found' });
    }

    // Get seller's products
    const productsResult = await db.query(
      'SELECT id, name, price, image_url FROM products WHERE seller_id = $1 LIMIT 10',
      [req.params.id]
    );

    const seller = result.rows[0];
    seller.products = productsResult.rows;

    res.json(seller);
  } catch (err) {
    console.error('Get seller profile error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get current seller stats (seller only)
router.get('/stats', verifySellerToken, async (req, res) => {
  try {
    const statsResult = await db.query(
      `SELECT
        (SELECT COUNT(*) FROM products WHERE seller_id = $1) as total_products,
        (SELECT COUNT(*) FROM orders WHERE seller_id = $1) as total_orders,
        (SELECT SUM(total_price) FROM orders WHERE seller_id = $1 AND status = 'delivered') as total_revenue,
        (SELECT AVG(rating) FROM reviews WHERE seller_id = $1) as avg_rating,
        (SELECT COUNT(*) FROM reviews WHERE seller_id = $1) as total_reviews`,
      [req.userId]
    );

    res.json(statsResult.rows[0]);
  } catch (err) {
    console.error('Get seller stats error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update seller profile (seller only)
router.put('/profile', verifySellerToken, async (req, res) => {
  try {
    const { first_name, last_name, photo_url } = req.body;

    const result = await db.query(
      `UPDATE users 
       SET first_name = COALESCE($1, first_name),
           last_name = COALESCE($2, last_name),
           photo_url = COALESCE($3, photo_url)
       WHERE id = $4
       RETURNING id, username, first_name, last_name, photo_url`,
      [first_name, last_name, photo_url, req.userId]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update seller profile error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
