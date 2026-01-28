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
  '/book-new',
  '/queue',
  '/queue-new',
  '/dashboard',
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

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get session cookie
  const sessionToken = request.cookies.get(SESSION_COOKIE_NAME);
  const session = sessionToken?.value ? decodeSessionToken(sessionToken.value) : null;
  const isAuthenticated = !!session;

  // PUBLIC ROUTES: Always allow API auth endpoints
  if (pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  // AUTHENTICATED USER GUARDS: Redirect logged-in users away from auth pages
  if (isAuthenticated && (pathname === '/login' || pathname === '/signup')) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  // PUBLIC ROUTES: Allow unauthenticated access to these pages
  if (pathname === '/' || pathname === '/login' || pathname === '/signup') {
    return NextResponse.next();
  }

  // PROTECTED ROUTES: Check if route requires authentication
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // AUTHENTICATION REQUIRED: Redirect to login if not authenticated
  if (!isAuthenticated) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // User is authenticated, allow access to protected route
  return NextResponse.next();
}

// Configure which routes use this proxy
export const config = {
  matcher: [
    /*
     * Match all page requests except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files (images, fonts, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
