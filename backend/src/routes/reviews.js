const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Get reviews for a seller
router.get('/seller/:sellerId', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT r.*, u.username, u.photo_url
       FROM reviews r
       JOIN users u ON r.buyer_id = u.id
       WHERE r.seller_id = $1
       ORDER BY r.created_at DESC`,
      [req.params.sellerId]
    );

    const avgRatingResult = await db.query(
      'SELECT AVG(rating) as avg_rating, COUNT(*) as total_reviews FROM reviews WHERE seller_id = $1',
      [req.params.sellerId]
    );

    res.json({
      reviews: result.rows,
      stats: avgRatingResult.rows[0]
    });
  } catch (err) {
    console.error('Get reviews error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get reviews for a product
router.get('/product/:productId', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT r.*, u.username, u.photo_url
       FROM reviews r
       JOIN users u ON r.buyer_id = u.id
       WHERE r.product_id = $1
       ORDER BY r.created_at DESC`,
      [req.params.productId]
    );

    const avgRatingResult = await db.query(
      'SELECT AVG(rating) as avg_rating, COUNT(*) as total_reviews FROM reviews WHERE product_id = $1',
      [req.params.productId]
    );

    res.json({
      reviews: result.rows,
      stats: avgRatingResult.rows[0]
    });
  } catch (err) {
    console.error('Get product reviews error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create review
router.post('/', verifyToken, [
  body('sellerId').isInt(),
  body('productId').isInt(),
  body('rating').isInt({ min: 1, max: 5 }),
  body('comment').optional().isString()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { sellerId, productId, rating, comment } = req.body;

    // Check if order exists
    const orderResult = await db.query(
      'SELECT * FROM orders WHERE buyer_id = $1 AND seller_id = $2 AND product_id = $3',
      [req.userId, sellerId, productId]
    );

    if (orderResult.rows.length === 0) {
      return res.status(400).json({ error: 'You can only review products you purchased' });
    }

    // Check if review already exists
    const existingReview = await db.query(
      'SELECT * FROM reviews WHERE buyer_id = $1 AND seller_id = $2 AND product_id = $3',
      [req.userId, sellerId, productId]
    );

    if (existingReview.rows.length > 0) {
      return res.status(400).json({ error: 'You already reviewed this product' });
    }

    const result = await db.query(
      `INSERT INTO reviews (buyer_id, seller_id, product_id, rating, comment, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING *`,
      [req.userId, sellerId, productId, rating, comment]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create review error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update review
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const result = await db.query(
      `UPDATE reviews 
       SET rating = COALESCE($1, rating),
           comment = COALESCE($2, comment)
       WHERE id = $3 AND buyer_id = $4
       RETURNING *`,
      [rating, comment, req.params.id, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update review error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete review
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const result = await db.query(
      'DELETE FROM reviews WHERE id = $1 AND buyer_id = $2 RETURNING id',
      [req.params.id, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }

    res.json({ message: 'Review deleted successfully' });
  } catch (err) {
    console.error('Delete review error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
