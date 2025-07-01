import { NextRequest, NextResponse } from 'next/server';
import { posterWithAuth } from '@/app/_utils/fetcher';
import { getAuthTokenFromCookie } from '@/app/_utils/auth-utils';
import { EXPRESS_API } from '@/app/_config/api';
import { updateIncidentSchema } from '@/app/_schemas/system-health';
import { validateRequest } from '@/app/_utils/validation';

// POST /api/bff/status/incidents/[id]/updates - Add incident update
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authToken = getAuthTokenFromCookie();
    if (!authToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Validate request body
    const validation = validateRequest(updateIncidentSchema, body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const data = await posterWithAuth(
      `${EXPRESS_API}/api/status/incidents/${params.id}/updates`,
      validation.data,
      authToken
    );

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Failed to update incident:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update incident' },
      { status: error.status || 500 }
    );
  }
}
