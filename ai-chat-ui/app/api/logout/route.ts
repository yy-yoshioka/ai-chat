import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/app/_lib/config';

export async function POST(req: NextRequest) {
  try {
    // Development mode - clear development cookies
    if (process.env.NODE_ENV === 'development') {
      const response = NextResponse.json({
        success: true,
        message: 'Logout successful',
      });

      // Clear development cookies
      response.cookies.set('dev-admin', '', {
        httpOnly: true,
        path: '/',
        maxAge: 0,
      });
      response.cookies.set('auth-token', '', {
        httpOnly: true,
        path: '/',
        maxAge: 0,
      });

      return response;
    }

    // Get cookies for forwarding
    const cookieHeader = req.headers.get('cookie');

    // Forward the request to the backend API
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
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
          error: data.message || 'Logout failed',
        },
        { status: response.status }
      );
    }

    // Create the response
    const nextResponse = NextResponse.json({
      success: true,
      message: data.message,
    });

    // Forward any Set-Cookie headers from the backend API
    const setCookieHeader = response.headers.get('set-cookie');
    if (setCookieHeader) {
      nextResponse.headers.set('Set-Cookie', setCookieHeader);
    }

    return nextResponse;
  } catch (error) {
    console.error('Logout API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
