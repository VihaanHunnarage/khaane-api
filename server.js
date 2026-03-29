const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import routes
const testRoutes = require('./routes/test');
const userRoutes = require('./routes/users');
const listingRoutes = require('./routes/listings');

// Import database connection
const { connectDB } = require('./database/mongodb');

const app = express();
const PORT = process.env.PORT || 3001;

// Connect to MongoDB on startup
connectDB().catch(err => {
  console.error('Failed to connect to MongoDB:', err);
  process.exit(1);
});

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'https://khaanemekyahai.netlify.app'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/test', testRoutes);
app.use('/api/users', userRoutes);
app.use('/api/listings', listingRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Khaane Me Kya Hai API Server',
    version: '1.0.0',
    database: 'MongoDB Atlas',
    endpoints: {
      test: '/api/test/test-db',
      users: '/api/users',
      listings: '/api/listings'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/`);
});

module.exports = app;
