import { API_BASE_URL } from '@/app/_config';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    // Get cookies from the request and forward them
    const cookies = req.headers.get('cookie') || '';

    const apiUrl = `${API_BASE_URL}/api/companies`;

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
    console.error('Companies API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
