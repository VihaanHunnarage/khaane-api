const express = require('express');
const { testConnection } = require('../database/mongodb');

const router = express.Router();

// Test database connection endpoint
router.get('/test-db', async (req, res) => {
  try {
    const isConnected = await testConnection();
    
    if (isConnected) {
      res.json({
        success: true,
        message: 'MongoDB connection successful',
        data: {
          connected: true,
          timestamp: new Date().toISOString()
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Database connection failed',
        data: null
      });
    }
  } catch (error) {
    console.error('Test DB endpoint error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

module.exports = router;
