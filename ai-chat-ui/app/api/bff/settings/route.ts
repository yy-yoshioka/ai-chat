import { NextRequest, NextResponse } from 'next/server';
import { fetcher } from '../../../_utils/fetcher';
import { getSession } from '../../../_utils/auth-utils';
import { CreateAPIKeySchema, NotificationSettingsInputSchema } from '../../../_schemas/settings';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const type = url.searchParams.get('type');

    let endpoint = '';
    switch (type) {
      case 'api-keys':
        endpoint = '/settings/api-keys';
        break;
      case 'notifications':
        endpoint = '/settings/notifications';
        break;
      case 'notification-list':
        endpoint = '/settings/notifications/list';
        break;
      case 'unread-count':
        endpoint = '/settings/notifications/unread-count';
        break;
      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    const data = await fetcher(`${process.env.API_URL}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${session.token}`,
        'X-Organization-Id': session.organizationId,
      },
    });

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const type = url.searchParams.get('type');
    const body = await request.json();

    let endpoint = '';
    let validatedBody = body;

    switch (type) {
      case 'api-key':
        endpoint = '/settings/api-keys';
        validatedBody = CreateAPIKeySchema.parse(body);
        break;
      case 'notification':
        endpoint = '/settings/notifications';
        validatedBody = NotificationSettingsInputSchema.parse(body);
        break;
      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    const method = type === 'notification' ? 'PUT' : 'POST';
    const data = await fetcher(`${process.env.API_URL}${endpoint}`, {
      method,
      headers: {
        Authorization: `Bearer ${session.token}`,
        'X-Organization-Id': session.organizationId,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validatedBody),
    });

    return NextResponse.json(data, { status: method === 'POST' ? 201 : 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save data' }, { status: 500 });
  }
}
