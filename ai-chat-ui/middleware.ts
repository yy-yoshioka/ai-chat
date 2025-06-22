import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for API routes, static files, and Next.js internals
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // TODO: Implement authentication check
  // const isAuthenticated = await checkAuthentication(request);
  // const isAdmin = await checkAdminRole(request);

  // Handle /admin routes
  if (pathname.startsWith('/admin')) {
    // TODO: Add authentication redirects
    // if (!isAuthenticated) {
    //   const loginUrl = new URL('/login', request.url);
    //   loginUrl.searchParams.set('next', pathname);
    //   return NextResponse.redirect(loginUrl);
    // }

    // TODO: Add admin role check
    // if (!isAdmin) {
    //   return NextResponse.redirect(new URL('/', request.url));
    // }

    // Handle /admin direct access - redirect to default org dashboard
    if (pathname === '/admin' || pathname === '/admin/') {
      // TODO: Get user's default organization ID
      const defaultOrgId = 'default'; // Replace with actual logic
      return NextResponse.redirect(new URL(`/admin/${defaultOrgId}/dashboard`, request.url));
    }

    // Handle legacy admin routes - will be implemented in Section 3
    // TODO: Add redirects for old /admin/dashboard -> /admin/{orgId}/dashboard etc.
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Files with extensions (images, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)',
  ],
};
