const express = require('express');
const bcrypt = require('bcryptjs');
const { executeQuery } = require('../database/db');

const router = express.Router();

// POST /signup - Create a new user
router.post('/signup', async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      apartment_name,
      flat_number,
      wing_or_tower
    } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, email, phone, password'
      });
    }

    // Check if user already exists
    const existingUser = await executeQuery(
      'SELECT id FROM Users WHERE phone = ? OR email = ?',
      [phone, email]
    );

    if (existingUser.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'User with this phone or email already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user with apartment details
    const result = await executeQuery(
      `INSERT INTO Users (name, email, phone, password, apartment_name, flat_number, wing_or_tower)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, email, phone, hashedPassword, apartment_name || null, flat_number || null, wing_or_tower || null]
    );

    // Get the created user (without password)
    const newUser = await executeQuery(
      'SELECT id, name, email, phone, apartment_name, flat_number, wing_or_tower, created_at FROM Users WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: newUser[0]
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// POST /login - User login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user by email
    const users = await executeQuery(
      'SELECT id, name, email, phone, password, apartment_name, flat_number, wing_or_tower, created_at FROM Users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const user = users[0];

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: 'Login successful',
      data: userWithoutPassword
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// GET /users - Get all users (for testing)
router.get('/users', async (req, res) => {
  try {
    const users = await executeQuery(
      'SELECT id, name, email, phone, apartment_name, flat_number, wing_or_tower, created_at FROM Users'
    );

    res.json({
      success: true,
      message: 'Users retrieved successfully',
      data: users
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// GET /apartments - Get apartment names for autocomplete (from both tables)
router.get('/apartments', async (req, res) => {
  try {
    // Prevent caching
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    
    const { search } = req.query;
    
    // Get from Apartments table
    let aptQuery = 'SELECT name, address FROM Apartments WHERE 1=1';
    let params = [];
    
    if (search) {
      aptQuery += ' AND name LIKE ?';
      params.push(`%${search}%`);
    }
    aptQuery += ' ORDER BY name LIMIT 10';
    
    const apartmentsFromTable = await executeQuery(aptQuery, params);
    
    // Get from Users table (existing registered apartments)
    let userQuery = 'SELECT DISTINCT apartment_name FROM Users WHERE apartment_name IS NOT NULL';
    let userParams = [];
    
    if (search) {
      userQuery += ' AND apartment_name LIKE ?';
      userParams.push(`%${search}%`);
    }
    userQuery += ' ORDER BY apartment_name LIMIT 10';
    
    const apartmentsFromUsers = await executeQuery(userQuery, userParams);
    
    // Merge and remove duplicates
    const allApartments = new Map();
    
    // Add from Apartments table
    apartmentsFromTable.forEach(a => {
      allApartments.set(a.name, { name: a.name, address: a.address });
    });
    
    // Add from Users table (only if not already exists)
    apartmentsFromUsers.forEach(a => {
      if (!allApartments.has(a.apartment_name)) {
        allApartments.set(a.apartment_name, { name: a.apartment_name, address: '' });
      }
    });
    
    // Convert to array and limit to 10
    const result = Array.from(allApartments.values()).slice(0, 10);

    res.json({
      success: true,
      message: 'Apartments retrieved successfully',
      data: result
    });

  } catch (error) {
    console.error('Get apartments error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

module.exports = router;
