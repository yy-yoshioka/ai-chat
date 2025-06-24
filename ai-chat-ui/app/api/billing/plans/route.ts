import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { BillingPlans } from '@/app/_schemas/billing';
import { API_BASE_URL } from '@/app/_lib/config';

export const revalidate = 60; // ISR: 60 秒

export async function GET() {
  try {
    const cookieStore = await cookies();
    const jwt = cookieStore.get('session')?.value ?? '';

    const res = await fetch(`${API_BASE_URL}/billing/plans`, {
      headers: { Authorization: `Bearer ${jwt}` },
      cache: 'no-store',
    });

    if (!res.ok) {
      return NextResponse.json({ message: 'Upstream error' }, { status: res.status });
    }

    const raw = await res.json();
    const data = BillingPlans.parse(raw); // Zod validation
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to fetch billing plans:', error);
    return NextResponse.json({ message: 'Failed to fetch billing plans' }, { status: 500 });
  }
}
