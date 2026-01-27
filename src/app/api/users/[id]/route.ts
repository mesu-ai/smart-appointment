/**
 * User Detail API Routes
 * 
 * GET /api/users/:id - Get user details
 * PATCH /api/users/:id - Update user
 * DELETE /api/users/:id - Delete user
 */

import { NextRequest, NextResponse } from 'next/server';
import { findUserById, updateUser, deleteUser } from '@/lib/db/models/user.model';
import { hashPassword, requireAdmin } from '@/lib/auth/session';
import { handleError } from '@/lib/utils/error.utils';
import { z } from 'zod';

/**
 * GET /api/users/:id
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    await requireAdmin();
    
    const { id } = await params;
    const user = await findUserById(id);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ user });

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
 * PATCH /api/users/:id
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    await requireAdmin();
    
    const { id } = await params;
    const body = await request.json();
    
    const schema = z.object({
      name: z.string().min(1).optional(),
      phone: z.string().optional(),
      role: z.enum(['ADMIN', 'STAFF', 'CUSTOMER']).optional(),
      isActive: z.boolean().optional(),
      password: z.string().min(8).optional(),
    });

    const validated = schema.parse(body);

    const updates: any = {};
    
    if (validated.name) updates.name = validated.name;
    if (validated.phone !== undefined) updates.phone = validated.phone;
    if (validated.role) updates.role = validated.role;
    if (validated.isActive !== undefined) updates.isActive = validated.isActive;
    
    if (validated.password) {
      updates.passwordHash = await hashPassword(validated.password);
    }

    const user = await updateUser(id, updates);

    return NextResponse.json({
      user,
      message: 'User updated successfully',
    });

  } catch (error: any) {
    if (error.message === 'Authentication required' || error.message === 'Admin access required') {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    return handleError(error);
  }
}

/**
 * DELETE /api/users/:id
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    await requireAdmin();
    
    const { id } = await params;
    await deleteUser(id);

    return NextResponse.json({
      message: 'User deleted successfully',
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
