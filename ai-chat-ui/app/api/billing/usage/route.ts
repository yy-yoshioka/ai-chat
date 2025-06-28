import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { UsageData } from '@/app/_schemas/billing';
import { API_BASE_URL } from '@/app/_config';

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const jwt = cookieStore.get('session')?.value ?? '';

    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get('orgId');

    if (!orgId) {
      return NextResponse.json({ message: 'Missing orgId parameter' }, { status: 400 });
    }

    const res = await fetch(`${API_BASE_URL}/billing/usage?orgId=${orgId}`, {
      headers: { Authorization: `Bearer ${jwt}` },
      cache: 'no-store',
    });

    if (!res.ok) {
      return NextResponse.json({ message: 'Upstream error' }, { status: res.status });
    }

    const raw = await res.json();
    const data = UsageData.parse(raw); // Zod validation
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to fetch usage data:', error);
    return NextResponse.json({ message: 'Failed to fetch usage data' }, { status: 500 });
  }
}
