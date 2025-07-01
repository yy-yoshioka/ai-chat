import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { EXPRESS_API } from '@/app/_config/api';
import {
  conversationFlowQuerySchema,
  conversationFlowResponseSchema,
  type ConversationFlowQuery,
  type ConversationFlowResponse,
} from '@/app/_schemas/analytics';
import {
  validateQueryParams,
  validateResponse,
  createValidationErrorResponse,
} from '@/app/_utils/validation';

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token');

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);

    // Validate query parameters
    const validation = validateQueryParams(conversationFlowQuerySchema, searchParams);
    if (!validation.success) {
      return createValidationErrorResponse(validation.error);
    }

    const validatedParams: ConversationFlowQuery = validation.data;

    // Build query string from validated parameters
    const queryParams = new URLSearchParams();
    if (validatedParams.widgetId) queryParams.append('widgetId', validatedParams.widgetId);
    if (validatedParams.startDate) queryParams.append('startDate', validatedParams.startDate);
    if (validatedParams.endDate) queryParams.append('endDate', validatedParams.endDate);
    queryParams.append('limit', validatedParams.limit.toString());

    const response = await fetch(`${EXPRESS_API}/analytics/conversation-flow?${queryParams}`, {
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();

    // Validate response data
    try {
      const validatedResponse: ConversationFlowResponse = validateResponse(
        conversationFlowResponseSchema,
        data
      );
      return NextResponse.json(validatedResponse);
    } catch (validationError) {
      console.error('Response validation failed:', validationError);
      // Return data anyway but log the validation error
      return NextResponse.json(data);
    }
  } catch (error) {
    console.error('Conversation flow analytics error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
