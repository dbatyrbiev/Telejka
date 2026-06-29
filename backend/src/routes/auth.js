const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');

const router = express.Router();

// Register
router.post('/register', [
  body('telegramId').isNumeric(),
  body('username').isLength({ min: 3 }),
  body('firstName').notEmpty(),
  body('userType').isIn(['buyer', 'seller'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { telegramId, username, firstName, lastName, userType, photoUrl } = req.body;

    // Check if user already exists
    const existingUser = await db.query('SELECT * FROM users WHERE telegram_id = $1', [telegramId]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Insert user
    const result = await db.query(
      `INSERT INTO users (telegram_id, username, first_name, last_name, user_type, photo_url, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       RETURNING id, telegram_id, username, user_type`,
      [telegramId, username, firstName, lastName, userType, photoUrl]
    );

    const user = result.rows[0];

    // Create JWT token
    const token = jwt.sign(
      { userId: user.id, telegramId: user.telegram_id, userType: user.user_type },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        username: user.username,
        userType: user.user_type
      }
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// Login
router.post('/login', [
  body('telegramId').isNumeric()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { telegramId } = req.body;

    const result = await db.query(
      'SELECT id, telegram_id, username, user_type FROM users WHERE telegram_id = $1',
      [telegramId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    const user = result.rows[0];

    const token = jwt.sign(
      { userId: user.id, telegramId: user.telegram_id, userType: user.user_type },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        userType: user.user_type
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Get current user
router.get('/me', require('../middleware/auth').verifyToken, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, telegram_id, username, first_name, last_name, user_type, photo_url FROM users WHERE id = $1',
      [req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
