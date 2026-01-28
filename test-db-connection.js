/**
 * Test MongoDB Connection
 * Quick script to verify MongoDB connectivity
 */

const { MongoClient } = require('mongodb');
const { config } = require('dotenv');
const { resolve } = require('path');

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });

async function testConnection() {
  const MONGODB_URI = process.env.MONGODB_URI;
  const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME;

  console.log('🔍 Testing MongoDB Connection...\n');
  console.log('URI:', MONGODB_URI?.substring(0, 50) + '...');
  console.log('Database:', MONGODB_DB_NAME);
  console.log('');

  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI not found in environment');
    process.exit(1);
  }

  if (!MONGODB_DB_NAME) {
    console.error('❌ MONGODB_DB_NAME not found in environment');
    process.exit(1);
  }

  try {
    console.log('⏳ Connecting to MongoDB...');
    const client = new MongoClient(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });

    await client.connect();
    console.log('✅ Connected successfully!');

    const db = client.db(MONGODB_DB_NAME);
    
    // Test a simple query
    console.log('⏳ Testing database query...');
    const collections = await db.listCollections().toArray();
    console.log(`✅ Found ${collections.length} collections:`, collections.map(c => c.name).join(', '));

    // Check for users collection
    const usersCollection = db.collection('users');
    const userCount = await usersCollection.countDocuments();
    console.log(`✅ Users collection has ${userCount} documents`);

    await client.close();
    console.log('\n✅ MongoDB connection test PASSED!');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ MongoDB connection test FAILED!');
    console.error('Error:', error.message);
    if (error.cause) {
      console.error('Cause:', error.cause);
    }
    process.exit(1);
  }
}

testConnection();
