import { NextRequest, NextResponse } from 'next/server';
import { EXPRESS_API } from '@/app/_config/api';

// GET /api/bff/status/health - Health check endpoint
export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${EXPRESS_API}/api/status/health`);
    
    if (!response.ok && response.status !== 503) {
      throw new Error(`Health check failed: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      { 
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message || 'Health check failed' 
      },
      { status: 503 }
    );
  }
}