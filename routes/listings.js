const express = require('express');
const { getDB } = require('../database/mongodb');
const { ObjectId } = require('mongodb');

const router = express.Router();

const COLLECTION = 'food_listings';

// POST /api/listings - Create new food listing
router.post('/', async (req, res) => {
  try {
    const db = getDB();
    const collection = db.collection(COLLECTION);
    
    const {
      sellerId, sellerName, sellerApartment, name, category,
      description, price, quantity, prepTime, image, dietaryType,
      orderTimeStart, orderTimeEnd, deliveryTimeStart, deliveryTimeEnd, allergens
    } = req.body;

    if (!name || !price || !quantity || !sellerId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, price, quantity, sellerId'
      });
    }

    const newListing = {
      sellerId, sellerName: sellerName || '', sellerApartment: sellerApartment || '',
      name, category: category || 'lunch', description: description || '',
      price: parseFloat(price), quantity: parseInt(quantity), prepTime: prepTime || 30,
      rating: 0, image: image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c',
      dietaryType: dietaryType || 'veg',
      orderTimeStart: orderTimeStart || '', orderTimeEnd: orderTimeEnd || '',
      deliveryTimeStart: deliveryTimeStart || '', deliveryTimeEnd: deliveryTimeEnd || '',
      allergens: allergens || {}, isAvailable: true,
      createdAt: new Date(), updatedAt: new Date()
    };

    const result = await collection.insertOne(newListing);

    res.status(201).json({
      success: true,
      message: 'Food listing created successfully',
      data: { id: result.insertedId, ...newListing }
    });

  } catch (error) {
    console.error('Create listing error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
});

// GET /api/listings - Get all listings
router.get('/', async (req, res) => {
  try {
    const db = getDB();
    const collection = db.collection(COLLECTION);
    
    const { apartment, category, sellerId, available } = req.query;
    const filter = {};
    if (apartment) filter.sellerApartment = apartment;
    if (category) filter.category = category;
    if (sellerId) filter.sellerId = sellerId;
    if (available === 'true') filter.isAvailable = true;
    
    const listings = await collection.find(filter).sort({ createdAt: -1 }).toArray();
    res.json({ success: true, count: listings.length, data: listings });

  } catch (error) {
    console.error('Get listings error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
});

// GET /api/listings/:id - Get single listing
router.get('/:id', async (req, res) => {
  try {
    const db = getDB();
    const collection = db.collection(COLLECTION);
    const listing = await collection.findOne({ _id: new ObjectId(req.params.id) });

    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }
    res.json({ success: true, data: listing });

  } catch (error) {
    console.error('Get listing error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
});

// PUT /api/listings/:id - Update listing
router.put('/:id', async (req, res) => {
  try {
    const db = getDB();
    const collection = db.collection(COLLECTION);
    const updates = { ...req.body, updatedAt: new Date() };
    delete updates._id; delete updates.createdAt;
    
    const result = await collection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: updates }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }
    res.json({ success: true, message: 'Listing updated successfully' });

  } catch (error) {
    console.error('Update listing error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
});

// DELETE /api/listings/:id - Delete listing
router.delete('/:id', async (req, res) => {
  try {
    const db = getDB();
    const collection = db.collection(COLLECTION);
    const result = await collection.deleteOne({ _id: new ObjectId(req.params.id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }
    res.json({ success: true, message: 'Listing deleted successfully' });

  } catch (error) {
    console.error('Delete listing error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
});

module.exports = router;
