/**
 * MongoDB Database Connection Service
 * Handles connection to MongoDB Atlas for persistent analytics storage
 */

import { MongoClient } from 'mongodb';

let client = null;
let db = null;

/**
 * Connect to MongoDB
 */
export async function connectDatabase() {
  const mongoUri = process.env.MONGODB_URI;
  
  // If no MongoDB URI, return null (will use file-based fallback)
  if (!mongoUri) {
    console.log('⚠️  MONGODB_URI not set - using file-based storage');
    return null;
  }

  try {
    if (!client) {
      client = new MongoClient(mongoUri);
      await client.connect();
      db = client.db('ats_scanner');
      console.log('✅ Connected to MongoDB Atlas');
    }
    return db;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    return null;
  }
}

/**
 * Get database instance
 */
export async function getDatabase() {
  if (!db) {
    await connectDatabase();
  }
  return db;
}

/**
 * Close database connection
 */
export async function closeDatabase() {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log('🔌 MongoDB connection closed');
  }
}
