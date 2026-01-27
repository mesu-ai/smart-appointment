/**
 * Time Slot Lock Model
 * 
 * MongoDB model for time slot locks to prevent race conditions
 * during concurrent appointment bookings.
 */

import { Collection, ObjectId } from 'mongodb';
import { getDb } from '../mongodb';
import { COLLECTIONS } from '../collections';
import type { TimeSlotLockDocument } from '@/types/database.types';

/**
 * Get time slot locks collection
 */
export async function getTimeSlotLocksCollection(): Promise<Collection<TimeSlotLockDocument>> {
  const db = await getDb();
  return db.collection<TimeSlotLockDocument>(COLLECTIONS.TIME_SLOT_LOCKS);
}

/**
 * Create a time slot lock
 */
export async function createTimeSlotLock(
  serviceId: string,
  date: Date,
  startTime: string,
  endTime: string,
  appointmentId: ObjectId
): Promise<void> {
  const collection = await getTimeSlotLocksCollection();
  
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 5); // Lock expires in 5 minutes

  const lock: Omit<TimeSlotLockDocument, '_id'> = {
    serviceId,
    date,
    startTime,
    endTime,
    appointmentId,
    createdAt: new Date(),
    expiresAt,
  };

  await collection.insertOne(lock as TimeSlotLockDocument);
}

/**
 * Remove time slot lock
 */
export async function removeTimeSlotLock(appointmentId: ObjectId): Promise<void> {
  const collection = await getTimeSlotLocksCollection();
  await collection.deleteOne({ appointmentId });
}

/**
 * Check if time slot is locked
 */
export async function isTimeSlotLocked(
  serviceId: string,
  date: Date,
  startTime: string,
  endTime: string
): Promise<boolean> {
  const collection = await getTimeSlotLocksCollection();
  
  const count = await collection.countDocuments({
    serviceId,
    date,
    expiresAt: { $gt: new Date() }, // Only count non-expired locks
    $or: [
      {
        $and: [
          { startTime: { $lte: startTime } },
          { endTime: { $gt: startTime } },
        ],
      },
      {
        $and: [
          { startTime: { $lt: endTime } },
          { endTime: { $gte: endTime } },
        ],
      },
      {
        $and: [
          { startTime: { $gte: startTime } },
          { endTime: { $lte: endTime } },
        ],
      },
    ],
  });

  return count > 0;
}

/**
 * Create TTL index for automatic cleanup of expired locks
 */
export async function createTimeSlotLockIndexes(): Promise<void> {
  const collection = await getTimeSlotLocksCollection();
  
  // TTL index to automatically delete expired locks
  await collection.createIndex(
    { expiresAt: 1 },
    { expireAfterSeconds: 0 }
  );

  // Compound index for efficient lock lookups
  await collection.createIndex({
    serviceId: 1,
    date: 1,
    startTime: 1,
    endTime: 1,
  });

  console.log('✅ Created time slot lock indexes');
}
