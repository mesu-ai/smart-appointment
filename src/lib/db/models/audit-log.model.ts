/**
 * Audit Log Model
 * 
 * MongoDB model for audit log tracking.
 */

import { Collection, Filter } from 'mongodb';
import { getDb } from '../mongodb';
import { COLLECTIONS } from '../collections';
import type { AuditLogDocument, AuditAction } from '@/types/database.types';

/**
 * Get audit logs collection
 */
export async function getAuditLogsCollection(): Promise<Collection<AuditLogDocument>> {
  const db = await getDb();
  return db.collection<AuditLogDocument>(COLLECTIONS.AUDIT_LOGS);
}

/**
 * Domain model for audit log
 */
export interface AuditLog {
  id: string;
  action: AuditAction;
  entityType: 'APPOINTMENT' | 'QUEUE_ENTRY' | 'SERVICE' | 'USER';
  entityId: string;
  userId?: string;
  userName?: string;
  changes?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

/**
 * Transform MongoDB document to domain model
 */
export function toAuditLogDomain(doc: AuditLogDocument): AuditLog {
  return {
    id: doc._id.toString(),
    action: doc.action,
    entityType: doc.entityType,
    entityId: doc.entityId,
    userId: doc.userId,
    userName: doc.userName,
    changes: doc.changes,
    metadata: doc.metadata,
    timestamp: doc.timestamp.toISOString(),
  };
}

/**
 * Create audit log entry
 */
export async function createAuditLog(data: {
  action: AuditAction;
  entityType: 'APPOINTMENT' | 'QUEUE_ENTRY' | 'SERVICE' | 'USER';
  entityId: string;
  userId?: string;
  userName?: string;
  changes?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}): Promise<AuditLog> {
  const collection = await getAuditLogsCollection();
  
  const doc: Omit<AuditLogDocument, '_id'> = {
    action: data.action,
    entityType: data.entityType,
    entityId: data.entityId,
    userId: data.userId,
    userName: data.userName,
    changes: data.changes,
    metadata: data.metadata,
    timestamp: new Date(),
  };

  const result = await collection.insertOne(doc as AuditLogDocument);
  const created = await collection.findOne({ _id: result.insertedId });
  
  if (!created) {
    throw new Error('Failed to create audit log');
  }

  return toAuditLogDomain(created);
}

/**
 * Find audit logs with filtering
 */
export async function findAuditLogs(params?: {
  action?: AuditAction;
  entityType?: 'APPOINTMENT' | 'QUEUE_ENTRY' | 'SERVICE' | 'USER';
  entityId?: string;
  userId?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}): Promise<AuditLog[]> {
  const collection = await getAuditLogsCollection();
  
  const filter: Filter<AuditLogDocument> = {};

  if (params?.action) {
    filter.action = params.action;
  }

  if (params?.entityType) {
    filter.entityType = params.entityType;
  }

  if (params?.entityId) {
    filter.entityId = params.entityId;
  }

  if (params?.userId) {
    filter.userId = params.userId;
  }

  if (params?.startDate || params?.endDate) {
    filter.timestamp = {};
    if (params.startDate) {
      filter.timestamp.$gte = params.startDate;
    }
    if (params.endDate) {
      filter.timestamp.$lte = params.endDate;
    }
  }

  const docs = await collection
    .find(filter)
    .sort({ timestamp: -1 })
    .limit(params?.limit || 100)
    .toArray();

  return docs.map(toAuditLogDomain);
}
