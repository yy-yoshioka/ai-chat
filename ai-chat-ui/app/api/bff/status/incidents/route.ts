import { NextRequest, NextResponse } from 'next/server';
import { fetcherWithAuth, posterWithAuth } from '@/app/_utils/fetcher';
import { getAuthTokenFromCookie } from '@/app/_utils/auth-utils';
import { EXPRESS_API } from '@/app/_config/api';
import { createIncidentSchema } from '@/app/_schemas/system-health';
import { validateRequest } from '@/app/_utils/validation';

// GET /api/bff/status/incidents - Get incidents
export async function GET(request: NextRequest) {
  try {
    const authToken = getAuthTokenFromCookie();
    if (!authToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const days = searchParams.get('days');
    const url = `${EXPRESS_API}/api/status/incidents${days ? `?days=${days}` : ''}`;

    const data = await fetcherWithAuth(url, authToken);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Failed to fetch incidents:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch incidents' },
      { status: error.status || 500 }
    );
  }
}

// POST /api/bff/status/incidents - Create new incident
export async function POST(request: NextRequest) {
  try {
    const authToken = getAuthTokenFromCookie();
    if (!authToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Validate request body
    const validation = validateRequest(createIncidentSchema, body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const data = await posterWithAuth(
      `${EXPRESS_API}/api/status/incidents`,
      validation.data,
      authToken
    );

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error('Failed to create incident:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create incident' },
      { status: error.status || 500 }
    );
  }
}
