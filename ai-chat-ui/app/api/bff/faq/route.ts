import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';

const EXPRESS_API = process.env.EXPRESS_API || 'http://localhost:8000';

const CreateFAQSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
  category: z.string().optional(),
  organizationId: z.string().optional(),
});

// GET /api/bff/faq - Get FAQs
export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth-token')?.value;

    if (!authToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const queryString = searchParams.toString();

    const response = await fetch(
      `${EXPRESS_API}/api/faqs${queryString ? `?${queryString}` : ''}`,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch FAQs' },
        { status: response.status }
      );
    }

    const faqs = await response.json();
    return NextResponse.json({ faqs });
  } catch (error) {
    console.error('BFF FAQ GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/bff/faq - Create FAQ
export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth-token')?.value;

    if (!authToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    
    // Validate request
    const parsed = CreateFAQSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      );
    }

    const response = await fetch(`${EXPRESS_API}/api/faqs`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(parsed.data),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to create FAQ' },
        { status: response.status }
      );
    }

    const faq = await response.json();
    return NextResponse.json(faq);
  } catch (error) {
    console.error('BFF FAQ POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}