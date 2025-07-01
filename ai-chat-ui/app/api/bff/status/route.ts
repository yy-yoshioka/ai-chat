import { NextRequest, NextResponse } from 'next/server';
import { fetcherWithAuth } from '@/app/_utils/fetcher';
import { getAuthTokenFromCookie } from '@/app/_utils/auth-utils';
import { EXPRESS_API } from '@/app/_config/api';

// GET /api/bff/status - Get public status
export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${EXPRESS_API}/api/status/public`);
    
    if (!response.ok) {
      throw new Error(`Status check failed: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Failed to fetch status:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch status' },
      { status: error.status || 500 }
    );
  }
}