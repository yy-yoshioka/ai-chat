import { API_BASE_URL } from '@/app/_config';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ widgetKey: string }> }
) {
  try {
    const { widgetKey } = await params;

    if (!widgetKey || typeof widgetKey !== 'string') {
      return NextResponse.json({ error: 'Widget key is required' }, { status: 400 });
    }

    const apiUrl = `${API_BASE_URL}/api/widgets/${widgetKey}`;

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Widget API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ widgetKey: string }> }
) {
  try {
    const { widgetKey } = await params;
    const body = await req.json();

    if (!widgetKey || typeof widgetKey !== 'string') {
      return NextResponse.json({ error: 'Widget key is required' }, { status: 400 });
    }

    // Get cookies from the request and forward them for authenticated requests
    const cookies = req.headers.get('cookie') || '';

    const apiUrl = `${API_BASE_URL}/api/widgets/${widgetKey}`;

    const response = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookies,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Widget API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ widgetKey: string }> }
) {
  try {
    const { widgetKey } = await params;

    if (!widgetKey || typeof widgetKey !== 'string') {
      return NextResponse.json({ error: 'Widget key is required' }, { status: 400 });
    }

    // Get cookies from the request and forward them for authenticated requests
    const cookies = req.headers.get('cookie') || '';

    const apiUrl = `${API_BASE_URL}/api/widgets/${widgetKey}`;

    const response = await fetch(apiUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookies,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Widget API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
