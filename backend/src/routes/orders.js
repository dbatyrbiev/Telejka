const express = require('express');
const db = require('../config/database');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Get user orders
router.get('/', verifyToken, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT o.*, s.username as seller_name, s.photo_url as seller_photo, p.name as product_name
       FROM orders o
       JOIN users s ON o.seller_id = s.id
       JOIN products p ON o.product_id = p.id
       WHERE o.buyer_id = $1
       ORDER BY o.created_at DESC`,
      [req.userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Get orders error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get seller orders
router.get('/seller/all', verifyToken, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT o.*, b.username as buyer_name, b.photo_url as buyer_photo, p.name as product_name
       FROM orders o
       JOIN users b ON o.buyer_id = b.id
       JOIN products p ON o.product_id = p.id
       WHERE o.seller_id = $1
       ORDER BY o.created_at DESC`,
      [req.userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Get seller orders error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single order
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT o.*, s.username as seller_name, b.username as buyer_name, p.name as product_name
       FROM orders o
       JOIN users s ON o.seller_id = s.id
       JOIN users b ON o.buyer_id = b.id
       JOIN products p ON o.product_id = p.id
       WHERE o.id = $1 AND (o.buyer_id = $2 OR o.seller_id = $2)`,
      [req.params.id, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get order error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create order from cart
router.post('/checkout', verifyToken, async (req, res) => {
  try {
    const { shippingAddress, paymentMethod } = req.body;

    // Get cart items
    const cartResult = await db.query(
      `SELECT c.*, p.price, p.seller_id FROM cart c
       JOIN products p ON c.product_id = p.id
       WHERE c.user_id = $1`,
      [req.userId]
    );

    if (cartResult.rows.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    const orders = [];

    // Create orders (one per seller)
    for (const item of cartResult.rows) {
      const totalPrice = item.price * item.quantity;

      const orderResult = await db.query(
        `INSERT INTO orders (buyer_id, seller_id, product_id, quantity, total_price, status, shipping_address, payment_method, created_at)
         VALUES ($1, $2, $3, $4, $5, 'pending', $6, $7, NOW())
         RETURNING *`,
        [req.userId, item.seller_id, item.product_id, item.quantity, totalPrice, shippingAddress, paymentMethod]
      );

      orders.push(orderResult.rows[0]);

      // Update product stock
      await db.query(
        'UPDATE products SET stock = stock - $1 WHERE id = $2',
        [item.quantity, item.product_id]
      );
    }

    // Clear cart
    await db.query('DELETE FROM cart WHERE user_id = $1', [req.userId]);

    res.status(201).json({
      message: 'Orders created successfully',
      orders
    });
  } catch (err) {
    console.error('Checkout error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update order status (seller only)
router.put('/:id/status', verifyToken, async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const result = await db.query(
      'UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 AND seller_id = $3 RETURNING *',
      [status, req.params.id, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update order status error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
