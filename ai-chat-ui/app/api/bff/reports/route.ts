import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { reportQuerySchema, reportDataSchema } from '@/app/_schemas/reports';
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
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      organizationId: searchParams.get('organizationId') || undefined,
      format: searchParams.get('format') || 'json',
      type: searchParams.get('type') || 'summary',
    };

    const query = reportQuerySchema.parse(queryParams);

    // Route to appropriate endpoint based on type
    let endpoint = '/api/reports';
    if (query.type === 'chart') {
      endpoint = '/api/reports/chart';
    } else if (query.type === 'detailed') {
      endpoint = '/api/reports/csv';
    }

    const data = await fetchGet(`${EXPRESS_API}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      params: query as Record<string, string>,
      cache: 'no-store',
    });

    // Handle CSV format
    if (query.format === 'csv') {
      return new NextResponse(data as string, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="report-${new Date().toISOString()}.csv"`,
        },
      });
    }

    // Validate JSON response
    const parsed = reportDataSchema.safeParse(data);
    if (!parsed.success) {
      console.error('Invalid report response:', parsed.error);
      return NextResponse.json({ error: 'Invalid response format' }, { status: 500 });
    }

    return NextResponse.json(parsed.data);
  } catch (error) {
    console.error('BFF reports GET error:', error);

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
