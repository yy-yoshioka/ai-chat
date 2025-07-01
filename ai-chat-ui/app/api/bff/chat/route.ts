import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ChatRequestSchema, type ChatRequest } from '@/app/_schemas/chat';
import { EXPRESS_API } from '@/app/_config/api';
import { validateRequest, createValidationErrorResponse } from '@/app/_utils/validation';

// POST /api/bff/chat - Send chat message
export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth-token')?.value;

    if (!authToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    // Validate request using new validation utility
    const validation = validateRequest(ChatRequestSchema, body);
    if (!validation.success) {
      return createValidationErrorResponse(validation.error);
    }

    const validatedData: ChatRequest = validation.data;

    const response = await fetch(`${EXPRESS_API}/api/chat`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validatedData),
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
