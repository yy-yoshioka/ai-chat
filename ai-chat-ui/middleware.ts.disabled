import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verify } from 'jsonwebtoken';

// Define protected routes that require authentication
// You can add more paths as needed
const PROTECTED_ROUTES = ['/profile', '/dashboard', '/settings', '/api/protected'];

/**
 * Next.js Middleware to protect routes and verify authentication
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the current path should be protected
  const isProtectedRoute = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // If it's not a protected route, allow the request to proceed
  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // Get the token from cookies
  const token = request.cookies.get('token')?.value;

  // If no token is found, redirect to login
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    // Add the original URL as a parameter to redirect back after login
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    // Verify the JWT token
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      console.error('JWT_SECRET environment variable is not set');
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Verify token
    verify(token, secret);

    // If verification is successful, allow the request to proceed
    return NextResponse.next();
  } catch (error) {
    console.error('JWT verification failed:', error);

    // If token is invalid, clear the cookie and redirect to login
    const response = NextResponse.redirect(new URL('/login', request.url));

    // Clear the invalid token
    response.cookies.delete('token');

    return response;
  }
}

/**
 * Configure which paths the middleware should run on
 * This includes all paths that need authentication checks
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. /_next (Next.js internals)
     * 2. /static (static files)
     * 3. /favicon.ico, /manifest.json (browser files)
     * 4. /login, /register (auth pages)
     */
    '/((?!_next|static|favicon.ico|manifest.json|login|register).*)',
  ],
};
