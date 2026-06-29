require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');

const db = require('./config/database');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const sellerRoutes = require('./routes/sellers');
const orderRoutes = require('./routes/orders');
const cartRoutes = require('./routes/cart');
const chatRoutes = require('./routes/chat');
const reviewRoutes = require('./routes/reviews');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/sellers', sellerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/reviews', reviewRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Socket.io for real-time chats
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('join_chat', (data) => {
    socket.join(`chat_${data.chatId}`);
    console.log(`User joined chat: ${data.chatId}`);
  });

  socket.on('send_message', (data) => {
    io.to(`chat_${data.chatId}`).emit('receive_message', {
      userId: data.userId,
      message: data.message,
      timestamp: new Date()
    });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV}`);
});

module.exports = { app, io };
