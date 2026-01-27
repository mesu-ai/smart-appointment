/**
 * MongoDB Connection Singleton
 * 
 * Provides a singleton connection to MongoDB to prevent connection pool exhaustion
 * in Next.js development mode (hot reloading creates multiple connections).
 * 
 * Usage:
 * ```ts
 * import { getDb } from '@/lib/db/mongodb';
 * const db = await getDb();
 * const collection = db.collection('appointments');
 * ```
 */

import { Db, MongoClient, MongoClientOptions } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Please define MONGODB_URI in .env.local');
}

if (!process.env.MONGODB_DB_NAME) {
  throw new Error('Please define MONGODB_DB_NAME in .env.local');
}

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME;

interface MongoDBConnection {
  client: MongoClient;
  db: Db;
}

let cachedConnection: MongoDBConnection | null = null;

const options: MongoClientOptions = {
  maxPoolSize: 10,
  minPoolSize: 2,
  maxIdleTimeMS: 30000,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

/**
 * Connect to MongoDB and return database instance
 */
export async function connectToDatabase(): Promise<MongoDBConnection> {
  // Return cached connection in production
  if (cachedConnection) {
    return cachedConnection;
  }

  try {
    const client = await MongoClient.connect(MONGODB_URI, options);
    const db = client.db(MONGODB_DB_NAME);

    const connection: MongoDBConnection = {
      client,
      db,
    };

    // Cache connection in production only
    if (process.env.NODE_ENV === 'production') {
      cachedConnection = connection;
    }

    console.log(`✅ Connected to MongoDB: ${MONGODB_DB_NAME}`);

    return connection;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw new Error('Failed to connect to MongoDB');
  }
}

/**
 * Get database instance
 */
export async function getDb(): Promise<Db> {
  const { db } = await connectToDatabase();
  return db;
}

/**
 * Close MongoDB connection (for testing/cleanup)
 */
export async function closeConnection(): Promise<void> {
  if (cachedConnection) {
    await cachedConnection.client.close();
    cachedConnection = null;
    console.log('🔌 MongoDB connection closed');
  }
}

/**
 * Check if MongoDB is connected
 */
export async function isConnected(): Promise<boolean> {
  try {
    const { client } = await connectToDatabase();
    await client.db().admin().ping();
    return true;
  } catch {
    return false;
  }
}
