/**
 * Queue Entry Detail API Routes
 * 
 * GET /api/queue/:id - Get queue entry details
 * PATCH /api/queue/:id - Update queue entry
 * DELETE /api/queue/:id - Leave queue
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateOrThrow } from '@/lib/validation/validators/validate';
import { UpdateQueueEntrySchema } from '@/lib/validation/schemas/queue.schema';
import { 
  findQueueEntryById, 
  updateQueueEntry,
  updateQueueEntryStatus,
  deleteQueueEntry 
} from '@/lib/db/models/queue-entry.model';
import { handleError } from '@/lib/utils/error.utils';
import { ResourceNotFoundError, DomainInvariantViolationError } from '@/types/error.types';
import type { UpdateQueueEntryResponse } from '@/types/api.types';
import type { QueueStatus } from '@/types/domain.types';

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * GET /api/queue/:id
 * 
 * Get queue entry by ID.
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const queueEntry = await findQueueEntryById(params.id);

    if (!queueEntry) {
      throw new ResourceNotFoundError(
        'Queue entry not found',
        'QueueEntry',
        params.id
      );
    }

    return NextResponse.json({ queueEntry }, { status: 200 });

  } catch (error) {
    return handleError(error);
  }
}

/**
 * PATCH /api/queue/:id
 * 
 * Update queue entry status or position.
 * Enforces valid status transitions as domain invariant.
 * 
 * Valid status transitions:
 * - WAITING → CALLED, CANCELLED
 * - CALLED → IN_SERVICE, CANCELLED
 * - IN_SERVICE → COMPLETED
 * - COMPLETED → (no transitions allowed)
 * - CANCELLED → (no transitions allowed)
 */
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    // ============================================
    // STEP 1: Validate request body
    // ============================================
    const body = await request.json();
    const validatedData = validateOrThrow(UpdateQueueEntrySchema, body);

    // ============================================
    // STEP 2: Get current queue entry
    // ============================================
    const currentEntry = await findQueueEntryById(params.id);

    if (!currentEntry) {
      throw new ResourceNotFoundError(
        'Queue entry not found',
        'QueueEntry',
        params.id
      );
    }

    // ============================================
    // STEP 3: Validate status transition (Domain Invariant)
    // ============================================
    if (validatedData.status) {
      const validTransitions: Record<QueueStatus, QueueStatus[]> = {
        WAITING: ['CALLED', 'CANCELLED'],
        CALLED: ['IN_SERVICE', 'CANCELLED'],
        IN_SERVICE: ['COMPLETED'],
        COMPLETED: [],
        CANCELLED: [],
      };

      const allowedTransitions = validTransitions[currentEntry.status];
      
      if (!allowedTransitions.includes(validatedData.status)) {
        throw new DomainInvariantViolationError(
          `Invalid status transition: ${currentEntry.status} → ${validatedData.status}`,
          'QueueStatusTransition'
        );
      }
    }

    // ============================================
    // STEP 4: Update queue entry
    // ============================================
    let updatedEntry;

    if (validatedData.status) {
      updatedEntry = await updateQueueEntryStatus(params.id, validatedData.status);
    }

    if (validatedData.position !== undefined) {
      updatedEntry = await updateQueueEntry(params.id, {
        $set: { position: validatedData.position },
      });
    }

    if (!updatedEntry) {
      throw new Error('Failed to update queue entry');
    }

    // ============================================
    // STEP 5: Return response
    // ============================================
    const response: UpdateQueueEntryResponse = {
      queueEntry: updatedEntry,
      message: 'Queue entry updated successfully',
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    return handleError(error);
  }
}

/**
 * DELETE /api/queue/:id
 * 
 * Leave queue (soft delete) by setting status to CANCELLED.
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    // ============================================
    // STEP 1: Get current queue entry
    // ============================================
    const queueEntry = await findQueueEntryById(params.id);

    if (!queueEntry) {
      throw new ResourceNotFoundError(
        'Queue entry not found',
        'QueueEntry',
        params.id
      );
    }

    // ============================================
    // STEP 2: Check if already cancelled or completed
    // ============================================
    if (queueEntry.status === 'CANCELLED') {
      return NextResponse.json(
        { message: 'Queue entry is already cancelled' },
        { status: 200 }
      );
    }

    if (queueEntry.status === 'COMPLETED') {
      throw new DomainInvariantViolationError(
        'Cannot cancel a completed queue entry',
        'QueueCancellation'
      );
    }

    // ============================================
    // STEP 3: Update status to CANCELLED
    // ============================================
    const updatedEntry = await updateQueueEntryStatus(params.id, 'CANCELLED');

    if (!updatedEntry) {
      throw new Error('Failed to cancel queue entry');
    }

    // ============================================
    // STEP 4: Return response
    // ============================================
    return NextResponse.json(
      {
        queueEntry: updatedEntry,
        message: 'Successfully left the queue',
      },
      { status: 200 }
    );

  } catch (error) {
    return handleError(error);
  }
}
