import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '../../../../../../_utils/auth-utils';

const API_URL = process.env.API_URL || 'http://localhost:8000';

export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const response = await fetch(`${API_URL}/api/security/users/${params.userId}/permissions`, {
      headers: {
        Authorization: `Bearer ${session.token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(error, { status: response.status });
    }

    const permissions = await response.json();
    return NextResponse.json(permissions);
  } catch (error) {
    console.error('Failed to fetch permissions:', error);
    return NextResponse.json({ error: 'Failed to fetch permissions' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const response = await fetch(`${API_URL}/api/security/users/${params.userId}/permissions`, {
      method: 'POST',
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

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to grant permission:', error);
    return NextResponse.json({ error: 'Failed to grant permission' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const permission = searchParams.get('permission');

    if (!permission) {
      return NextResponse.json({ error: 'Permission parameter required' }, { status: 400 });
    }

    const response = await fetch(
      `${API_URL}/api/security/users/${params.userId}/permissions/${permission}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session.token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(error, { status: response.status });
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to revoke permission:', error);
    return NextResponse.json({ error: 'Failed to revoke permission' }, { status: 500 });
  }
}
