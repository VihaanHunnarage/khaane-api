const express = require('express');
const bcrypt = require('bcryptjs');
const { getDB } = require('../database/mongodb');

const router = express.Router();
const USERS_COLLECTION = 'users';

// POST /signup - Create a new user
router.post('/signup', async (req, res) => {
  try {
    const db = getDB();
    const collection = db.collection(USERS_COLLECTION);
    
    const { name, email, phone, password, apartment_name, flat_number, wing_or_tower } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, email, phone, password'
      });
    }

    // Check if user already exists
    const existingUser = await collection.findOne({
      $or: [{ phone }, { email }]
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this phone or email already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    const newUser = {
      name,
      email,
      phone,
      password: hashedPassword,
      apartment_name: apartment_name || null,
      flat_number: flat_number || null,
      wing_or_tower: wing_or_tower || null,
      created_at: new Date()
    };

    const result = await collection.insertOne(newUser);

    // Return user without password
    const { password: _, ...userWithoutPassword } = newUser;
    userWithoutPassword.id = result.insertedId;

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: userWithoutPassword
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
    const db = getDB();
    const collection = db.collection(USERS_COLLECTION);
    
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user by email
    const user = await collection.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

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
    const db = getDB();
    const collection = db.collection(USERS_COLLECTION);
    
    const users = await collection
      .find({}, { projection: { password: 0 } })
      .toArray();

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

// GET /apartments - Get apartment names for autocomplete
router.get('/apartments', async (req, res) => {
  try {
    const db = getDB();
    const collection = db.collection(USERS_COLLECTION);
    
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    
    const { search } = req.query;
    
    const filter = { apartment_name: { $ne: null } };
    if (search) {
      filter.apartment_name = { $regex: search, $options: 'i' };
    }
    
    const apartments = await collection
      .distinct('apartment_name', filter);
    
    const result = apartments
      .filter(a => a)
      .slice(0, 10)
      .map(name => ({ name, address: '' }));

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
