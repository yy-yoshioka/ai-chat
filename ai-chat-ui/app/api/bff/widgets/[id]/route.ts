import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { widgetDetailSchema, widgetUpdateSchema } from '@/app/_schemas/widgets';
import { EXPRESS_API } from '@/app/_config/api';
import { fetchGet, fetchPut, fetchDelete } from '@/app/_utils/fetcher';
import { validateResponse } from '@/app/_utils/validation';

// GET /api/bff/widgets/[id] - Get widget by ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth-token')?.value;

    if (!authToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await fetchGet(`${EXPRESS_API}/v1/widgets/${params.id}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      cache: 'no-store',
    });

    // Validate response data
    try {
      const validatedWidget = validateResponse(widgetDetailSchema, data);
      return NextResponse.json(validatedWidget);
    } catch (validationError) {
      console.error('Response validation failed:', validationError);
      // Return data anyway but log the validation error
      return NextResponse.json(data);
    }
  } catch (error) {
    console.error('BFF widget GET error:', error);

    if (error instanceof Error && 'status' in error) {
      const fetchError = error as { status: number; message: string };

      if (fetchError.status === 401) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      if (fetchError.status === 404) {
        return NextResponse.json({ error: 'Widget not found' }, { status: 404 });
      }

      if (fetchError.status >= 500) {
        return NextResponse.json({ error: 'Service unavailable' }, { status: 502 });
      }
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/bff/widgets/[id] - Update widget
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth-token')?.value;

    if (!authToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const updateData = widgetUpdateSchema.parse(body);

    const data = await fetchPut(`${EXPRESS_API}/v1/widgets/${params.id}`, updateData, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('BFF widget PUT error:', error);

    if (error instanceof Error && 'status' in error) {
      const fetchError = error as { status: number; message: string };

      if (fetchError.status === 401) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      if (fetchError.status === 404) {
        return NextResponse.json({ error: 'Widget not found' }, { status: 404 });
      }

      if (fetchError.status >= 500) {
        return NextResponse.json({ error: 'Service unavailable' }, { status: 502 });
      }
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/bff/widgets/[id] - Delete widget
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth-token')?.value;

    if (!authToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await fetchDelete(`${EXPRESS_API}/v1/widgets/${params.id}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('BFF widget DELETE error:', error);

    if (error instanceof Error && 'status' in error) {
      const fetchError = error as { status: number; message: string };

      if (fetchError.status === 401) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      if (fetchError.status === 404) {
        return NextResponse.json({ error: 'Widget not found' }, { status: 404 });
      }

      if (fetchError.status >= 500) {
        return NextResponse.json({ error: 'Service unavailable' }, { status: 502 });
      }
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
