import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { EXPRESS_API } from '@/app/_config/api';

export async function POST(request: NextRequest) {
  const cookieStore = cookies();
  const token = cookieStore.get('token');

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();

    const response = await fetch(`${EXPRESS_API}/api/knowledge-base/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Knowledge base upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
