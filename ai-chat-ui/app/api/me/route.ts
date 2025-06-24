import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/app/_lib/config';

export async function GET(req: NextRequest) {
  try {
    // Development mock - return admin user if special cookie is set
    if (process.env.NODE_ENV === 'development' && req.cookies.get('dev-admin')?.value === 'true') {
      return NextResponse.json({
        user: {
          id: 'admin-1',
          name: '管理者',
          email: 'admin@example.com',
          role: 'admin',
          organizationId: 'org-demo',
          organizationName: 'デモ株式会社',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });
    }

    // Get cookies for forwarding
    const cookieHeader = req.headers.get('cookie');

    // Forward the request to the backend API with cookies
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Forward the cookie header
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          error: data.message || 'Authentication failed',
        },
        { status: response.status }
      );
    }

    // Return the user data
    return NextResponse.json({ user: data.user });
  } catch (error) {
    console.error('Me API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
