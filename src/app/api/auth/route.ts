/**
 * Authentication API Routes
 * 
 * POST /api/auth/login - User login
 * POST /api/auth/logout - User logout
 * GET /api/auth/session - Get current session
 */

import { NextRequest, NextResponse } from 'next/server';
import { findUserByEmail, updateLastLogin } from '@/lib/db/models/user.model';
import { verifyPassword, setSessionCookie, clearSessionCookie, getCurrentUser } from '@/lib/auth/session';
import { handleError } from '@/lib/utils/error.utils';
import { z } from 'zod';

/**
 * POST /api/auth/login
 * 
 * Authenticate user with email and password.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    
    // Validate input
    const schema = z.object({
      email: z.string().email('Invalid email address'),
      password: z.string().min(1, 'Password is required'),
    });

    const { email, password } = schema.parse(body);

    // Find user by email
    const user = await findUserByEmail(email);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Account is disabled' },
        { status: 403 }
      );
    }

    // Verify password
    const isValid = await verifyPassword(password, user.passwordHash);
    
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Update last login time
    await updateLastLogin(user._id.toString());

    // Create session
    await setSessionCookie(user._id.toString());

    // Return user data (exclude password hash)
    return NextResponse.json({
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
      },
      message: 'Login successful',
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0]?.message || 'Validation error' },
        { status: 400 }
      );
    }
    return handleError(error);
  }
}

/**
 * DELETE /api/auth/logout
 * 
 * Logout current user.
 */
export async function DELETE(_request: NextRequest): Promise<NextResponse> {
  try {
    await clearSessionCookie();

    return NextResponse.json({
      message: 'Logout successful',
    });

  } catch (error) {
    return handleError(error);
  }
}

/**
 * GET /api/auth/session
 * 
 * Get current user session.
 */
export async function GET(_request: NextRequest): Promise<NextResponse> {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { user: null },
        { status: 200 }
      );
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
      },
    });

  } catch (error) {
    return handleError(error);
  }
}
