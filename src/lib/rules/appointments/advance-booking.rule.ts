/**
 * Advance Booking Rule
 * 
 * Validates that appointments are booked within acceptable time windows:
 * - At least 1 day in advance
 * - No more than 90 days in advance
 */

import type { Rule, RuleResult } from '../engine/rule.interface';
import type { AppointmentBookingContext } from './business-hours.rule';

export class AdvanceBookingRule implements Rule<AppointmentBookingContext> {
  name = 'AdvanceBookingRule';
  priority = 5;

  async validate(context: AppointmentBookingContext): Promise<RuleResult> {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    const appointmentDate = new Date(context.date);
    appointmentDate.setHours(0, 0, 0, 0);
    
    const daysDifference = Math.ceil(
      (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Must book at least 1 day in advance
    if (daysDifference < 1) {
      return {
        valid: false,
        errorCode: 'BOOKING_TOO_SOON',
        errorMessage: 'Appointments must be booked at least 24 hours in advance',
      };
    }

    // Cannot book more than 90 days in advance
    if (daysDifference > 90) {
      return {
        valid: false,
        errorCode: 'BOOKING_TOO_FAR',
        errorMessage: 'Appointments cannot be booked more than 90 days in advance',
      };
    }

    return { valid: true };
  }
}
