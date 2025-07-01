import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { UserSchema } from '@/app/_schemas/auth';
import { EXPRESS_API } from '@/app/_config/api';

// GET /api/bff/auth/me - Get current user
export async function GET() {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth-token')?.value;

    if (!authToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const response = await fetch(`${EXPRESS_API}/api/me`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch user' }, { status: response.status });
    }

    const json = await response.json();

    // Validate response with Zod schema
    const parsed = UserSchema.safeParse(json.user);
    if (!parsed.success) {
      console.error('Invalid user response:', parsed.error);
      return NextResponse.json({ error: 'Invalid response format' }, { status: 500 });
    }

    return NextResponse.json({ user: parsed.data });
  } catch (error) {
    console.error('BFF auth/me GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
