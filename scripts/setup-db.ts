/**
 * Database Setup Script
 * 
 * Creates required indexes for optimal performance and data integrity.
 * Run this once after setting up the database.
 * 
 * Run with: npm run setup-db
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

import { getDb } from '../src/lib/db/mongodb';
import { COLLECTIONS } from '../src/lib/db/collections';

async function setupDatabase() {
  console.log('🔧 Starting database setup...\n');

  try {
    // Connect to database
    console.log('📦 Connecting to MongoDB...');
    const db = await getDb();
    console.log('  ✅ Connected\n');

    // Create indexes
    console.log('📊 Creating indexes...');

    // Users collection indexes
    console.log('  • Users collection:');
    await db.collection(COLLECTIONS.USERS).createIndex(
      { email: 1 },
      { unique: true, name: 'email_unique_index' }
    );
    console.log('    ✅ Unique email index created');

    await db.collection(COLLECTIONS.USERS).createIndex(
      { role: 1, isActive: 1 },
      { name: 'role_active_index' }
    );
    console.log('    ✅ Role/active index created');

    // Appointments collection indexes
    console.log('  • Appointments collection:');
    await db.collection(COLLECTIONS.APPOINTMENTS).createIndex(
      { date: 1, status: 1 },
      { name: 'date_status_index' }
    );
    console.log('    ✅ Date/status index created');

    await db.collection(COLLECTIONS.APPOINTMENTS).createIndex(
      { serviceId: 1 },
      { name: 'service_index' }
    );
    console.log('    ✅ Service index created');

    // Queue entries collection indexes
    console.log('  • Queue entries collection:');
    await db.collection(COLLECTIONS.QUEUE_ENTRIES).createIndex(
      { status: 1, position: 1 },
      { name: 'status_position_index' }
    );
    console.log('    ✅ Status/position index created');

    // Services collection indexes
    console.log('  • Services collection:');
    await db.collection(COLLECTIONS.SERVICES).createIndex(
      { isActive: 1 },
      { name: 'active_index' }
    );
    console.log('    ✅ Active index created');

    // Audit logs collection indexes
    console.log('  • Audit logs collection:');
    await db.collection(COLLECTIONS.AUDIT_LOGS).createIndex(
      { timestamp: -1 },
      { name: 'timestamp_index' }
    );
    console.log('    ✅ Timestamp index created');

    console.log('\n✅ Database setup completed successfully!');
    console.log('\n💡 Next step: Run "npm run seed" to create demo users');
    
    process.exit(0);
  } catch (error: any) {
    if (error.code === 11000) {
      console.log('  ⚠️  Some indexes already exist (this is normal)');
      console.log('\n✅ Database setup completed!');
      process.exit(0);
    } else {
      console.error('❌ Setup failed:', error);
      process.exit(1);
    }
  }
}

// Run setup
setupDatabase();
