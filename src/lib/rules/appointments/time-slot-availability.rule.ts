/**
 * Time Slot Availability Rule
 * 
 * Validates that the requested time slot is available and not already booked.
 * Checks for overlapping appointments.
 */

import type { Rule, RuleResult } from '../../engine/rule.interface';
import type { AppointmentBookingContext } from './business-hours.rule';
import { isTimeSlotAvailable } from '@/lib/db/models/appointment.model';

export class TimeSlotAvailabilityRule implements Rule<AppointmentBookingContext> {
  name = 'TimeSlotAvailabilityRule';
  priority = 20;

  async validate(context: AppointmentBookingContext): Promise<RuleResult> {
    const { serviceId, date, startTime, endTime } = context;

    const isAvailable = await isTimeSlotAvailable(
      serviceId,
      date,
      startTime,
      endTime
    );

    if (!isAvailable) {
      return {
        valid: false,
        errorCode: 'TIME_SLOT_UNAVAILABLE',
        errorMessage: 'This time slot is already booked',
      };
    }

    return { valid: true };
  }
}
