import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { userInviteSchema, userInviteResponseSchema } from '@/app/_schemas/users';
import { EXPRESS_API } from '@/app/_config/api';
import { fetchPost } from '@/app/_utils/fetcher';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth-token')?.value;

    if (!authToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const inviteData = userInviteSchema.parse(body);

    const data = await fetchPost(`${EXPRESS_API}/api/users/invite`, inviteData, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    const parsed = userInviteResponseSchema.safeParse(data);
    if (!parsed.success) {
      console.error('Invalid invite response:', parsed.error);
      return NextResponse.json({ error: 'Invalid response format' }, { status: 500 });
    }

    return NextResponse.json(parsed.data);
  } catch (error) {
    console.error('BFF users invite POST error:', error);

    if (error instanceof Error && 'status' in error) {
      const fetchError = error as { status: number; message: string };

      if (fetchError.status === 401) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      if (fetchError.status === 403) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      if (fetchError.status === 409) {
        return NextResponse.json({ error: 'User already exists' }, { status: 409 });
      }

      if (fetchError.status >= 500) {
        return NextResponse.json({ error: 'Service unavailable' }, { status: 502 });
      }
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
