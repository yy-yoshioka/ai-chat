import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ChatRequestSchema } from '@/app/_schemas/chat';
import { EXPRESS_API } from '@/app/_config/api';

// POST /api/bff/chat - Send chat message
export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth-token')?.value;

    if (!authToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    // Validate request
    const parsed = ChatRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }

    const response = await fetch(`${EXPRESS_API}/api/chat`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(parsed.data),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to process chat message' },
        { status: response.status }
      );
    }

    const json = await response.json();
    return NextResponse.json(json);
  } catch (error) {
    console.error('BFF chat POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
