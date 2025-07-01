import { NextRequest, NextResponse } from 'next/server';
import { fetcher } from '../../../../_utils/fetcher';
import { getSession } from '../../../../_utils/auth-utils';

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession(request);
    if (!session?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const type = url.searchParams.get('type');

    let endpoint = '';
    switch (type) {
      case 'api-key':
        endpoint = `/settings/api-keys/${params.id}`;
        break;
      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    await fetcher(`${process.env.API_URL}${endpoint}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${session.token}`,
        'X-Organization-Id': session.organizationId,
      },
    });

    return NextResponse.json({}, { status: 204 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession(request);
    if (!session?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const action = url.searchParams.get('action');

    if (action === 'read') {
      await fetcher(`${process.env.API_URL}/settings/notifications/${params.id}/read`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${session.token}`,
          'X-Organization-Id': session.organizationId,
        },
      });

      return NextResponse.json({}, { status: 204 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
