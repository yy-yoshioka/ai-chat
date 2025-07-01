import { NextRequest, NextResponse } from 'next/server';
import { posterWithAuth, fetcherWithAuth } from '@/app/_utils/fetcher';
import { getAuthTokenFromCookie } from '@/app/_utils/auth-utils';
import { EXPRESS_API } from '@/app/_config/api';
import { createWebhookSchema, webhookLogsQuerySchema } from '@/app/_schemas/webhooks';
import { validateRequest } from '@/app/_utils/validation';

// GET /api/bff/webhooks - Get all webhooks
export async function GET(request: NextRequest) {
  try {
    const authToken = getAuthTokenFromCookie();
    if (!authToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await fetcherWithAuth(`${EXPRESS_API}/api/webhooks`, authToken);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Failed to fetch webhooks:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch webhooks' },
      { status: error.status || 500 }
    );
  }
}

// POST /api/bff/webhooks - Create new webhook
export async function POST(request: NextRequest) {
  try {
    const authToken = getAuthTokenFromCookie();
    if (!authToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Validate request body
    const validation = validateRequest(createWebhookSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const data = await posterWithAuth(
      `${EXPRESS_API}/api/webhooks`,
      validation.data,
      authToken
    );

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error('Failed to create webhook:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create webhook' },
      { status: error.status || 500 }
    );
  }
}