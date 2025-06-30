import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { EXPRESS_API } from '@/app/_config/api';

// DELETE /api/bff/knowledge-base/items/[id] - Delete knowledge base item
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const cookieStore = cookies();
  const token = cookieStore.get('token');

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const response = await fetch(`${EXPRESS_API}/api/knowledge-base/items/${params.id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token.value}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Knowledge base item delete error:', error);
    return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 });
  }
}
