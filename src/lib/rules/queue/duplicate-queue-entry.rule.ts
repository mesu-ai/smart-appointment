/**
 * Duplicate Queue Entry Rule
 * 
 * Prevents customers from joining the same queue multiple times.
 */

import type { Rule, RuleResult } from '../../engine/rule.interface';
import type { QueueJoinContext } from './queue-capacity.rule';
import { isCustomerInQueue } from '@/lib/db/models/queue-entry.model';

export class DuplicateQueueEntryRule implements Rule<QueueJoinContext> {
  name = 'DuplicateQueueEntryRule';
  priority = 5;

  async validate(context: QueueJoinContext): Promise<RuleResult> {
    const { serviceId, customerEmail } = context;

    const alreadyInQueue = await isCustomerInQueue(serviceId, customerEmail);

    if (alreadyInQueue) {
      return {
        valid: false,
        errorCode: 'ALREADY_IN_QUEUE',
        errorMessage: 'You are already in the queue for this service',
      };
    }

    return { valid: true };
  }
}
