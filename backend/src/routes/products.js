const express = require('express');
const { body, validationResult, query } = require('express-validator');
const db = require('../config/database');
const { verifyToken, verifySellerToken } = require('../middleware/auth');

const router = express.Router();

// Get all products with filters
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().isString(),
  query('sellerId').optional().isInt(),
  query('minPrice').optional().isFloat({ min: 0 }),
  query('maxPrice').optional().isFloat({ min: 0 })
], async (req, res) => {
  try {
    const { page = 1, limit = 20, search, sellerId, minPrice, maxPrice } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM products WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND (name ILIKE $' + (params.length + 1) + ' OR description ILIKE $' + (params.length + 1) + ')';
      params.push(`%${search}%`);
    }

    if (sellerId) {
      query += ' AND seller_id = $' + (params.length + 1);
      params.push(sellerId);
    }

    if (minPrice) {
      query += ' AND price >= $' + (params.length + 1);
      params.push(minPrice);
    }

    if (maxPrice) {
      query += ' AND price <= $' + (params.length + 1);
      params.push(maxPrice);
    }

    query += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(limit, offset);

    const result = await db.query(query, params);

    res.json({
      products: result.rows,
      page,
      limit,
      total: result.rowCount
    });
  } catch (err) {
    console.error('Get products error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT p.*, s.username as seller_name, s.photo_url as seller_photo
       FROM products p
       JOIN users s ON p.seller_id = s.id
       WHERE p.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get product error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create product (sellers only)
router.post('/', verifySellerToken, [
  body('name').notEmpty().isLength({ min: 3, max: 100 }),
  body('description').notEmpty().isLength({ min: 10 }),
  body('price').isFloat({ min: 0.01 }),
  body('category').notEmpty(),
  body('stock').isInt({ min: 0 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, description, price, category, stock, image_url } = req.body;

    const result = await db.query(
      `INSERT INTO products (seller_id, name, description, price, category, stock, image_url, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       RETURNING *`,
      [req.userId, name, description, price, category, stock, image_url]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create product error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update product (sellers only)
router.put('/:id', verifySellerToken, async (req, res) => {
  try {
    // Check if product belongs to seller
    const productResult = await db.query(
      'SELECT * FROM products WHERE id = $1 AND seller_id = $2',
      [req.params.id, req.userId]
    );

    if (productResult.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found or you do not have permission' });
    }

    const { name, description, price, category, stock, image_url } = req.body;

    const result = await db.query(
      `UPDATE products 
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           price = COALESCE($3, price),
           category = COALESCE($4, category),
           stock = COALESCE($5, stock),
           image_url = COALESCE($6, image_url),
           updated_at = NOW()
       WHERE id = $7
       RETURNING *`,
      [name, description, price, category, stock, image_url, req.params.id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update product error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete product (sellers only)
router.delete('/:id', verifySellerToken, async (req, res) => {
  try {
    const productResult = await db.query(
      'DELETE FROM products WHERE id = $1 AND seller_id = $2 RETURNING id',
      [req.params.id, req.userId]
    );

    if (productResult.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found or you do not have permission' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error('Delete product error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
