/**
 * Appointment Model
 * 
 * MongoDB model for appointment documents with helper methods
 * for CRUD operations and transformations.
 */

import { Collection, ObjectId, Filter, UpdateFilter } from 'mongodb';
import { getDb } from '../mongodb';
import { COLLECTIONS } from '../collections';
import type { AppointmentDocument } from '@/types/database.types';
import type { Appointment, AppointmentStatus } from '@/types/domain.types';

/**
 * Get appointments collection
 */
export async function getAppointmentsCollection(): Promise<Collection<AppointmentDocument>> {
  const db = await getDb();
  return db.collection<AppointmentDocument>(COLLECTIONS.APPOINTMENTS);
}

/**
 * Transform MongoDB document to domain model
 */
export function toAppointmentDomain(doc: AppointmentDocument): Appointment {
  return {
    id: doc._id.toString(),
    serviceId: doc.serviceId,
    serviceName: doc.serviceName,
    date: doc.date.toISOString().split('T')[0]!, // YYYY-MM-DD
    timeSlot: {
      startTime: doc.startTime,
      endTime: doc.endTime,
    },
    duration: doc.duration,
    status: doc.status,
    customerInfo: {
      name: doc.customerName,
      email: doc.customerEmail,
      phone: doc.customerPhone,
      notes: doc.notes,
    },
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

/**
 * Find appointment by ID
 */
export async function findAppointmentById(id: string): Promise<Appointment | null> {
  const collection = await getAppointmentsCollection();
  const doc = await collection.findOne({ _id: new ObjectId(id) });
  return doc ? toAppointmentDomain(doc) : null;
}

/**
 * Find appointments by filter
 */
export async function findAppointments(
  filter: Filter<AppointmentDocument> = {}
): Promise<Appointment[]> {
  const collection = await getAppointmentsCollection();
  const docs = await collection.find(filter).toArray();
  return docs.map(toAppointmentDomain);
}

/**
 * Create new appointment
 */
export async function createAppointment(
  data: Omit<AppointmentDocument, '_id' | 'createdAt' | 'updatedAt'>
): Promise<Appointment> {
  const collection = await getAppointmentsCollection();
  
  const now = new Date();
  const doc: Omit<AppointmentDocument, '_id'> = {
    ...data,
    createdAt: now,
    updatedAt: now,
  };

  const result = await collection.insertOne(doc as AppointmentDocument);
  
  const created = await collection.findOne({ _id: result.insertedId });
  if (!created) {
    throw new Error('Failed to create appointment');
  }

  return toAppointmentDomain(created);
}

/**
 * Update appointment
 */
export async function updateAppointment(
  id: string,
  update: UpdateFilter<AppointmentDocument>
): Promise<Appointment | null> {
  const collection = await getAppointmentsCollection();
  
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

  return result ? toAppointmentDomain(result) : null;
}

/**
 * Update appointment status
 */
export async function updateAppointmentStatus(
  id: string,
  status: AppointmentStatus
): Promise<Appointment | null> {
  return updateAppointment(id, {
    $set: { status },
  });
}

/**
 * Delete appointment
 */
export async function deleteAppointment(id: string): Promise<boolean> {
  const collection = await getAppointmentsCollection();
  const result = await collection.deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount > 0;
}

/**
 * Count appointments by filter
 */
export async function countAppointments(
  filter: Filter<AppointmentDocument> = {}
): Promise<number> {
  const collection = await getAppointmentsCollection();
  return collection.countDocuments(filter);
}

/**
 * Check if time slot is available
 */
export async function isTimeSlotAvailable(
  serviceId: string,
  date: Date,
  startTime: string,
  endTime: string,
  excludeAppointmentId?: string
): Promise<boolean> {
  const collection = await getAppointmentsCollection();
  
  const filter: Filter<AppointmentDocument> = {
    serviceId,
    date,
    status: { $nin: ['CANCELLED', 'NO_SHOW'] },
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
  };

  if (excludeAppointmentId) {
    filter._id = { $ne: new ObjectId(excludeAppointmentId) };
  }

  const count = await collection.countDocuments(filter);
  return count === 0;
}
