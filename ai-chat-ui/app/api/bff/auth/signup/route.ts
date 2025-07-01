import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { SignupSchema } from '@/app/_schemas/auth';
import { EXPRESS_API } from '@/app/_config/api';

// POST /api/bff/auth/signup - Signup new user
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate request body
    const parsed = SignupSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }

    const response = await fetch(`${EXPRESS_API}/api/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(parsed.data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.message || 'Signup failed' },
        { status: response.status }
      );
    }

    const json = await response.json();

    // Set auth cookie if token is returned
    if (json.token) {
      const cookieStore = await cookies();
      cookieStore.set('auth-token', json.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('BFF auth/signup POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
