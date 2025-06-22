import { NextRequest, NextResponse } from 'next/server';

// Helper function to check authentication (mock implementation)
function checkAuthentication(request: NextRequest): boolean {
  // In a real implementation, you would:
  // 1. Check for JWT token in cookies or headers
  // 2. Validate the token
  // 3. Return authentication status

  // Mock implementation - check for auth cookie
  const authToken = request.cookies.get('auth-token');
  const sessionToken = request.cookies.get('next-auth.session-token');

  return !!(authToken || sessionToken);
}

// Helper function to check admin role (mock implementation)
function checkAdminRole(request: NextRequest): boolean {
  // In a real implementation, you would:
  // 1. Decode the JWT token
  // 2. Check user role/permissions
  // 3. Return admin status

  // Mock implementation - check for admin role cookie
  const userRole = request.cookies.get('user-role');
  return userRole?.value === 'admin';
}

// Helper function to get user's default organization
function getDefaultOrgId(request: NextRequest): string {
  // In a real implementation, you would:
  // 1. Get user ID from token
  // 2. Query database for user's default org
  // 3. Return org ID

  // Mock implementation - return from cookie or default
  const defaultOrg = request.cookies.get('default-org-id');
  return defaultOrg?.value || 'default';
}

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

  // Check authentication for protected routes
  const isAuthenticated = checkAuthentication(request);
  const isAdmin = checkAdminRole(request);

  // Handle legacy /chat and /widgets routes - redirect to organization-aware structure
  if (pathname === '/chat' || pathname.startsWith('/chat/')) {
    if (!isAuthenticated) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl);
    }
    const defaultOrgId = getDefaultOrgId(request);
    return NextResponse.redirect(
      new URL(`/admin/${defaultOrgId}/chats`, request.url),
      { status: 301 } // Permanent redirect
    );
  }

  if (pathname === '/widgets' || pathname.startsWith('/widgets/')) {
    if (!isAuthenticated) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl);
    }
    const defaultOrgId = getDefaultOrgId(request);
    return NextResponse.redirect(
      new URL(`/admin/${defaultOrgId}/settings/widgets`, request.url),
      { status: 301 } // Permanent redirect
    );
  }

  // Handle /admin routes
  if (pathname.startsWith('/admin')) {
    // Authentication check
    if (!isAuthenticated) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Admin role check
    if (!isAdmin) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Handle /admin direct access - redirect to default org dashboard
    if (pathname === '/admin' || pathname === '/admin/') {
      const defaultOrgId = getDefaultOrgId(request);
      return NextResponse.redirect(new URL(`/admin/${defaultOrgId}/dashboard`, request.url));
    }

    // Handle legacy admin routes - redirect to new structure
    const legacyRoutes = [
      { from: '/admin/dashboard', to: '/dashboard' },
      { from: '/admin/chats', to: '/chats' },
      { from: '/admin/logs', to: '/logs' },
      { from: '/admin/users', to: '/users' },
      { from: '/admin/reports', to: '/reports' },
      { from: '/admin/faq', to: '/faq' },
      { from: '/admin/faq/create', to: '/faq/create' },
      { from: '/admin/settings', to: '/settings' },
    ];

    for (const route of legacyRoutes) {
      if (pathname === route.from || pathname.startsWith(route.from + '/')) {
        const defaultOrgId = getDefaultOrgId(request);
        const newPath = pathname.replace(route.from, route.to);
        return NextResponse.redirect(
          new URL(`/admin/${defaultOrgId}${newPath}`, request.url),
          { status: 301 } // Permanent redirect
        );
      }
    }

    // Handle legacy /admin/org/[id]/* routes
    const orgRouteMatch = pathname.match(/^\/admin\/org\/([^\/]+)(.*)$/);
    if (orgRouteMatch) {
      const [, orgId, subPath] = orgRouteMatch;
      const newPath = subPath === '' ? '/dashboard' : subPath;
      return NextResponse.redirect(
        new URL(`/admin/${orgId}${newPath}`, request.url),
        { status: 301 } // Permanent redirect
      );
    }

    // Handle legacy FAQ dynamic routes
    const faqDynamicMatch = pathname.match(/^\/admin\/faq\/([^\/]+)$/);
    if (faqDynamicMatch) {
      const [, faqId] = faqDynamicMatch;
      const defaultOrgId = getDefaultOrgId(request);
      return NextResponse.redirect(
        new URL(`/admin/${defaultOrgId}/faq/${faqId}`, request.url),
        { status: 301 } // Permanent redirect
      );
    }
  }

  // Handle other authentication-required pages
  const protectedRoutes = ['/profile', '/billing'];
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    if (!isAuthenticated) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl);
    }
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
