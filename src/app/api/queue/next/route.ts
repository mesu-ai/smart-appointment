/**
 * Queue Next API Route
 * 
 * POST /api/queue/next - Call next person in queue
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  findNextToCall,
  updateQueueEntryStatus 
} from '@/lib/db/models/queue-entry.model';
import { handleError } from '@/lib/utils/error.utils';
import type { CallNextResponse } from '@/types/api.types';

/**
 * POST /api/queue/next
 * 
 * Call the next person in queue (priority-based).
 * 
 * Logic:
 * 1. Find next WAITING entry (HIGH priority first, then by position)
 * 2. Update status to CALLED
 * 3. Set calledAt timestamp
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // ============================================
    // STEP 1: Get serviceId from request body
    // ============================================
    const body = await request.json();
    const { serviceId } = body;

    if (!serviceId) {
      return NextResponse.json(
        { error: 'serviceId is required' },
        { status: 400 }
      );
    }

    // ============================================
    // STEP 2: Find next entry to call
    // ============================================
    const nextEntry = await findNextToCall(serviceId);

    if (!nextEntry) {
      const response: CallNextResponse = {
        queueEntry: null,
        message: 'Queue is empty',
      };
      return NextResponse.json(response, { status: 200 });
    }

    // ============================================
    // STEP 3: Update status to CALLED
    // ============================================
    const calledEntry = await updateQueueEntryStatus(nextEntry.id, 'CALLED');

    if (!calledEntry) {
      throw new Error('Failed to call next in queue');
    }

    // ============================================
    // STEP 4: Return response
    // ============================================
    const response: CallNextResponse = {
      queueEntry: calledEntry,
      message: `Called: ${calledEntry.customerInfo.name}`,
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    return handleError(error);
  }
}
