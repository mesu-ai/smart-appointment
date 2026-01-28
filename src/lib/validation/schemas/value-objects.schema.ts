/**
 * Validation Schemas - Value Objects
 * 
 * Zod schemas for validating value objects and primitive types.
 */

import { z } from 'zod';

/**
 * Email validation schema
 */
export const EmailSchema = z
  .string()
  .email('Invalid email format')
  .min(5, 'Email must be at least 5 characters')
  .max(100, 'Email must not exceed 100 characters')
  .toLowerCase()
  .trim();

/**
 * Phone number validation schema
 * Accepts Bangladesh phone numbers and normalizes to E.164 format
 * 
 * Accepted formats:
 * - Bangladesh: 01XXXXXXXXX, +8801XXXXXXXXX, 8801XXXXXXXXX
 * - International E.164: +XXXXXXXXXXXX
 */
export const PhoneSchema = z
  .string()
  .trim()
  .transform((phone) => {
    // Remove spaces, dashes, and parentheses
    const cleaned = phone.replace(/[\s()-]/g, '');
    
    // Bangladesh phone number normalization
    // Valid prefixes: 013, 014, 015, 016, 017, 018, 019
    const bdPattern = /^((\+?880)|0)?1[3-9]\d{8}$/;
    
    if (bdPattern.test(cleaned)) {
      // Normalize to E.164 format: +8801XXXXXXXXX
      let normalized = cleaned;
      
      // Remove leading 0 if present
      if (normalized.startsWith('0')) {
        normalized = normalized.substring(1);
      }
      
      // Remove +880 or 880 prefix if present
      if (normalized.startsWith('+880')) {
        normalized = normalized.substring(4);
      } else if (normalized.startsWith('880')) {
        normalized = normalized.substring(3);
      }
      
      // Add +880 prefix
      return `+880${normalized}`;
    }
    
    // Return as-is for international numbers (will be validated next)
    return cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
  })
  .refine(
    (phone) => /^\+[1-9]\d{7,14}$/.test(phone),
    'Invalid phone number format (use +880 1XXX-XXXXXX for Bangladesh or international E.164 format)'
  );

/**
 * Name validation schema
 */
export const NameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name must not exceed 100 characters')
  .regex(/^[a-zA-Z\s'-]+$/, 'Name contains invalid characters')
  .trim();

/**
 * Date validation schema (YYYY-MM-DD format)
 */
export const DateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
  .refine((dateStr) => {
    const date = new Date(dateStr);
    return !isNaN(date.getTime());
  }, 'Invalid date')
  .refine((dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
  }, 'Date cannot be in the past');

/**
 * Time validation schema (HH:MM format)
 */
export const TimeSchema = z
  .string()
  .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:MM format');

/**
 * Time slot validation schema
 */
export const TimeSlotSchema = z.object({
  startTime: TimeSchema,
  endTime: TimeSchema,
}).refine((slot) => {
  const [startHour, startMin] = slot.startTime.split(':').map(Number);
  const [endHour, endMin] = slot.endTime.split(':').map(Number);
  const startMinutes = startHour! * 60 + startMin!;
  const endMinutes = endHour! * 60 + endMin!;
  return endMinutes > startMinutes;
}, 'End time must be after start time').refine((slot) => {
  const [startHour, startMin] = slot.startTime.split(':').map(Number);
  const [endHour, endMin] = slot.endTime.split(':').map(Number);
  const startMinutes = startHour! * 60 + startMin!;
  const endMinutes = endHour! * 60 + endMin!;
  const duration = endMinutes - startMinutes;
  return duration >= 15;
}, 'Time slot must be at least 15 minutes');

/**
 * Duration validation schema (in minutes)
 */
export const DurationSchema = z
  .number()
  .int('Duration must be an integer')
  .min(15, 'Duration must be at least 15 minutes')
  .max(480, 'Duration must not exceed 8 hours')
  .refine((val) => val % 15 === 0, 'Duration must be in 15-minute increments');

/**
 * Notes validation schema
 */
export const NotesSchema = z
  .string()
  .max(500, 'Notes must not exceed 500 characters')
  .optional();

/**
 * UUID validation schema
 */
export const UuidSchema = z
  .string()
  .regex(/^[0-9a-f]{24}$/, 'Invalid ID format');
