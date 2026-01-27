/**
 * Health Check API
 * 
 * GET /api/health - Check API and database health
 */

import { NextRequest, NextResponse } from 'next/server';
import { isConnected } from '@/lib/db/mongodb';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const dbConnected = await isConnected();

    if (!dbConnected) {
      return NextResponse.json(
        {
          status: 'unhealthy',
          database: 'disconnected',
          timestamp: new Date().toISOString(),
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        status: 'healthy',
        database: 'connected',
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );

  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
