/**
 * Database Seeding Script
 * 
 * Seeds the database with initial data per PDF Section 2:
 * - Demo admin user
 * - Staff users (Riya, Farhan, Amit)
 * - Services (General Consultation, Medical Check-up, Customer Support)
 * 
 * Run with: npm run seed
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

import { seedAdminUser, seedStaffUsers } from '../src/lib/db/models/user.model';
import { seedServices } from '../src/lib/db/models/service.model';
import { getDb } from '../src/lib/db/mongodb';

async function seedDatabase() {
  console.log('🌱 Starting database seeding...\n');

  try {
    // Connect to database
    console.log('📦 Connecting to MongoDB...');
    await getDb();
    console.log('  ✅ Connected\n');

    // Seed admin user
    console.log('👤 Seeding admin user...');
    await seedAdminUser();
    console.log();

    // Seed staff users
    console.log('👥 Seeding staff users...');
    await seedStaffUsers();
    console.log();

    // Seed services
    console.log('🛠️  Seeding services...');
    await seedServices();
    console.log();

    console.log('✅ Database seeding completed successfully!');
    console.log('   • Admin user ready (admin@smartqueue.com / admin123)');
    console.log('   • Staff users ready (riya@smartqueue.com, farhan@smartqueue.com, amit@smartqueue.com / staff123)');
    console.log('   • Services ready (General Consultation, Medical Check-up, Customer Support)');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

// Run seeding
seedDatabase();
