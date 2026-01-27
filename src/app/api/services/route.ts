/**
 * Services API Routes
 * 
 * GET /api/services - List all active services
 */

import { NextRequest, NextResponse } from 'next/server';
import { findActiveServices } from '@/lib/db/models/service.model';
import { handleError } from '@/lib/utils/error.utils';
import type { ListServicesResponse } from '@/types/api.types';

/**
 * GET /api/services
 * 
 * List all active services available for booking.
 */
export async function GET(_request: NextRequest): Promise<NextResponse> {
  try {
    const services = await findActiveServices();

    const response: ListServicesResponse = {
      services,
      total: services.length,
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    return handleError(error);
  }
}
