const express = require('express');
const db = require('../config/database');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Get cart
router.get('/', verifyToken, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT c.id, c.product_id, c.quantity, p.name, p.price, p.image_url, p.seller_id
       FROM cart c
       JOIN products p ON c.product_id = p.id
       WHERE c.user_id = $1`,
      [req.userId]
    );

    const total = result.rows.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    res.json({
      items: result.rows,
      total: parseFloat(total.toFixed(2))
    });
  } catch (err) {
    console.error('Get cart error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add to cart
router.post('/add', verifyToken, async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    // Check if product exists
    const productResult = await db.query('SELECT * FROM products WHERE id = $1', [productId]);
    if (productResult.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const product = productResult.rows[0];
    if (product.stock < quantity) {
      return res.status(400).json({ error: 'Not enough stock' });
    }

    // Check if already in cart
    const existingResult = await db.query(
      'SELECT * FROM cart WHERE user_id = $1 AND product_id = $2',
      [req.userId, productId]
    );

    if (existingResult.rows.length > 0) {
      // Update quantity
      await db.query(
        'UPDATE cart SET quantity = quantity + $1 WHERE user_id = $2 AND product_id = $3',
        [quantity, req.userId, productId]
      );
    } else {
      // Insert new cart item
      await db.query(
        'INSERT INTO cart (user_id, product_id, quantity) VALUES ($1, $2, $3)',
        [req.userId, productId, quantity]
      );
    }

    res.json({ message: 'Product added to cart' });
  } catch (err) {
    console.error('Add to cart error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update cart item
router.put('/:cartItemId', verifyToken, async (req, res) => {
  try {
    const { quantity } = req.body;

    if (quantity <= 0) {
      return res.status(400).json({ error: 'Quantity must be greater than 0' });
    }

    const result = await db.query(
      'UPDATE cart SET quantity = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
      [quantity, req.params.cartItemId, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update cart error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Remove from cart
router.delete('/:cartItemId', verifyToken, async (req, res) => {
  try {
    const result = await db.query(
      'DELETE FROM cart WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.cartItemId, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    res.json({ message: 'Item removed from cart' });
  } catch (err) {
    console.error('Remove from cart error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Clear cart
router.delete('/', verifyToken, async (req, res) => {
  try {
    await db.query('DELETE FROM cart WHERE user_id = $1', [req.userId]);
    res.json({ message: 'Cart cleared' });
  } catch (err) {
    console.error('Clear cart error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
