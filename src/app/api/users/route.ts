/**
 * Users API Routes
 * 
 * GET /api/users - List users (admin only)
 * POST /api/users - Create user (admin only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { findUsers, createUser } from '@/lib/db/models/user.model';
import { hashPassword } from '@/lib/auth/session';
import { requireAdmin } from '@/lib/auth/session';
import { handleError } from '@/lib/utils/error.utils';
import { z } from 'zod';

/**
 * GET /api/users
 * 
 * List all users (admin only).
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Require admin authentication
    await requireAdmin();

    const searchParams = request.nextUrl.searchParams;
    const role = searchParams.get('role');
    const isActive = searchParams.get('isActive');

    const filter: any = {};
    
    if (role) {
      filter.role = role;
    }
    
    if (isActive !== null) {
      filter.isActive = isActive === 'true';
    }

    const users = await findUsers(filter);

    return NextResponse.json({
      users,
      total: users.length,
    });

  } catch (error: any) {
    if (error.message === 'Authentication required' || error.message === 'Admin access required') {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }
    return handleError(error);
  }
}

/**
 * POST /api/users
 * 
 * Create new user (admin only).
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Require admin authentication
    await requireAdmin();

    const body = await request.json();
    
    // Validate input
    const schema = z.object({
      email: z.string().email('Invalid email address'),
      password: z.string().min(8, 'Password must be at least 8 characters'),
      name: z.string().min(1, 'Name is required'),
      phone: z.string().optional(),
      role: z.enum(['ADMIN', 'STAFF', 'CUSTOMER']),
    });

    const validated = schema.parse(body);

    // Hash password
    const passwordHash = await hashPassword(validated.password);

    // Create user
    const user = await createUser({
      email: validated.email,
      passwordHash,
      name: validated.name,
      phone: validated.phone,
      role: validated.role,
    });

    return NextResponse.json({
      user,
      message: 'User created successfully',
    }, { status: 201 });

  } catch (error: any) {
    if (error.message === 'Authentication required' || error.message === 'Admin access required') {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0]?.message || 'Validation error' },
        { status: 400 }
      );
    }

    // Handle duplicate email error
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 409 }
      );
    }

    return handleError(error);
  }
}
