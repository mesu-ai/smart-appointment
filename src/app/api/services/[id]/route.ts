/**
 * Service Detail API Routes
 * 
 * GET /api/services/:id - Get service details
 */

import { NextRequest, NextResponse } from 'next/server';
import { findServiceById } from '@/lib/db/models/service.model';
import { handleError } from '@/lib/utils/error.utils';
import { ResourceNotFoundError } from '@/types/error.types';
import type { GetServiceResponse } from '@/types/api.types';

/**
 * GET /api/services/:id
 * 
 * Get service by ID.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    
    const service = await findServiceById(id);

    if (!service) {
      throw new ResourceNotFoundError(
        'Service not found',
        'Service',
        id
      );
    }

    const response: GetServiceResponse = {
      service,
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    return handleError(error);
  }
}
