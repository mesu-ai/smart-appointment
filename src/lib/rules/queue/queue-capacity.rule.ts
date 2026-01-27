/**
 * Queue Capacity Rule
 * 
 * Validates that the queue has not reached its maximum size.
 */

import type { Rule, RuleResult } from '../../engine/rule.interface';
import { findServiceById } from '@/lib/db/models/service.model';
import { countActiveQueueEntries } from '@/lib/db/models/queue-entry.model';

export interface QueueJoinContext {
  serviceId: string;
  customerEmail: string;
  priority: 'NORMAL' | 'HIGH';
}

export class QueueCapacityRule implements Rule<QueueJoinContext> {
  name = 'QueueCapacityRule';
  priority = 10;

  async validate(context: QueueJoinContext): Promise<RuleResult> {
    const { serviceId } = context;

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
    if (!service.maxQueueSize) {
      return { valid: true };
    }

    // Count current queue entries
    const count = await countActiveQueueEntries(serviceId);

    if (count >= service.maxQueueSize) {
      return {
        valid: false,
        errorCode: 'QUEUE_FULL',
        errorMessage: `Queue is full (maximum ${service.maxQueueSize} people)`,
        metadata: {
          currentSize: count,
          maxSize: service.maxQueueSize,
        },
      };
    }

    return { valid: true };
  }
}
