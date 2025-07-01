import { NextRequest, NextResponse } from 'next/server';
import { fetcher } from '../../../../../_utils/fetcher';
import { getSession } from '../../../../../_utils/auth-utils';

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await fetcher(`${process.env.API_URL}/settings/notifications/read-all`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${session.token}`,
        'X-Organization-Id': session.organizationId,
      },
    });

    return NextResponse.json({}, { status: 204 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to mark all as read' }, { status: 500 });
  }
}
