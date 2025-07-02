import { NextRequest, NextResponse } from 'next/server';
import { fetcherWithAuth } from '@/app/_utils/fetcher';
import { getAuthTokenFromCookie } from '@/app/_utils/auth-utils';
import { EXPRESS_API } from '@/app/_config/api';

// GET /api/bff/status/metrics - Get system metrics (admin only)
export async function GET(request: NextRequest) {
  try {
    const authToken = getAuthTokenFromCookie();
    if (!authToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const queryString = searchParams.toString();
    const url = `${EXPRESS_API}/api/status/metrics${queryString ? `?${queryString}` : ''}`;

    const data = await fetcherWithAuth(url, authToken);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to fetch metrics:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}
