import { NextRequest, NextResponse } from 'next/server';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'super_admin';
  organizationId?: string;
  organizationName?: string;
}

// Helper function to verify JWT token (simplified for now)
async function verifyToken(token: string): Promise<User | null> {
  try {
    // In a real implementation, use proper JWT verification
    // For now, use a simple decode for development
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const payload = parts[1];
    const decodedPayload = Buffer.from(payload, 'base64').toString('utf-8');
    return JSON.parse(decodedPayload) as User;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

// Helper function to check if user has access to organization
function hasOrgAccess(user: User, orgId: string): boolean {
  // Super admin has access to all organizations
  if (user.role === 'super_admin') {
    return true;
  }

  // Check if user belongs to the organization
  if (user.organizationId === orgId) {
    return true;
  }

  // In a real implementation, check user's organization memberships
  // For now, allow access to demo org for testing
  if (orgId === 'org-demo') {
    return true;
  }

  return false;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // Get authentication token
  let user: User | null = null;

  // Check for development mode cookie first
  if (process.env.NODE_ENV === 'development') {
    const devAdminCookie = request.cookies.get('dev-admin');
    if (devAdminCookie?.value === 'true') {
      // Mock user for development
      user = {
        id: 'dev-user',
        name: 'Development User',
        email: 'dev@example.com',
        role: 'admin',
        organizationId: 'org-demo',
        organizationName: 'Demo Organization',
      };
    }
  }

  // If no dev user, check for JWT token
  if (!user) {
    const authCookie = request.cookies.get('auth-token');
    if (authCookie?.value) {
      user = await verifyToken(authCookie.value);
    }
  }

  // Handle admin routes
  if (pathname.startsWith('/admin')) {
    // Redirect /admin to org selector or default org
    if (pathname === '/admin') {
      if (user?.organizationId) {
        return NextResponse.redirect(
          new URL(`/admin/${user.organizationId}/dashboard`, request.url)
        );
      } else {
        return NextResponse.redirect(new URL('/admin/org-selector', request.url));
      }
    }

    // Handle org-specific admin routes
    const orgMatch = pathname.match(/^\/admin\/([^\/]+)/);
    if (orgMatch) {
      const orgId = orgMatch[1];

      // Skip org selector page
      if (orgId === 'org-selector') {
        return NextResponse.next();
      }

      // Check authentication
      if (!user) {
        return NextResponse.redirect(new URL('/login', request.url));
      }

      // Check if user is admin or has org access
      if (user.role !== 'admin' && user.role !== 'super_admin' && !hasOrgAccess(user, orgId)) {
        return NextResponse.redirect(new URL('/', request.url));
      }

      // Check organization access
      if (!hasOrgAccess(user, orgId)) {
        return NextResponse.redirect(new URL('/admin/org-selector', request.url));
      }
    }
  }

  // Handle superadmin routes
  if (pathname.startsWith('/superadmin')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    if (user.role !== 'super_admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Handle auth routes (login, signup) - redirect if already authenticated
  if ((pathname === '/login' || pathname === '/signup') && user) {
    if (user.role === 'super_admin') {
      return NextResponse.redirect(new URL('/superadmin', request.url));
    } else if (user.role === 'admin' && user.organizationId) {
      return NextResponse.redirect(new URL(`/admin/${user.organizationId}/dashboard`, request.url));
    } else {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Add user info to headers for pages that need it
  const response = NextResponse.next();
  if (user) {
    response.headers.set('x-user-id', user.id);
    response.headers.set('x-user-role', user.role);
    if (user.organizationId) {
      response.headers.set('x-user-org', user.organizationId);
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
