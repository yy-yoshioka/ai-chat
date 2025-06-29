import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const EXPRESS_API = process.env.EXPRESS_API || 'http://localhost:8000';

// POST /api/bff/auth/logout - Logout user
export async function POST() {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth-token')?.value;

    // Call Express logout endpoint if token exists
    if (authToken) {
      await fetch(`${EXPRESS_API}/api/logout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      }).catch(() => {
        // Ignore errors from Express, we'll clear the cookie anyway
      });
    }

    // Clear auth cookie
    cookieStore.delete('auth-token');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('BFF auth/logout POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
