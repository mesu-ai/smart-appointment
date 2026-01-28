/**
 * Business Hours Rule
 * 
 * Validates that appointments are booked within business operating hours.
 * 
 * Rules:
 * - Sunday: Closed
 * - Monday-Friday: 9:00 AM - 5:00 PM
 * - Saturday: 10:00 AM - 2:00 PM
 */

import type { Rule, RuleResult } from '../engine/rule.interface';

export interface AppointmentBookingContext {
  serviceId: string;
  date: Date;
  startTime: string;
  endTime: string;
  customerEmail: string;
}

export class BusinessHoursRule implements Rule<AppointmentBookingContext> {
  name = 'BusinessHoursRule';
  priority = 10;

  async validate(context: AppointmentBookingContext): Promise<RuleResult> {
    const dayOfWeek = context.date.getDay();
    const [startHour] = context.startTime.split(':').map(Number);
    const [endHour] = context.endTime.split(':').map(Number);

    // Sunday (0) - Closed
    if (dayOfWeek === 0) {
      return {
        valid: false,
        errorCode: 'BUSINESS_HOURS_CLOSED',
        errorMessage: 'We are closed on Sundays',
      };
    }

    // Monday - Friday (1-5)
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      if (startHour! < 9 || endHour! > 17) {
        return {
          valid: false,
          errorCode: 'BUSINESS_HOURS_WEEKDAY',
          errorMessage: 'Weekday hours are 9:00 AM - 5:00 PM',
        };
      }
    }

    // Saturday (6)
    if (dayOfWeek === 6) {
      if (startHour! < 10 || endHour! > 14) {
        return {
          valid: false,
          errorCode: 'BUSINESS_HOURS_SATURDAY',
          errorMessage: 'Saturday hours are 10:00 AM - 2:00 PM',
        };
      }
    }

    return { valid: true };
  }
}
