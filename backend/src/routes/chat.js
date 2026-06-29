const express = require('express');
const db = require('../config/database');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Get user chats
router.get('/', verifyToken, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT DISTINCT c.*, 
              CASE WHEN c.buyer_id = $1 THEN u2.username ELSE u1.username END as other_user_name,
              CASE WHEN c.buyer_id = $1 THEN u2.id ELSE u1.id END as other_user_id
       FROM chats c
       JOIN users u1 ON c.seller_id = u1.id
       JOIN users u2 ON c.buyer_id = u2.id
       WHERE c.buyer_id = $1 OR c.seller_id = $1
       ORDER BY c.updated_at DESC`,
      [req.userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Get chats error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get chat messages
router.get('/:chatId', verifyToken, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT m.*, u.username, u.photo_url
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       WHERE m.chat_id = $1
       ORDER BY m.created_at ASC`,
      [req.params.chatId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Get messages error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Send message
router.post('/:chatId/message', verifyToken, async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    // Check if chat exists and user is part of it
    const chatResult = await db.query(
      'SELECT * FROM chats WHERE id = $1 AND (buyer_id = $2 OR seller_id = $2)',
      [req.params.chatId, req.userId]
    );

    if (chatResult.rows.length === 0) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    const messageResult = await db.query(
      `INSERT INTO messages (chat_id, sender_id, message, created_at)
       VALUES ($1, $2, $3, NOW())
       RETURNING *`,
      [req.params.chatId, req.userId, message]
    );

    // Update chat updated_at
    await db.query(
      'UPDATE chats SET updated_at = NOW() WHERE id = $1',
      [req.params.chatId]
    );

    res.status(201).json(messageResult.rows[0]);
  } catch (err) {
    console.error('Send message error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create or get chat
router.post('/or-create', verifyToken, async (req, res) => {
  try {
    const { otherUserId } = req.body;

    if (otherUserId === req.userId) {
      return res.status(400).json({ error: 'Cannot chat with yourself' });
    }

    // Check if chat already exists
    const existingChat = await db.query(
      `SELECT * FROM chats 
       WHERE (buyer_id = $1 AND seller_id = $2) OR (buyer_id = $2 AND seller_id = $1)`,
      [req.userId, otherUserId]
    );

    if (existingChat.rows.length > 0) {
      return res.json(existingChat.rows[0]);
    }

    // Determine buyer and seller
    const userTypeResult = await db.query(
      'SELECT user_type FROM users WHERE id = $1',
      [req.userId]
    );

    const otherUserTypeResult = await db.query(
      'SELECT user_type FROM users WHERE id = $1',
      [otherUserId]
    );

    if (userTypeResult.rows.length === 0 || otherUserTypeResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userType = userTypeResult.rows[0].user_type;
    const otherUserType = otherUserTypeResult.rows[0].user_type;

    let buyerId, sellerId;

    if (userType === 'buyer' && otherUserType === 'seller') {
      buyerId = req.userId;
      sellerId = otherUserId;
    } else if (userType === 'seller' && otherUserType === 'buyer') {
      buyerId = otherUserId;
      sellerId = req.userId;
    } else {
      return res.status(400).json({ error: 'Chat can only be between buyer and seller' });
    }

    // Create new chat
    const newChatResult = await db.query(
      `INSERT INTO chats (buyer_id, seller_id, created_at, updated_at)
       VALUES ($1, $2, NOW(), NOW())
       RETURNING *`,
      [buyerId, sellerId]
    );

    res.status(201).json(newChatResult.rows[0]);
  } catch (err) {
    console.error('Create or get chat error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
