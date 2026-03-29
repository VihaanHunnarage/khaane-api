const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || 'khaane_me_kya_hai';

let client;
let db;

// Connect to MongoDB
async function connectDB() {
  if (db) return db;
  
  try {
    client = new MongoClient(uri, {
      maxPoolSize: 10,
      minPoolSize: 5
    });
    
    await client.connect();
    db = client.db(dbName);
    console.log('✅ MongoDB connected successfully');
    return db;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    throw error;
  }
}

// Get database instance
function getDB() {
  if (!db) {
    throw new Error('Database not connected. Call connectDB() first.');
  }
  return db;
}

// Test connection
async function testConnection() {
  try {
    const database = await connectDB();
    await database.command({ ping: 1 });
    console.log('✅ Database test query successful');
    return true;
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    return false;
  }
}

// Close connection
async function closeConnection() {
  if (client) {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

module.exports = {
  connectDB,
  getDB,
  testConnection,
  closeConnection
};
