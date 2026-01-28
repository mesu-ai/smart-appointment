/**
 * User Model
 * 
 * MongoDB model for user documents with authentication support.
 */

import { Collection, ObjectId, Filter } from 'mongodb';
import { getDb } from '../mongodb';
import { COLLECTIONS } from '../collections';
import type { UserDocument } from '@/types/database.types';
import type { User } from '@/types/domain.types';

/**
 * Get users collection
 */
export async function getUsersCollection(): Promise<Collection<UserDocument>> {
  const db = await getDb();
  return db.collection<UserDocument>(COLLECTIONS.USERS);
}

/**
 * Transform MongoDB document to domain model
 */
export function toUserDomain(doc: UserDocument): User {
  return {
    id: doc._id.toString(),
    email: doc.email,
    name: doc.name,
    phone: doc.phone,
    role: doc.role,
    isActive: doc.isActive,
    createdAt: doc.createdAt.toISOString(),
    lastLoginAt: doc.lastLoginAt?.toISOString(),
  };
}

/**
 * Find user by email
 */
export async function findUserByEmail(email: string): Promise<UserDocument | null> {
  const collection = await getUsersCollection();
  return await collection.findOne({ email: email.toLowerCase() });
}

/**
 * Find user by ID
 */
export async function findUserById(id: string): Promise<User | null> {
  const collection = await getUsersCollection();
  const doc = await collection.findOne({ _id: new ObjectId(id) });
  return doc ? toUserDomain(doc) : null;
}

/**
 * Find all users with optional filter
 */
export async function findUsers(filter: Filter<UserDocument> = {}): Promise<User[]> {
  const collection = await getUsersCollection();
  const docs = await collection
    .find(filter)
    .sort({ createdAt: -1 })
    .toArray();
  
  return docs.map(toUserDomain);
}

/**
 * Create new user
 */
export async function createUser(data: {
  email: string;
  passwordHash: string;
  name: string;
  phone?: string;
  role: 'ADMIN' | 'STAFF' | 'CUSTOMER';
}): Promise<User> {
  const collection = await getUsersCollection();
  
  const doc: Omit<UserDocument, '_id'> = {
    email: data.email.toLowerCase(),
    passwordHash: data.passwordHash,
    name: data.name,
    phone: data.phone,
    role: data.role,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await collection.insertOne(doc as UserDocument);
  const created = await collection.findOne({ _id: result.insertedId });
  
  if (!created) {
    throw new Error('Failed to create user');
  }

  return toUserDomain(created);
}

/**
 * Update user
 */
export async function updateUser(
  id: string,
  updates: {
    name?: string;
    phone?: string;
    role?: 'ADMIN' | 'STAFF' | 'CUSTOMER';
    isActive?: boolean;
    passwordHash?: string;
  }
): Promise<User> {
  const collection = await getUsersCollection();
  
  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    {
      $set: {
        ...updates,
        updatedAt: new Date(),
      },
    },
    { returnDocument: 'after' }
  );

  if (!result) {
    throw new Error('User not found');
  }

  return toUserDomain(result);
}

/**
 * Update last login time
 */
export async function updateLastLogin(id: string): Promise<void> {
  const collection = await getUsersCollection();
  
  await collection.updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        lastLoginAt: new Date(),
        updatedAt: new Date(),
      },
    }
  );
}

/**
 * Delete user (soft delete by setting isActive to false)
 */
export async function deleteUser(id: string): Promise<void> {
  const collection = await getUsersCollection();
  
  await collection.updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        isActive: false,
        updatedAt: new Date(),
      },
    }
  );
}

/**
 * Seed initial admin user
 */
export async function seedAdminUser(): Promise<void> {
  const collection = await getUsersCollection();
  
  const existingAdmin = await collection.findOne({ role: 'ADMIN' });
  if (existingAdmin) {
    console.log('  ℹ️  Admin user already exists');
    return;
  }

  // Default admin credentials (CHANGE IN PRODUCTION!)
  // Password: admin123
  const bcrypt = require('bcryptjs');
  const passwordHash = await bcrypt.hash('admin123', 10);

  const adminUser: Omit<UserDocument, '_id'> = {
    email: 'admin@smartqueue.com',
    passwordHash,
    name: 'System Administrator',
    role: 'ADMIN',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await collection.insertOne(adminUser as UserDocument);
  console.log('  ✅ Admin user created (email: admin@smartqueue.com, password: admin123)');
}

/**
 * Seed staff users
 * Seeds staff matching PDF Section 2: Staff & Service Setup
 */
export async function seedStaffUsers(): Promise<void> {
  const collection = await getUsersCollection();
  
  const existingStaff = await collection.countDocuments({ role: 'STAFF' });
  if (existingStaff > 0) {
    console.log('  ℹ️  Staff users already exist');
    return;
  }

  // Default password for all staff (CHANGE IN PRODUCTION!)
  const bcrypt = require('bcryptjs');
  const passwordHash = await bcrypt.hash('staff123', 10);

  const staffUsers: Omit<UserDocument, '_id'>[] = [
    {
      email: 'riya@smartqueue.com',
      passwordHash,
      name: 'Riya Sharma',
      phone: '+1234567891',
      role: 'STAFF',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      email: 'farhan@smartqueue.com',
      passwordHash,
      name: 'Farhan Ahmed',
      phone: '+1234567892',
      role: 'STAFF',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      email: 'amit@smartqueue.com',
      passwordHash,
      name: 'Amit Patel',
      phone: '+1234567893',
      role: 'STAFF',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  await collection.insertMany(staffUsers as UserDocument[]);
  console.log(`  ✅ Seeded ${staffUsers.length} staff users (Riya, Farhan, Amit) - password: staff123`);
}
