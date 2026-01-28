/**
 * Queue Entry Model
 * 
 * MongoDB model for queue entry documents with helper methods
 * for CRUD operations and queue management.
 */

import { Collection, ObjectId, Filter, UpdateFilter } from 'mongodb';
import { getDb } from '../mongodb';
import { COLLECTIONS } from '../collections';
import type { QueueEntryDocument } from '@/types/database.types';
import type { QueueEntry, QueueStatus } from '@/types/domain.types';

/**
 * Get queue entries collection
 */
export async function getQueueEntriesCollection(): Promise<Collection<QueueEntryDocument>> {
  const db = await getDb();
  return db.collection<QueueEntryDocument>(COLLECTIONS.QUEUE_ENTRIES);
}

/**
 * Transform MongoDB document to domain model
 */
export function toQueueEntryDomain(doc: QueueEntryDocument): QueueEntry {
  return {
    id: doc._id.toString(),
    serviceId: doc.serviceId,
    serviceName: doc.serviceName,
    position: doc.position,
    status: doc.status,
    priority: doc.priority,
    customerInfo: {
      name: doc.customerName,
      email: doc.customerEmail,
      phone: doc.customerPhone,
      notes: doc.notes,
    },
    estimatedWaitTime: doc.estimatedWaitTime,
    joinedAt: doc.joinedAt.toISOString(),
    calledAt: doc.calledAt?.toISOString(),
    completedAt: doc.completedAt?.toISOString(),
  };
}

/**
 * Find queue entry by ID
 */
export async function findQueueEntryById(id: string): Promise<QueueEntry | null> {
  const collection = await getQueueEntriesCollection();
  const doc = await collection.findOne({ _id: new ObjectId(id) });
  return doc ? toQueueEntryDomain(doc) : null;
}

/**
 * Find queue entries by filter
 */
export async function findQueueEntries(
  filter: Filter<QueueEntryDocument> = {}
): Promise<QueueEntry[]> {
  const collection = await getQueueEntriesCollection();
  const docs = await collection
    .find(filter)
    .sort({ priority: -1, position: 1 })
    .toArray();
  return docs.map(toQueueEntryDomain);
}

/**
 * Get active queue entries for a service
 */
export async function getActiveQueue(serviceId: string): Promise<QueueEntry[]> {
  return findQueueEntries({
    serviceId,
    status: { $in: ['WAITING', 'CALLED', 'IN_SERVICE'] },
  });
}

/**
 * Create new queue entry
 */
export async function createQueueEntry(
  data: Omit<QueueEntryDocument, '_id' | 'createdAt' | 'updatedAt'>
): Promise<QueueEntry> {
  const collection = await getQueueEntriesCollection();
  
  const now = new Date();
  const doc: Omit<QueueEntryDocument, '_id'> = {
    ...data,
    createdAt: now,
    updatedAt: now,
  };

  const result = await collection.insertOne(doc as QueueEntryDocument);
  
  const created = await collection.findOne({ _id: result.insertedId });
  if (!created) {
    throw new Error('Failed to create queue entry');
  }

  return toQueueEntryDomain(created);
}

/**
 * Update queue entry
 */
export async function updateQueueEntry(
  id: string,
  update: UpdateFilter<QueueEntryDocument>
): Promise<QueueEntry | null> {
  const collection = await getQueueEntriesCollection();
  
  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    {
      ...update,
      $set: {
        ...(update.$set || {}),
        updatedAt: new Date(),
      },
    },
    { returnDocument: 'after' }
  );

  return result ? toQueueEntryDomain(result) : null;
}

/**
 * Update queue entry status
 */
export async function updateQueueEntryStatus(
  id: string,
  status: QueueStatus
): Promise<QueueEntry | null> {
  const setFields: Partial<QueueEntryDocument> = { status };

  // Set timestamp fields based on status
  if (status === 'CALLED') {
    setFields.calledAt = new Date();
  } else if (status === 'COMPLETED') {
    setFields.completedAt = new Date();
  }

  const updates: UpdateFilter<QueueEntryDocument> = {
    $set: setFields,
  };

  return updateQueueEntry(id, updates);
}

/**
 * Delete queue entry
 */
export async function deleteQueueEntry(id: string): Promise<boolean> {
  const collection = await getQueueEntriesCollection();
  const result = await collection.deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount > 0;
}

/**
 * Get next available position in queue
 */
export async function getNextQueuePosition(serviceId: string): Promise<number> {
  const collection = await getQueueEntriesCollection();
  
  const lastEntry = await collection
    .find({
      serviceId,
      status: { $in: ['WAITING', 'CALLED'] },
    })
    .sort({ position: -1 })
    .limit(1)
    .toArray();

  return lastEntry.length > 0 ? lastEntry[0]!.position + 1 : 1;
}

/**
 * Count active queue entries for a service
 */
export async function countActiveQueueEntries(serviceId: string): Promise<number> {
  const collection = await getQueueEntriesCollection();
  return collection.countDocuments({
    serviceId,
    status: { $in: ['WAITING', 'CALLED'] },
  });
}

/**
 * Check if customer is already in queue
 */
export async function isCustomerInQueue(
  serviceId: string,
  customerEmail: string
): Promise<boolean> {
  const collection = await getQueueEntriesCollection();
  const count = await collection.countDocuments({
    serviceId,
    customerEmail,
    status: { $in: ['WAITING', 'CALLED', 'IN_SERVICE'] },
  });
  return count > 0;
}

/**
 * Find next entry to call (highest priority, lowest position)
 */
export async function findNextToCall(serviceId: string): Promise<QueueEntry | null> {
  const collection = await getQueueEntriesCollection();
  const doc = await collection
    .find({
      serviceId,
      status: 'WAITING',
    })
    .sort({ priority: -1, position: 1 })
    .limit(1)
    .toArray();

  return doc.length > 0 ? toQueueEntryDomain(doc[0]!) : null;
}
