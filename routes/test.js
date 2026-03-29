const express = require('express');
const { testConnection, executeQuery } = require('../database/db');

const router = express.Router();

// Test database connection endpoint
router.get('/test-db', async (req, res) => {
  try {
    const isConnected = await testConnection();
    
    if (isConnected) {
      // Test a simple query
      const result = await executeQuery('SELECT 1 as test');
      
      res.json({
        success: true,
        message: 'Database connection successful',
        data: {
          connected: true,
          testQuery: result,
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
