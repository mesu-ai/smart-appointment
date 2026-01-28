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

interface MongoDBConnection {
  client: MongoClient;
  db: Db;
}

let cachedConnection: MongoDBConnection | null = null;

const options: MongoClientOptions = {
  maxPoolSize: 10,
  minPoolSize: 2,
  maxIdleTimeMS: 30000,
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  family: 4, // Force IPv4 to avoid IPv6 SSL issues
  tls: true,
};

/**
 * Connect to MongoDB and return database instance
 */
export async function connectToDatabase(): Promise<MongoDBConnection> {
  // Validate environment variables (lazy - only when connection is attempted)
  if (!process.env.MONGODB_URI) {
    throw new Error('Please define MONGODB_URI in .env.local');
  }

  if (!process.env.MONGODB_DB_NAME) {
    throw new Error('Please define MONGODB_DB_NAME in .env.local');
  }

  const MONGODB_URI = process.env.MONGODB_URI;
  const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME;

  // Return cached connection if available
  if (cachedConnection) {
    try {
      // Verify connection is still alive
      await cachedConnection.client.db().admin().ping();
      return cachedConnection;
    } catch {
      // Connection died, clear cache and reconnect
      cachedConnection = null;
    }
  }

  try {
    const client = await MongoClient.connect(MONGODB_URI, options);
    const db = client.db(MONGODB_DB_NAME);

    const connection: MongoDBConnection = {
      client,
      db,
    };

    cachedConnection = connection;

    return connection;
  } catch (error) {
    cachedConnection = null;
    
    // Log the actual error for debugging
    if (process.env.NODE_ENV === 'development') {
      console.error('[MongoDB] Connection failed:', error);
    }
    
    if (error instanceof Error) {
      const errorMessage = error.message;
      
      if (errorMessage.includes('ENOTFOUND') || errorMessage.includes('ETIMEDOUT')) {
        throw new Error('Unable to reach MongoDB server. Please check your internet connection.');
      }
      
      if (errorMessage.includes('Authentication failed') || errorMessage.includes('auth failed')) {
        throw new Error('MongoDB authentication failed. Please check credentials in .env.local');
      }
      
      if (errorMessage.includes('SSL') || errorMessage.includes('TLS') || errorMessage.includes('certificate')) {
        // Pass through the actual error for debugging
        throw new Error(`MongoDB SSL/TLS error: ${errorMessage}`);
      }
      
      if (errorMessage.includes('MongoServerError')) {
        throw new Error(`MongoDB server error: ${errorMessage}`);
      }
      
      // Return actual error message for better debugging
      throw new Error(`MongoDB connection failed: ${errorMessage}`);
    }
    
    throw new Error('Failed to connect to MongoDB. Unknown error occurred.');
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
