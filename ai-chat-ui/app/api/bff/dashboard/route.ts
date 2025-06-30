import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { dashboardResponseSchema } from '@/app/_schemas/dashboard';
import { EXPRESS_API } from '@/app/_config/api';
import { fetchGet } from '@/app/_utils/fetcher';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth-token')?.value;

    if (!authToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await fetchGet(`${EXPRESS_API}/api/dashboard`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      cache: 'no-store',
    });

    const parsed = dashboardResponseSchema.safeParse(data);
    if (!parsed.success) {
      console.error('Invalid dashboard response:', parsed.error);
      return NextResponse.json({ error: 'Invalid response format' }, { status: 500 });
    }

    return NextResponse.json(parsed.data);
  } catch (error) {
    console.error('BFF dashboard GET error:', error);

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
