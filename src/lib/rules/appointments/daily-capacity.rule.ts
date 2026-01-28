/**
 * Daily Capacity Rule
 * 
 * Validates that the daily appointment limit for a service has not been reached.
 */

import type { Rule, RuleResult } from '../engine/rule.interface';
import type { AppointmentBookingContext } from './business-hours.rule';
import { findServiceById } from '@/lib/db/models/service.model';
import { countAppointments } from '@/lib/db/models/appointment.model';

export class DailyCapacityRule implements Rule<AppointmentBookingContext> {
  name = 'DailyCapacityRule';
  priority = 30;

  async validate(context: AppointmentBookingContext): Promise<RuleResult> {
    const { serviceId, date } = context;

    // Get service configuration
    const service = await findServiceById(serviceId);
    if (!service) {
      return {
        valid: false,
        errorCode: 'SERVICE_NOT_FOUND',
        errorMessage: 'Service not found',
      };
    }

    // If no limit configured, allow
    if (!service.maxDailyAppointments) {
      return { valid: true };
    }

    // Count existing appointments for the day
    const count = await countAppointments({
      serviceId,
      date,
      status: { $nin: ['CANCELLED', 'NO_SHOW'] },
    });

    if (count >= service.maxDailyAppointments) {
      return {
        valid: false,
        errorCode: 'DAILY_CAPACITY_EXCEEDED',
        errorMessage: `Maximum ${service.maxDailyAppointments} appointments per day reached`,
        metadata: {
          currentCount: count,
          limit: service.maxDailyAppointments,
        },
      };
    }

    return { valid: true };
  }
}
