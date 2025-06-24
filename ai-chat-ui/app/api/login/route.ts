import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/app/_lib/config';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    // Validate request body
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Development mock - admin login
    if (
      process.env.NODE_ENV === 'development' &&
      email === 'admin@example.com' &&
      password === 'admin123'
    ) {
      // Create response with development admin data
      const response = NextResponse.json({
        success: true,
        message: 'Admin login successful',
        user: {
          id: 'admin-1',
          name: '管理者',
          email: 'admin@example.com',
          role: 'admin',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });

      // Set development admin cookies
      response.cookies.set('dev-admin', 'true', {
        httpOnly: true,
        path: '/',
        maxAge: 86400,
        sameSite: 'lax',
      });
      response.cookies.set('auth-token', 'dev-admin-token', {
        httpOnly: true,
        path: '/',
        maxAge: 86400,
        sameSite: 'lax',
      });

      return response;
    }

    // Forward the request to the backend API
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          error: data.message || 'Login failed',
        },
        { status: response.status }
      );
    }

    // Create the response
    const nextResponse = NextResponse.json({
      success: true,
      message: data.message,
      user: data.user,
    });

    // Forward the Set-Cookie header from the backend API if present
    const setCookieHeader = response.headers.get('set-cookie');
    if (setCookieHeader) {
      nextResponse.headers.set('Set-Cookie', setCookieHeader);
    }

    return nextResponse;
  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
