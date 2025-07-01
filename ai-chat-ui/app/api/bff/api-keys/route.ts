import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { EXPRESS_API } from '@/app/_config/api';
import {
  apiKeyQuerySchema,
  apiKeyListResponseSchema,
  createApiKeySchema,
  apiKeySchema,
  type ApiKeyQuery,
  type ApiKeyListResponse,
  type CreateApiKey,
  type ApiKey,
} from '@/app/_schemas/api-keys';
import {
  validateQueryParams,
  validateRequest,
  validateResponse,
  createValidationErrorResponse,
} from '@/app/_utils/validation';

// GET /api/bff/api-keys - Get API keys list
export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const authToken = cookieStore.get('auth-token')?.value;

  if (!authToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);

    // Validate query parameters
    const validation = validateQueryParams(apiKeyQuerySchema, searchParams);
    if (!validation.success) {
      return createValidationErrorResponse(validation.error);
    }

    const validatedParams: ApiKeyQuery = validation.data;

    // Build query string from validated parameters
    const queryParams = new URLSearchParams();
    if (validatedParams.status) queryParams.append('status', validatedParams.status);
    if (validatedParams.search) queryParams.append('search', validatedParams.search);
    if (validatedParams.permission) queryParams.append('permission', validatedParams.permission);
    if (validatedParams.createdBy) queryParams.append('createdBy', validatedParams.createdBy);
    queryParams.append('page', validatedParams.page.toString());
    queryParams.append('limit', validatedParams.limit.toString());
    queryParams.append('sortBy', validatedParams.sortBy);
    queryParams.append('sortOrder', validatedParams.sortOrder);

    const response = await fetch(`${EXPRESS_API}/api/api-keys?${queryParams}`, {
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
      const validatedResponse: ApiKeyListResponse = validateResponse(
        apiKeyListResponseSchema,
        data
      );
      return NextResponse.json(validatedResponse);
    } catch (validationError) {
      console.error('Response validation failed:', validationError);
      // Return data anyway but log the validation error
      return NextResponse.json(data);
    }
  } catch (error) {
    console.error('API keys fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch API keys' }, { status: 500 });
  }
}

// POST /api/bff/api-keys - Create API key
export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const authToken = cookieStore.get('auth-token')?.value;

  if (!authToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();

    // Validate request body
    const validation = validateRequest(createApiKeySchema, body);
    if (!validation.success) {
      return createValidationErrorResponse(validation.error);
    }

    const validatedData: CreateApiKey = validation.data;

    const response = await fetch(`${EXPRESS_API}/api/api-keys`, {
      method: 'POST',
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
    console.error('API key creation error:', error);
    return NextResponse.json({ error: 'Failed to create API key' }, { status: 500 });
  }
}
