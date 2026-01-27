/**
 * Next.js Proxy for Route Protection
 * 
 * Protects routes based on authentication status.
 * Runs on every request before rendering pages.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SESSION_COOKIE_NAME = 'smartqueue_session';

// Routes that require authentication
const protectedRoutes = [
  '/book',
  '/queue',
  '/admin',
];

/**
 * Decode session token to get userId
 */
function decodeSessionToken(token: string): { userId: string; createdAt: number } | null {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const payload = JSON.parse(decoded);
    
    // Check if token is expired (7 days)
    const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000;
    if (Date.now() - payload.createdAt > SESSION_DURATION) {
      return null;
    }
    
    return payload;
  } catch {
    return null;
  }
}

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the route needs protection
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // Get session cookie
  const sessionToken = request.cookies.get(SESSION_COOKIE_NAME);

  // If no session, redirect to login
  if (!sessionToken?.value) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // Validate session token
  const session = decodeSessionToken(sessionToken.value);
  if (!session) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // For staff routes, we'll rely on client-side check since we can't easily get user role here
  // The API routes already have proper role checks

  return NextResponse.next();
}

// Configure which routes use this proxy
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).)*',
  ],
};
