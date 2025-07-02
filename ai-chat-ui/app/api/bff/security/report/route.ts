import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '../../../../_utils/auth-utils';

const API_URL = process.env.API_URL || 'http://localhost:8000';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!startDate || !endDate) {
      return NextResponse.json({ error: 'Start date and end date are required' }, { status: 400 });
    }

    const response = await fetch(
      `${API_URL}/api/security/report?startDate=${startDate}&endDate=${endDate}`,
      {
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

    const report = await response.json();
    return NextResponse.json(report);
  } catch (error) {
    console.error('Failed to fetch security report:', error);
    return NextResponse.json({ error: 'Failed to fetch security report' }, { status: 500 });
  }
}
