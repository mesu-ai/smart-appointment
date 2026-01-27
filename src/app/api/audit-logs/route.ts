/**
 * Audit Logs API Routes
 * 
 * GET /api/audit-logs - List audit logs (staff+ only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { findAuditLogs } from '@/lib/db/models/audit-log.model';
import { requireStaff } from '@/lib/auth/session';
import { handleError } from '@/lib/utils/error.utils';
import type { AuditAction } from '@/types/database.types';

/**
 * GET /api/audit-logs
 * 
 * List audit logs with filtering (staff+ access).
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Require staff or admin authentication
    await requireStaff();

    const searchParams = request.nextUrl.searchParams;
    
    const params: any = {};
    
    if (searchParams.get('action')) {
      params.action = searchParams.get('action') as AuditAction;
    }
    
    if (searchParams.get('entityType')) {
      params.entityType = searchParams.get('entityType');
    }
    
    if (searchParams.get('entityId')) {
      params.entityId = searchParams.get('entityId');
    }
    
    if (searchParams.get('userId')) {
      params.userId = searchParams.get('userId');
    }
    
    if (searchParams.get('startDate')) {
      params.startDate = new Date(searchParams.get('startDate')!);
    }
    
    if (searchParams.get('endDate')) {
      params.endDate = new Date(searchParams.get('endDate')!);
    }
    
    if (searchParams.get('limit')) {
      params.limit = parseInt(searchParams.get('limit')!, 10);
    }

    const logs = await findAuditLogs(params);

    return NextResponse.json({
      logs,
      total: logs.length,
    });

  } catch (error: any) {
    if (error.message === 'Authentication required' || error.message === 'Staff access required') {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }
    return handleError(error);
  }
}
