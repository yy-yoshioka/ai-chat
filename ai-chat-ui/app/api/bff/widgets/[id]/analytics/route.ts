import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { widgetAnalyticsSchema } from '@/app/_schemas/widgets';
import { EXPRESS_API } from '@/app/_config/api';
import { fetchGet } from '@/app/_utils/fetcher';

// GET /api/bff/widgets/[id]/analytics - Get widget analytics
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth-token')?.value;

    if (!authToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await fetchGet(`${EXPRESS_API}/v1/widgets/${params.id}/analytics`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      cache: 'no-store',
    });

    const parsed = widgetAnalyticsSchema.safeParse(data);
    if (!parsed.success) {
      console.error('Invalid widget analytics response:', parsed.error);
      return NextResponse.json({ error: 'Invalid response format' }, { status: 500 });
    }

    return NextResponse.json(parsed.data);
  } catch (error) {
    console.error('BFF widget analytics GET error:', error);

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
