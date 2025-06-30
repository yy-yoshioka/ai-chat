import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { organizationStatsSchema, organizationUpdateSchema } from '@/app/_schemas/organizations';
import { EXPRESS_API } from '@/app/_config/api';
import { fetchGet, fetchPut } from '@/app/_utils/fetcher';

// GET /api/bff/organizations - Get organization stats
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth-token')?.value;

    if (!authToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const endpoint = searchParams.get('stats') === 'true' 
      ? '/api/organizations/stats' 
      : '/api/organizations';

    const data = await fetchGet(`${EXPRESS_API}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      cache: 'no-store',
    });

    if (searchParams.get('stats') === 'true') {
      const parsed = organizationStatsSchema.safeParse(data);
      if (!parsed.success) {
        console.error('Invalid organization stats response:', parsed.error);
        return NextResponse.json({ error: 'Invalid response format' }, { status: 500 });
      }
      return NextResponse.json(parsed.data);
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('BFF organizations GET error:', error);
    
    if (error instanceof Error && 'status' in error) {
      const fetchError = error as { status: number; message: string };
      
      if (fetchError.status === 401) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      
      if (fetchError.status >= 500) {
        return NextResponse.json({ error: 'Service unavailable' }, { status: 502 });
      }
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/bff/organizations - Update organization
export async function PUT(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth-token')?.value;

    if (!authToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const updateData = organizationUpdateSchema.parse(body);

    const data = await fetchPut(`${EXPRESS_API}/api/organizations`, updateData, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('BFF organizations PUT error:', error);
    
    if (error instanceof Error && 'status' in error) {
      const fetchError = error as { status: number; message: string };
      
      if (fetchError.status === 401) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      
      if (fetchError.status === 403) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      
      if (fetchError.status >= 500) {
        return NextResponse.json({ error: 'Service unavailable' }, { status: 502 });
      }
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}