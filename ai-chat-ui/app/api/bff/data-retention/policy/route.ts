import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '../../../../_utils/auth-utils';

const API_URL = process.env.API_URL || 'http://localhost:8000';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const response = await fetch(`${API_URL}/api/data-retention/policy`, {
      headers: {
        Authorization: `Bearer ${session.token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(error, { status: response.status });
    }

    const policy = await response.json();
    return NextResponse.json(policy);
  } catch (error) {
    console.error('Failed to fetch policy:', error);
    return NextResponse.json({ error: 'Failed to fetch policy' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const response = await fetch(`${API_URL}/api/data-retention/policy`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${session.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(error, { status: response.status });
    }

    const policy = await response.json();
    return NextResponse.json(policy);
  } catch (error) {
    console.error('Failed to update policy:', error);
    return NextResponse.json({ error: 'Failed to update policy' }, { status: 500 });
  }
}
