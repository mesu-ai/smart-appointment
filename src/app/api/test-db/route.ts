/**
 * Test API route to check MongoDB connection from Next.js
 */

import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongodb';

export async function GET() {
  try {
    console.log('Testing MongoDB connection from API route...');
    console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);
    console.log('MONGODB_DB_NAME:', process.env.MONGODB_DB_NAME);
    
    const { db, client } = await connectToDatabase();
    
    // Test ping
    await client.db().admin().ping();
    
    // List collections
    const collections = await db.listCollections().toArray();
    
    return NextResponse.json({
      status: 'success',
      message: 'MongoDB connected successfully',
      database: db.databaseName,
      collections: collections.map(c => ({
        name: c.name,
        type: c.type
      }))
    });
  } catch (error) {
    console.error('[API] MongoDB test failed:', error);
    
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      details: error instanceof Error ? error.stack : undefined,
      env: {
        hasMongoUri: !!process.env.MONGODB_URI,
        hasDbName: !!process.env.MONGODB_DB_NAME,
        nodeEnv: process.env.NODE_ENV
      }
    }, { status: 500 });
  }
}
