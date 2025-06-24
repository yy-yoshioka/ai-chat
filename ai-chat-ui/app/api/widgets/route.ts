import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/app/_lib/config';

export async function GET(req: NextRequest) {
  try {
    // Get cookies from the request and forward them
    const cookies = req.headers.get('cookie') || '';
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get('companyId');

    const apiUrl = `${API_BASE_URL}/api/widgets${companyId ? `?companyId=${companyId}` : ''}`;

    const response = await fetch(apiUrl, {
      method: 'GET',
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
    console.error('Widgets API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // Get cookies from the request and forward them
    const cookies = req.headers.get('cookie') || '';
    const body = await req.json();

    const apiUrl = `${API_BASE_URL}/api/widgets`;

    const response = await fetch(apiUrl, {
      method: 'POST',
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
    console.error('Widgets API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
