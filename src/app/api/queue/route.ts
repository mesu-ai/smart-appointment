/**
 * Queue API Routes
 * 
 * POST /api/queue - Join queue
 * GET /api/queue - List queue entries
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateOrThrow } from '@/lib/validation/validators/validate';
import { JoinQueueSchema, ListQueueQuerySchema } from '@/lib/validation/schemas/queue.schema';
import { RuleEngine } from '@/lib/rules/engine/rule-engine';
import { requireStaff } from '@/lib/auth/session';
import { QueueOperatingHoursRule } from '@/lib/rules/queue/queue-operating-hours.rule';
import { DuplicateQueueEntryRule } from '@/lib/rules/queue/duplicate-queue-entry.rule';
import { QueueCapacityRule } from '@/lib/rules/queue/queue-capacity.rule';
import { 
  createQueueEntry, 
  findQueueEntries,
  getNextQueuePosition 
} from '@/lib/db/models/queue-entry.model';
import { findServiceById } from '@/lib/db/models/service.model';
import { withTransaction } from '@/lib/utils/transaction.utils';
import { handleError } from '@/lib/utils/error.utils';
import { BusinessRuleViolationError, ResourceNotFoundError } from '@/types/error.types';
import type { JoinQueueResponse, ListQueueResponse } from '@/types/api.types';
import type { QueueJoinContext } from '@/lib/rules/queue/queue-capacity.rule';
import type { Filter } from 'mongodb';
import type { QueueEntryDocument } from '@/types/database.types';

/**
 * POST /api/queue
 * 
 * Join the queue for a service.
 * 
 * Flow:
 * 1. Validate request body
 * 2. Verify service exists
 * 3. Execute business rules
 * 4. Assign queue position atomically
 * 5. Create queue entry
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // ============================================
    // STEP 0: Require authentication
    // ============================================
    // const user = await requireAuth();

    // ============================================
    // STEP 1: Parse and validate request body
    // ============================================
    const body = await request.json();
    const validatedData = validateOrThrow(JoinQueueSchema, body);

    // ============================================
    // STEP 2: Verify service exists
    // ============================================
    const service = await findServiceById(validatedData.serviceId);
    if (!service) {
      throw new ResourceNotFoundError(
        'Service not found',
        'Service',
        validatedData.serviceId
      );
    }

    // ============================================
    // STEP 3: Execute business rules
    // ============================================
    const ruleEngine = new RuleEngine<QueueJoinContext>();
    
    // Register rules in priority order
    ruleEngine.registerRule(new QueueOperatingHoursRule());
    ruleEngine.registerRule(new DuplicateQueueEntryRule());
    ruleEngine.registerRule(new QueueCapacityRule());

    const ruleContext: QueueJoinContext = {
      serviceId: validatedData.serviceId,
      customerEmail: validatedData.customerInfo.email,
      priority: validatedData.priority ?? 'NORMAL',
    };

    const ruleFailure = await ruleEngine.executeUntilFailure(ruleContext);
    
    if (ruleFailure) {
      throw new BusinessRuleViolationError(
        ruleFailure.errorMessage!,
        ruleFailure.errorCode as any,
        ruleFailure.metadata
      );
    }

    // ============================================
    // STEP 4: Create queue entry in transaction
    // ============================================
    const queueEntry = await withTransaction(async (_session) => {
      // Get next available position atomically
      const position = await getNextQueuePosition(validatedData.serviceId);

      // Calculate estimated wait time (15 minutes per position)
      const estimatedWaitTime = position * 15;

      // Create queue entry
      const newEntry = await createQueueEntry({
        serviceId: validatedData.serviceId,
        serviceName: service.name,
        position,
        status: 'WAITING',
        priority: validatedData.priority ?? 'NORMAL',
        customerName: validatedData.customerInfo.name,
        customerEmail: validatedData.customerInfo.email,
        customerPhone: validatedData.customerInfo.phone,
        estimatedWaitTime,
        joinedAt: new Date(),
        notes: validatedData.customerInfo.notes,
      });

      return newEntry;
    });

    // ============================================
    // STEP 5: Return success response
    // ============================================
    const response: JoinQueueResponse = {
      queueEntry,
      message: 'Successfully joined the queue',
    };

    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    return handleError(error);
  }
}

/**
 * GET /api/queue
 * 
 * List queue entries with optional filters.
 * 
 * Query parameters:
 * - serviceId: Filter by service
 * - status: Filter by status
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // ============================================
    // STEP 0: Require staff authentication
    // ============================================
    await requireStaff();

    // ============================================
    // STEP 1: Parse and validate query parameters
    // ============================================
    const searchParams = request.nextUrl.searchParams;
    const queryParams = {
      serviceId: searchParams.get('serviceId') || undefined,
      status: searchParams.get('status') || undefined,
    };

    const validatedQuery = validateOrThrow(ListQueueQuerySchema, queryParams);

    // ============================================
    // STEP 2: Build MongoDB filter
    // ============================================
    const filter: Filter<QueueEntryDocument> = {};

    if (validatedQuery.serviceId) {
      filter.serviceId = validatedQuery.serviceId;
    }

    if (validatedQuery.status) {
      filter.status = validatedQuery.status;
    }

    // ============================================
    // STEP 3: Fetch queue entries
    // ============================================
    const queue = await findQueueEntries(filter);

    // ============================================
    // STEP 4: Return response
    // ============================================
    const response: ListQueueResponse = {
      queue,
      total: queue.length,
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    return handleError(error);
  }
}
