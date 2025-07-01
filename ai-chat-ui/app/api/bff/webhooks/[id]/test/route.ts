import { NextRequest, NextResponse } from 'next/server';
import { posterWithAuth } from '@/app/_utils/fetcher';
import { getAuthTokenFromCookie } from '@/app/_utils/auth-utils';
import { EXPRESS_API } from '@/app/_config/api';

// POST /api/bff/webhooks/[id]/test - Test webhook
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authToken = getAuthTokenFromCookie();
    if (!authToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await posterWithAuth(
      `${EXPRESS_API}/api/webhooks/${params.id}/test`,
      {},
      authToken
    );

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Failed to test webhook:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to test webhook' },
      { status: error.status || 500 }
    );
  }
}