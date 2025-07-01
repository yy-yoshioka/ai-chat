import { NextRequest, NextResponse } from 'next/server';
import { fetcherWithAuth } from '@/app/_utils/fetcher';
import { getAuthTokenFromCookie } from '@/app/_utils/auth-utils';
import { EXPRESS_API } from '@/app/_config/api';

// GET /api/bff/status/incidents/[id] - Get specific incident
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // This endpoint is public, no auth required
    const response = await fetch(`${EXPRESS_API}/api/status/incidents/${params.id}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch incident: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Failed to fetch incident:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch incident' },
      { status: error.status || 500 }
    );
  }
}