/**
 * Time Utilities
 * 
 * Helper functions for time slot generation and manipulation.
 */

import { parseTime, formatTime } from './date.utils';
import type { TimeSlot } from '@/types/domain.types';

/**
 * Generate time slots between start and end times
 */
export function generateTimeSlots(
  startTime: string,
  endTime: string,
  duration: number
): TimeSlot[] {
  const slots: TimeSlot[] = [];
  let currentMinutes = parseTime(startTime);
  const endMinutes = parseTime(endTime);

  while (currentMinutes + duration <= endMinutes) {
    const slotStartTime = formatTime(currentMinutes);
    const slotEndTime = formatTime(currentMinutes + duration);
    
    slots.push({
      startTime: slotStartTime,
      endTime: slotEndTime,
    });

    currentMinutes += duration;
  }

  return slots;
}

/**
 * Check if two time slots overlap
 */
export function timeSlotsOverlap(slot1: TimeSlot, slot2: TimeSlot): boolean {
  const start1 = parseTime(slot1.startTime);
  const end1 = parseTime(slot1.endTime);
  const start2 = parseTime(slot2.startTime);
  const end2 = parseTime(slot2.endTime);

  return (
    (start1 >= start2 && start1 < end2) ||
    (end1 > start2 && end1 <= end2) ||
    (start1 <= start2 && end1 >= end2)
  );
}

/**
 * Calculate duration between two times in minutes
 */
export function calculateDuration(startTime: string, endTime: string): number {
  const start = parseTime(startTime);
  const end = parseTime(endTime);
  return end - start;
}

/**
 * Check if time is within range
 */
export function isTimeInRange(
  time: string,
  rangeStart: string,
  rangeEnd: string
): boolean {
  const timeMinutes = parseTime(time);
  const startMinutes = parseTime(rangeStart);
  const endMinutes = parseTime(rangeEnd);

  return timeMinutes >= startMinutes && timeMinutes < endMinutes;
}
