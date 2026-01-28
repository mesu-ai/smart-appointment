/**
 * Queue Operating Hours Rule
 * 
 * Validates that queue is open during business hours.
 * 
 * Rules:
 * - Sunday: Closed
 * - Monday-Friday: 9:00 AM - 5:00 PM
 * - Saturday: 10:00 AM - 2:00 PM
 */

import type { Rule, RuleResult } from '../engine/rule.interface';
import type { QueueJoinContext } from './queue-capacity.rule';

export class QueueOperatingHoursRule implements Rule<QueueJoinContext> {
  name = 'QueueOperatingHoursRule';
  priority = 1;

  async validate(_context: QueueJoinContext): Promise<RuleResult> {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const hour = now.getHours();

    // Sunday (0) - Closed
    if (dayOfWeek === 0) {
      return {
        valid: false,
        errorCode: 'QUEUE_CLOSED',
        errorMessage: 'Queue is closed on Sundays',
      };
    }

    // Monday - Friday (1-5): 9 AM - 5 PM
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      if (hour < 9 || hour >= 17) {
        return {
          valid: false,
          errorCode: 'QUEUE_CLOSED',
          errorMessage: 'Queue is open Monday-Friday, 9:00 AM - 5:00 PM',
        };
      }
    }

    // Saturday (6): 10 AM - 2 PM
    if (dayOfWeek === 6) {
      if (hour < 10 || hour >= 14) {
        return {
          valid: false,
          errorCode: 'QUEUE_CLOSED',
          errorMessage: 'Queue is open Saturday, 10:00 AM - 2:00 PM',
        };
      }
    }

    return { valid: true };
  }
}
