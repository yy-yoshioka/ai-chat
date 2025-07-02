import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { organizationSchema } from '@/app/_schemas/organizations';
import { EXPRESS_API } from '@/app/_config/api';
import { fetchGet } from '@/app/_utils/fetcher';

// GET /api/bff/organizations - Get user's organizations
export async function GET() {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth-token')?.value;

    if (!authToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await fetchGet(`${EXPRESS_API}/v1/organizations`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      cache: 'no-store',
    });

    // Validate the response
    const organizations = Array.isArray(data) ? data : [];
    const validatedOrgs = organizations
      .map((org) => {
        const parsed = organizationSchema.safeParse(org);
        if (!parsed.success) {
          console.error('Invalid organization data:', parsed.error);
          return null;
        }
        return parsed.data;
      })
      .filter(Boolean);

    return NextResponse.json(validatedOrgs);
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
