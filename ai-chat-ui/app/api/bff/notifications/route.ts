import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { EXPRESS_API } from '@/app/_config/api';
import {
  notificationQuerySchema,
  notificationsResponseSchema,
  createNotificationSchema,
  bulkNotificationOperationSchema,
  type NotificationQuery,
  type NotificationsResponse,
  type CreateNotification,
  type BulkNotificationOperation,
} from '@/app/_schemas/notifications';
import {
  validateQueryParams,
  validateRequest,
  validateResponse,
  createValidationErrorResponse,
} from '@/app/_utils/validation';

// GET /api/bff/notifications - Get notifications list
export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const authToken = cookieStore.get('auth-token')?.value;

  if (!authToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);

    // Validate query parameters
    const validation = validateQueryParams(notificationQuerySchema, searchParams);
    if (!validation.success) {
      return createValidationErrorResponse(validation.error);
    }

    const validatedParams: NotificationQuery = validation.data;

    // Build query string from validated parameters
    const queryParams = new URLSearchParams();
    if (validatedParams.status) queryParams.append('status', validatedParams.status);
    if (validatedParams.type) queryParams.append('type', validatedParams.type);
    if (validatedParams.priority) queryParams.append('priority', validatedParams.priority);
    if (validatedParams.widgetId) queryParams.append('widgetId', validatedParams.widgetId);
    if (validatedParams.startDate) queryParams.append('startDate', validatedParams.startDate);
    if (validatedParams.endDate) queryParams.append('endDate', validatedParams.endDate);
    queryParams.append('page', validatedParams.page.toString());
    queryParams.append('limit', validatedParams.limit.toString());
    queryParams.append('sortBy', validatedParams.sortBy);
    queryParams.append('sortOrder', validatedParams.sortOrder);

    const response = await fetch(`${EXPRESS_API}/api/notifications?${queryParams}`, {
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
      const validatedResponse: NotificationsResponse = validateResponse(
        notificationsResponseSchema,
        data
      );
      return NextResponse.json(validatedResponse);
    } catch (validationError) {
      console.error('Response validation failed:', validationError);
      // Return data anyway but log the validation error
      return NextResponse.json(data);
    }
  } catch (error) {
    console.error('Notifications fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

// POST /api/bff/notifications - Create notification
export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const authToken = cookieStore.get('auth-token')?.value;

  if (!authToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();

    // Validate request body
    const validation = validateRequest(createNotificationSchema, body);
    if (!validation.success) {
      return createValidationErrorResponse(validation.error);
    }

    const validatedData: CreateNotification = validation.data;

    const response = await fetch(`${EXPRESS_API}/api/notifications`, {
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
    return NextResponse.json(data);
  } catch (error) {
    console.error('Notification creation error:', error);
    return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 });
  }
}

// PUT /api/bff/notifications/bulk - Bulk operations
export async function PUT(request: NextRequest) {
  const cookieStore = await cookies();
  const authToken = cookieStore.get('auth-token')?.value;

  if (!authToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();

    // Validate request body
    const validation = validateRequest(bulkNotificationOperationSchema, body);
    if (!validation.success) {
      return createValidationErrorResponse(validation.error);
    }

    const validatedData: BulkNotificationOperation = validation.data;

    const response = await fetch(`${EXPRESS_API}/api/notifications/bulk`, {
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
    return NextResponse.json(data);
  } catch (error) {
    console.error('Bulk notification operation error:', error);
    return NextResponse.json({ error: 'Failed to perform bulk operation' }, { status: 500 });
  }
}
