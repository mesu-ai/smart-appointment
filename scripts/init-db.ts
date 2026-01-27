/**
 * Database Initialization Script
 * 
 * Creates necessary indexes and seeds initial data.
 * Run this after first deployment or database reset.
 * 
 * Usage: tsx scripts/init-db.ts
 */

import { getDb } from '../src/lib/db/mongodb';
import { COLLECTIONS } from '../src/lib/db/collections';
import { createTimeSlotLockIndexes } from '../src/lib/db/models/time-slot-lock.model';
import { seedServices } from '../src/lib/db/models/service.model';
import { seedAdminUser } from '../src/lib/db/models/user.model';

async function initializeDatabase(): Promise<void> {
  console.log('🚀 Initializing database...\n');

  try {
    const db = await getDb();

    // ============================================
    // CREATE INDEXES
    // ============================================

    console.log('📑 Creating indexes...');

    // Appointments indexes
    await db.collection(COLLECTIONS.APPOINTMENTS).createIndexes([
      { key: { serviceId: 1, date: 1, startTime: 1 } },
      { key: { customerEmail: 1, date: 1 } },
      { key: { status: 1, date: 1 } },
    ]);
    console.log('  ✅ Appointments indexes created');

    // Queue entries indexes
    await db.collection(COLLECTIONS.QUEUE_ENTRIES).createIndexes([
      { key: { serviceId: 1, status: 1, priority: -1, position: 1 } },
      { key: { customerEmail: 1, serviceId: 1 } },
      { key: { joinedAt: 1 } },
    ]);
    console.log('  ✅ Queue entries indexes created');

    // Services indexes
    await db.collection(COLLECTIONS.SERVICES).createIndexes([
      { key: { isActive: 1 } },
      { key: { category: 1 } },
    ]);
    console.log('  ✅ Services indexes created');

    // Time slot locks indexes (with TTL)
    await createTimeSlotLockIndexes();
    console.log('  ✅ Time slot locks indexes created');

    // Users indexes
    await db.collection(COLLECTIONS.USERS).createIndexes([
      { key: { email: 1 }, unique: true },
      { key: { role: 1, isActive: 1 } },
    ]);
    console.log('  ✅ Users indexes created');

    // Audit logs indexes
    await db.collection(COLLECTIONS.AUDIT_LOGS).createIndexes([
      { key: { entityType: 1, entityId: 1, timestamp: -1 } },
      { key: { userId: 1, timestamp: -1 } },
      { key: { timestamp: -1 } },
    ]);
    console.log('  ✅ Audit logs indexes created');

    // ============================================
    // SEED INITIAL DATA
    // ============================================

    console.log('\n🌱 Seeding initial data...');

    await seedServices();
    await seedAdminUser();

    console.log('\n✅ Database initialization complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  initializeDatabase();
}

export { initializeDatabase };
