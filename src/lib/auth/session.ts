/**
 * Authentication Utilities
 * 
 * Helper functions for password hashing, session management, and auth validation.
 */

import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { findUserById } from '@/lib/db/models/user.model';
import type { User } from '@/types/domain.types';

const SESSION_COOKIE_NAME = 'smartqueue_session';
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Hash password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

/**
 * Verify password against hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

/**
 * Create session token (simple implementation - use JWT in production)
 */
export function createSessionToken(userId: string): string {
  const payload = {
    userId,
    createdAt: Date.now(),
  };
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

/**
 * Decode session token
 */
export function decodeSessionToken(token: string): { userId: string; createdAt: number } | null {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const payload = JSON.parse(decoded);
    
    // Check if token is expired
    if (Date.now() - payload.createdAt > SESSION_DURATION) {
      return null;
    }
    
    return payload;
  } catch {
    return null;
  }
}

/**
 * Set session cookie
 */
export async function setSessionCookie(userId: string): Promise<void> {
  const token = createSessionToken(userId);
  const cookieStore = await cookies();
  
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION / 1000, // Convert to seconds
    path: '/',
  });
}

/**
 * Clear session cookie
 */
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Get current session
 */
export async function getSession(): Promise<{ userId: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME);
  
  if (!token?.value) {
    return null;
  }

  const decoded = decodeSessionToken(token.value);
  return decoded ? { userId: decoded.userId } : null;
}

/**
 * Get current user from session
 */
export async function getCurrentUser(): Promise<User | null> {
  const session = await getSession();
  
  if (!session) {
    return null;
  }

  return await findUserById(session.userId);
}

/**
 * Require authentication (throws if not authenticated)
 */
export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error('Authentication required');
  }

  return user;
}

/**
 * Require admin role
 */
export async function requireAdmin(): Promise<User> {
  const user = await requireAuth();
  
  if (user.role !== 'ADMIN') {
    throw new Error('Admin access required');
  }

  return user;
}

/**
 * Require admin or staff role
 */
export async function requireStaff(): Promise<User> {
  const user = await requireAuth();
  
  if (user.role !== 'ADMIN' && user.role !== 'STAFF') {
    throw new Error('Staff access required');
  }

  return user;
}
