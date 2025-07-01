import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { EXPRESS_API } from '@/app/_config/api';
import {
  updateApiKeySchema,
  apiKeySchema,
  type UpdateApiKey,
  type ApiKey,
} from '@/app/_schemas/api-keys';
import {
  validateRequest,
  validateResponse,
  createValidationErrorResponse,
} from '@/app/_utils/validation';

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/bff/api-keys/[id] - Get API key by ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  const cookieStore = await cookies();
  const authToken = cookieStore.get('auth-token')?.value;

  if (!authToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const response = await fetch(`${EXPRESS_API}/api/api-keys/${params.id}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();

    // Validate response data
    try {
      const validatedResponse: ApiKey = validateResponse(apiKeySchema, data);
      return NextResponse.json(validatedResponse);
    } catch (validationError) {
      console.error('Response validation failed:', validationError);
      // Return data anyway but log the validation error
      return NextResponse.json(data);
    }
  } catch (error) {
    console.error('API key fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch API key' }, { status: 500 });
  }
}

// PUT /api/bff/api-keys/[id] - Update API key
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const cookieStore = await cookies();
  const authToken = cookieStore.get('auth-token')?.value;

  if (!authToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();

    // Validate request body
    const validation = validateRequest(updateApiKeySchema, body);
    if (!validation.success) {
      return createValidationErrorResponse(validation.error);
    }

    const validatedData: UpdateApiKey = validation.data;

    const response = await fetch(`${EXPRESS_API}/api/api-keys/${params.id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validatedData),
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();

    // Validate response data
    try {
      const validatedResponse: ApiKey = validateResponse(apiKeySchema, data);
      return NextResponse.json(validatedResponse);
    } catch (validationError) {
      console.error('Response validation failed:', validationError);
      // Return data anyway but log the validation error
      return NextResponse.json(data);
    }
  } catch (error) {
    console.error('API key update error:', error);
    return NextResponse.json({ error: 'Failed to update API key' }, { status: 500 });
  }
}

// DELETE /api/bff/api-keys/[id] - Delete API key
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const cookieStore = await cookies();
  const authToken = cookieStore.get('auth-token')?.value;

  if (!authToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const response = await fetch(`${EXPRESS_API}/api/api-keys/${params.id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(error, { status: response.status });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API key deletion error:', error);
    return NextResponse.json({ error: 'Failed to delete API key' }, { status: 500 });
  }
}
