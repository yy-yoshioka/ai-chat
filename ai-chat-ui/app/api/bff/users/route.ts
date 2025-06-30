import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { userListQuerySchema, userListResponseSchema } from '@/app/_schemas/users';
import { EXPRESS_API } from '@/app/_config/api';
import { fetchGet } from '@/app/_utils/fetcher';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth-token')?.value;

    if (!authToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const queryParams = {
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '20',
      search: searchParams.get('search') || undefined,
      role: searchParams.get('role') || undefined,
      status: searchParams.get('status') || undefined,
    };

    const query = userListQuerySchema.parse(queryParams);

    const data = await fetchGet(`${EXPRESS_API}/api/users`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      params: query as Record<string, string | number | boolean>,
      cache: 'no-store',
    });

    const parsed = userListResponseSchema.safeParse(data);
    if (!parsed.success) {
      console.error('Invalid users response:', parsed.error);
      return NextResponse.json({ error: 'Invalid response format' }, { status: 500 });
    }

    return NextResponse.json(parsed.data);
  } catch (error) {
    console.error('BFF users GET error:', error);

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
