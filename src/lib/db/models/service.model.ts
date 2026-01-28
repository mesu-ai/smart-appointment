/**
 * Service Model
 * 
 * MongoDB model for service documents with helper methods
 * for service catalog management.
 */

import { Collection, ObjectId, Filter } from 'mongodb';
import { getDb } from '../mongodb';
import { COLLECTIONS } from '../collections';
import type { ServiceDocument } from '@/types/database.types';
import type { Service } from '@/types/domain.types';

/**
 * Get services collection
 */
export async function getServicesCollection(): Promise<Collection<ServiceDocument>> {
  const db = await getDb();
  return db.collection<ServiceDocument>(COLLECTIONS.SERVICES);
}

/**
 * Transform MongoDB document to domain model
 */
export function toServiceDomain(doc: ServiceDocument): Service {
  return {
    id: doc._id.toString(),
    name: doc.name,
    description: doc.description,
    duration: doc.duration,
    price: doc.price,
    category: doc.category,
    maxDailyAppointments: doc.maxDailyAppointments,
    maxQueueSize: doc.maxQueueSize,
    isActive: doc.isActive,
    businessHours: doc.businessHours,
  };
}

/**
 * Find service by ID
 */
export async function findServiceById(id: string): Promise<Service | null> {
  const collection = await getServicesCollection();
  const doc = await collection.findOne({ _id: new ObjectId(id) });
  return doc ? toServiceDomain(doc) : null;
}

/**
 * Find all active services
 */
export async function findActiveServices(): Promise<Service[]> {
  const collection = await getServicesCollection();
  const docs = await collection.find({ isActive: true }).toArray();
  return docs.map(toServiceDomain);
}

/**
 * Find services by filter
 */
export async function findServices(
  filter: Filter<ServiceDocument> = {}
): Promise<Service[]> {
  const collection = await getServicesCollection();
  const docs = await collection.find(filter).toArray();
  return docs.map(toServiceDomain);
}

/**
 * Get service business hours for a specific day
 */
export async function getServiceBusinessHours(
  serviceId: string,
  dayOfWeek: number
): Promise<{ isOpen: boolean; openTime: string; closeTime: string } | null> {
  const service = await findServiceById(serviceId);
  if (!service) return null;

  const hours = service.businessHours.find(h => h.dayOfWeek === dayOfWeek);
  return hours || null;
}

/**
 * Seed initial services (for development)
 * Seeds services matching PDF Section 2: Staff & Service Setup
 */
export async function seedServices(): Promise<void> {
  const collection = await getServicesCollection();
  
  const existingCount = await collection.countDocuments();
  if (existingCount > 0) {
    console.log('  ℹ️  Services already exist');
    return;
  }

  const defaultBusinessHours = [
    // Monday - Friday: 9 AM - 5 PM
    { dayOfWeek: 1, isOpen: true, openTime: '09:00', closeTime: '17:00' },
    { dayOfWeek: 2, isOpen: true, openTime: '09:00', closeTime: '17:00' },
    { dayOfWeek: 3, isOpen: true, openTime: '09:00', closeTime: '17:00' },
    { dayOfWeek: 4, isOpen: true, openTime: '09:00', closeTime: '17:00' },
    { dayOfWeek: 5, isOpen: true, openTime: '09:00', closeTime: '17:00' },
    // Saturday: 10 AM - 2 PM
    { dayOfWeek: 6, isOpen: true, openTime: '10:00', closeTime: '14:00' },
    // Sunday: Closed
    { dayOfWeek: 0, isOpen: false, openTime: '00:00', closeTime: '00:00' },
  ];

  // Services matching PDF requirements
  const services: Omit<ServiceDocument, '_id'>[] = [
    {
      name: 'General Consultation',
      description: 'General consultation with our expert consultants. Perfect for initial assessments and advice.',
      duration: 30,
      price: 50,
      category: 'Consultation',
      maxDailyAppointments: 10,
      maxQueueSize: 8,
      isActive: true,
      businessHours: defaultBusinessHours,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: 'Medical Check-up',
      description: 'Comprehensive medical check-up with certified doctors. Includes health assessment and diagnostics.',
      duration: 60,
      price: 150,
      category: 'Medical',
      maxDailyAppointments: 8,
      maxQueueSize: 5,
      isActive: true,
      businessHours: defaultBusinessHours,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: 'Customer Support',
      description: 'Quick customer support session for inquiries, issues, and general assistance.',
      duration: 15,
      price: 0,
      category: 'Support',
      maxDailyAppointments: 20,
      maxQueueSize: 15,
      isActive: true,
      businessHours: defaultBusinessHours,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  await collection.insertMany(services as ServiceDocument[]);
  console.log(`  ✅ Seeded ${services.length} services (General Consultation, Medical Check-up, Customer Support)`);
}
