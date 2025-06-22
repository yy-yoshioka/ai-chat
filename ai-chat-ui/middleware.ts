import { NextRequest, NextResponse } from 'next/server';

// User info interface
interface UserInfo {
  id: string;
  name: string;
  email: string;
  role: string;
  organizationId: string;
  organizationName: string;
  [key: string]: unknown; // For additional properties
}

// Helper function to decode JWT token and extract user info
function decodeJWTToken(token: string): UserInfo | null {
  try {
    // Split JWT token into parts
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    // Decode the payload (second part)
    const payload = parts[1];
    const decodedPayload = Buffer.from(payload, 'base64').toString('utf-8');
    return JSON.parse(decodedPayload) as UserInfo;
  } catch (error) {
    console.error('Error decoding JWT token:', error);
    return null;
  }
}

// Helper function to get user info from request
function getUserInfo(request: NextRequest): UserInfo | null {
  // Development mode: Check for dev-admin cookie first
  if (process.env.NODE_ENV === 'development') {
    const devAdmin = request.cookies.get('dev-admin')?.value;
    if (devAdmin === 'true') {
      // Return mock admin user data for development
      return {
        id: 'admin-1',
        name: '管理者',
        email: 'admin@example.com',
        role: 'admin',
        organizationId: 'org-demo',
        organizationName: 'デモ株式会社',
      };
    }
  }

  // Try to get JWT token from cookies
  const authToken = request.cookies.get('auth-token')?.value;
  const sessionToken = request.cookies.get('next-auth.session-token')?.value;
  const backendToken = request.cookies.get('token')?.value; // Backend API token

  // Try to get token from Authorization header
  const authHeader = request.headers.get('authorization');
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  const token = authToken || sessionToken || backendToken || bearerToken;

  if (!token) {
    return null;
  }

  return decodeJWTToken(token);
}

// Helper function to check authentication
function checkAuthentication(request: NextRequest): boolean {
  const userInfo = getUserInfo(request);
  return !!userInfo;
}

// Helper function to check admin role
function checkAdminRole(request: NextRequest): boolean {
  const userInfo = getUserInfo(request);
  return userInfo?.role === 'admin' || userInfo?.role === 'super_admin';
}

// Helper function to get user's default organization
function getDefaultOrgId(request: NextRequest): string {
  const userInfo = getUserInfo(request);

  // Return organizationId from user info if available
  if (userInfo?.organizationId) {
    return userInfo.organizationId;
  }

  // Fallback: check for organization ID in cookie
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
