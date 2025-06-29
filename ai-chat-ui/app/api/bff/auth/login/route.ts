import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';

const EXPRESS_API = process.env.EXPRESS_API || 'http://localhost:8000';

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

// POST /api/bff/auth/login - Login user
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate request body
    const parsed = LoginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }

    const response = await fetch(`${EXPRESS_API}/api/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(parsed.data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.message || 'Login failed' },
        { status: response.status }
      );
    }

    const json = await response.json();

    // Set auth cookie
    const cookieStore = await cookies();
    cookieStore.set('auth-token', json.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('BFF auth/login POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
