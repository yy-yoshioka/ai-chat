import { NextRequest, NextResponse } from 'next/server';
import {
  fetcherWithAuth,
  updaterWithAuth,
  deleterWithAuth,
} from '@/app/_utils/fetcher';
import { getAuthTokenFromCookie } from '@/app/_utils/auth-utils';
import { EXPRESS_API } from '@/app/_config/api';
import { updateWebhookSchema } from '@/app/_schemas/webhooks';
import { validateRequest } from '@/app/_utils/validation';

// GET /api/bff/webhooks/[id] - Get single webhook
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authToken = getAuthTokenFromCookie();
    if (!authToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await fetcherWithAuth(
      `${EXPRESS_API}/api/webhooks/${params.id}`,
      authToken
    );
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Failed to fetch webhook:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch webhook' },
      { status: error.status || 500 }
    );
  }
}

// PUT /api/bff/webhooks/[id] - Update webhook
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authToken = getAuthTokenFromCookie();
    if (!authToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Validate request body
    const validation = validateRequest(updateWebhookSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const data = await updaterWithAuth(
      `${EXPRESS_API}/api/webhooks/${params.id}`,
      validation.data,
      authToken
    );

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Failed to update webhook:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update webhook' },
      { status: error.status || 500 }
    );
  }
}

// DELETE /api/bff/webhooks/[id] - Delete webhook
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authToken = getAuthTokenFromCookie();
    if (!authToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await deleterWithAuth(
      `${EXPRESS_API}/api/webhooks/${params.id}`,
      authToken
    );

    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    console.error('Failed to delete webhook:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete webhook' },
      { status: error.status || 500 }
    );
  }
}