import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/app/_lib/config';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ widgetKey: string }> }
) {
  try {
    const { widgetKey } = await params;
    const body = await req.json();

    if (!widgetKey || typeof widgetKey !== 'string') {
      return NextResponse.json({ error: 'Widget key is required' }, { status: 400 });
    }

    if (!body?.message || typeof body.message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const apiUrl = `${API_BASE_URL}/api/chat/widget/${widgetKey}`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: body.message }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Widget chat API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
