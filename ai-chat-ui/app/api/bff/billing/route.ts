import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { billingPlanSchema, UpdateBillingPlanSchema } from '@/app/_schemas/billing';
import { EXPRESS_API } from '@/app/_config/api';
import { z } from 'zod';

// GET /api/bff/billing - Get billing plans
export async function GET() {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth-token')?.value;

    if (!authToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const response = await fetch(`${EXPRESS_API}/api/billing/plans`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch billing plans: ${response.statusText}` },
        { status: response.status }
      );
    }

    const json = await response.json();

    // Validate response with Zod schema
    const parsed = z.array(billingPlanSchema).safeParse(json);
    if (!parsed.success) {
      console.error('Invalid billing plans response:', parsed.error);
      return NextResponse.json({ error: 'Invalid response format' }, { status: 500 });
    }

    return NextResponse.json(parsed.data);
  } catch (error) {
    console.error('BFF billing GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/bff/billing - Update billing plan
export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth-token')?.value;

    if (!authToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    // Validate request
    const parsed = UpdateBillingPlanSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }

    const response = await fetch(`${EXPRESS_API}/api/billing/subscribe`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(parsed.data),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to update billing plan: ${response.statusText}` },
        { status: response.status }
      );
    }

    const json = await response.json();
    return NextResponse.json(json);
  } catch (error) {
    console.error('BFF billing POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
