/**
 * Duplicate Appointment Rule
 * 
 * Prevents customers from booking multiple appointments on the same day.
 */

import type { Rule, RuleResult } from '../engine/rule.interface';
import type { AppointmentBookingContext } from './business-hours.rule';
import { countAppointments } from '@/lib/db/models/appointment.model';

export class DuplicateAppointmentRule implements Rule<AppointmentBookingContext> {
  name = 'DuplicateAppointmentRule';
  priority = 15;

  async validate(context: AppointmentBookingContext): Promise<RuleResult> {
    const { customerEmail, date } = context;

    // Check if customer already has appointment on same day
    const count = await countAppointments({
      customerEmail,
      date,
      status: { $in: ['SCHEDULED', 'CONFIRMED'] },
    });

    if (count > 0) {
      return {
        valid: false,
        errorCode: 'DUPLICATE_APPOINTMENT',
        errorMessage: 'You already have an appointment scheduled for this day',
      };
    }

    return { valid: true };
  }
}
