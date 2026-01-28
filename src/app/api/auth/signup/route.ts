/**
 * User Signup API Route
 * 
 * POST /api/auth/signup - Register new user
 */

import { NextRequest, NextResponse } from 'next/server';
import { createUser, findUserByEmail } from '@/lib/db/models/user.model';
import { hashPassword, setSessionCookie } from '@/lib/auth/session';
import { handleError } from '@/lib/utils/error.utils';
import { z } from 'zod';

const SignupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional(),
});

/**
 * POST /api/auth/signup
 * 
 * Register a new user account.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = SignupSchema.parse(body);

    // Check if user already exists
    const existingUser = await findUserByEmail(validatedData.email);
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(validatedData.password);

    // Create user (default role: CUSTOMER)
    const user = await createUser({
      email: validatedData.email,
      passwordHash,
      name: validatedData.name,
      phone: validatedData.phone,
      role: 'CUSTOMER',
    });

    // Create session (auto-login after signup)
    await setSessionCookie(user.id);

    // Return user data (exclude password hash)
    return NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          isActive: user.isActive,
        },
        message: 'Account created successfully',
      },
      { status: 201 }
    );

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
