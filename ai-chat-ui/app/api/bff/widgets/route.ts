import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { widgetListResponseSchema, widgetCreateSchema } from '@/app/_schemas/widgets';
import { EXPRESS_API } from '@/app/_config/api';
import { fetchGet, fetchPost } from '@/app/_utils/fetcher';

// GET /api/bff/widgets - Get widgets by organization
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth-token')?.value;

    if (!authToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const queryParams = new URLSearchParams();

    if (searchParams.get('page')) queryParams.append('page', searchParams.get('page')!);
    if (searchParams.get('limit')) queryParams.append('limit', searchParams.get('limit')!);
    if (searchParams.get('search')) queryParams.append('search', searchParams.get('search')!);
    if (searchParams.get('status')) queryParams.append('status', searchParams.get('status')!);

    const url = `${EXPRESS_API}/v1/widgets${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    const data = await fetchGet(url, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      cache: 'no-store',
    });

    const parsed = widgetListResponseSchema.safeParse(data);
    if (!parsed.success) {
      console.error('Invalid widget list response:', parsed.error);
      return NextResponse.json({ error: 'Invalid response format' }, { status: 500 });
    }

    return NextResponse.json(parsed.data);
  } catch (error) {
    console.error('BFF widgets GET error:', error);

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

// POST /api/bff/widgets - Create widget
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth-token')?.value;

    if (!authToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const createData = widgetCreateSchema.parse(body);

    const data = await fetchPost(`${EXPRESS_API}/v1/widgets`, createData, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('BFF widgets POST error:', error);

    if (error instanceof Error && 'status' in error) {
      const fetchError = error as { status: number; message: string };

      if (fetchError.status === 401) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      if (fetchError.status === 400) {
        return NextResponse.json({ error: 'Bad request' }, { status: 400 });
      }

      if (fetchError.status >= 500) {
        return NextResponse.json({ error: 'Service unavailable' }, { status: 502 });
      }
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
