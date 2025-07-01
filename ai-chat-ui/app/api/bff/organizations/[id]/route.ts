import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { organizationSchema, organizationUpdateSchema } from '@/app/_schemas/organizations';
import { EXPRESS_API } from '@/app/_config/api';
import { fetchGet, fetchPut } from '@/app/_utils/fetcher';

// GET /api/bff/organizations/[id] - Get organization by ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth-token')?.value;

    if (!authToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await fetchGet(`${EXPRESS_API}/v1/organizations/${params.id}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      cache: 'no-store',
    });

    const parsed = organizationSchema.safeParse(data);
    if (!parsed.success) {
      console.error('Invalid organization response:', parsed.error);
      return NextResponse.json({ error: 'Invalid response format' }, { status: 500 });
    }

    return NextResponse.json(parsed.data);
  } catch (error) {
    console.error('BFF organization GET error:', error);

    if (error instanceof Error && 'status' in error) {
      const fetchError = error as { status: number; message: string };

      if (fetchError.status === 401) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      if (fetchError.status === 404) {
        return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
      }

      if (fetchError.status >= 500) {
        return NextResponse.json({ error: 'Service unavailable' }, { status: 502 });
      }
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/bff/organizations/[id] - Update organization
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth-token')?.value;

    if (!authToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const updateData = organizationUpdateSchema.parse(body);

    const data = await fetchPut(`${EXPRESS_API}/v1/organizations/${params.id}`, updateData, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    const parsed = organizationSchema.safeParse(data);
    if (!parsed.success) {
      console.error('Invalid organization response:', parsed.error);
      return NextResponse.json({ error: 'Invalid response format' }, { status: 500 });
    }

    return NextResponse.json(parsed.data);
  } catch (error) {
    console.error('BFF organization PUT error:', error);

    if (error instanceof Error && 'status' in error) {
      const fetchError = error as { status: number; message: string };

      if (fetchError.status === 401) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      if (fetchError.status === 403) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
      }

      if (fetchError.status === 404) {
        return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
      }

      if (fetchError.status >= 500) {
        return NextResponse.json({ error: 'Service unavailable' }, { status: 502 });
      }
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
