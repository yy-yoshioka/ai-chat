import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { userSchema, userUpdateSchema } from '@/app/_schemas/users';
import { EXPRESS_API } from '@/app/_config/api';
import { fetchGet, fetchPut, fetchDelete } from '@/app/_utils/fetcher';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth-token')?.value;
    const { id } = await params;

    if (!authToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await fetchGet(`${EXPRESS_API}/api/users/${id}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      cache: 'no-store',
    });

    const parsed = userSchema.safeParse(data);
    if (!parsed.success) {
      console.error('Invalid user response:', parsed.error);
      return NextResponse.json({ error: 'Invalid response format' }, { status: 500 });
    }

    return NextResponse.json(parsed.data);
  } catch (error) {
    console.error('BFF users GET by id error:', error);

    if (error instanceof Error && 'status' in error) {
      const fetchError = error as { status: number; message: string };

      if (fetchError.status === 401) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      if (fetchError.status === 404) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      if (fetchError.status >= 500) {
        return NextResponse.json({ error: 'Service unavailable' }, { status: 502 });
      }
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth-token')?.value;
    const { id } = await params;

    if (!authToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const updateData = userUpdateSchema.parse(body);

    const data = await fetchPut(`${EXPRESS_API}/api/users/${id}`, updateData, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    const parsed = userSchema.safeParse(data);
    if (!parsed.success) {
      console.error('Invalid user response:', parsed.error);
      return NextResponse.json({ error: 'Invalid response format' }, { status: 500 });
    }

    return NextResponse.json(parsed.data);
  } catch (error) {
    console.error('BFF users PUT error:', error);

    if (error instanceof Error && 'status' in error) {
      const fetchError = error as { status: number; message: string };

      if (fetchError.status === 401) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      if (fetchError.status === 403) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      if (fetchError.status === 404) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      if (fetchError.status >= 500) {
        return NextResponse.json({ error: 'Service unavailable' }, { status: 502 });
      }
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth-token')?.value;
    const { id } = await params;

    if (!authToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await fetchDelete(`${EXPRESS_API}/api/users/${id}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('BFF users DELETE error:', error);

    if (error instanceof Error && 'status' in error) {
      const fetchError = error as { status: number; message: string };

      if (fetchError.status === 401) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      if (fetchError.status === 403) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      if (fetchError.status === 404) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      if (fetchError.status >= 500) {
        return NextResponse.json({ error: 'Service unavailable' }, { status: 502 });
      }
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
