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

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * GET /api/services/:id
 * 
 * Get service by ID.
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const service = await findServiceById(params.id);

    if (!service) {
      throw new ResourceNotFoundError(
        'Service not found',
        'Service',
        params.id
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
