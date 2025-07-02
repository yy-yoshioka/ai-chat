import { NextResponse } from 'next/server';
import { EXPRESS_API } from '@/app/_config/api';

// GET /api/bff/status - Get public status
export async function GET() {
  try {
    const response = await fetch(`${EXPRESS_API}/api/status/public`);

    if (!response.ok) {
      throw new Error(`Status check failed: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to fetch status:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch status' },
      { status: 500 }
    );
  }
}
