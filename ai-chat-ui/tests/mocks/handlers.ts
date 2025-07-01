import { http, HttpResponse } from 'msw';

const EXPRESS_API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const handlers = [
  // Dashboard endpoints
  http.get(`${EXPRESS_API}/api/dashboard`, () => {
    return HttpResponse.json({
      totalChats: 1234,
      activeUsers: 56,
      avgResponseTime: 2.5,
      errorRate: 0.02,
      timestamp: new Date().toISOString(),
    });
  }),

  // Users endpoints
  http.get(`${EXPRESS_API}/api/users`, ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');

    return HttpResponse.json({
      users: [
        {
          id: '1',
          email: 'admin@example.com',
          name: 'Admin User',
          roles: ['owner'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          email: 'user@example.com',
          name: 'Regular User',
          roles: ['viewer'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      total: 2,
      page,
      totalPages: 1,
    });
  }),

  http.put(`${EXPRESS_API}/api/users/:id`, async ({ params, request }) => {
    const body = await request.json();
    return HttpResponse.json({
      id: params.id,
      ...body,
      updatedAt: new Date().toISOString(),
    });
  }),

  http.delete(`${EXPRESS_API}/api/users/:id`, () => {
    return HttpResponse.json({ message: 'User deleted successfully' });
  }),

  http.post(`${EXPRESS_API}/api/users/invite`, () => {
    return HttpResponse.json({ message: 'Invitation sent successfully' });
  }),

  // Organizations endpoints
  http.get(`${EXPRESS_API}/api/organizations`, () => {
    return HttpResponse.json({
      id: 'org-1',
      name: 'Test Organization',
      slug: 'test-org',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      plan: 'pro',
      userCount: 10,
      widgetCount: 5,
    });
  }),

  http.get(`${EXPRESS_API}/api/organizations/stats`, () => {
    return HttpResponse.json({
      totalUsers: 10,
      activeUsers: 8,
      totalWidgets: 5,
      totalChats: 150,
      totalFaqs: 25,
      storageUsed: 1.5,
      apiCallsToday: 200,
      lastActivityAt: new Date().toISOString(),
    });
  }),

  http.put(`${EXPRESS_API}/api/organizations`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      id: 'org-1',
      name: body.name || 'Test Organization',
      slug: 'test-org',
      updatedAt: new Date().toISOString(),
      plan: 'pro',
      userCount: 10,
      widgetCount: 5,
    });
  }),

  // Reports endpoints
  http.get(`${EXPRESS_API}/api/reports/summary`, () => {
    return HttpResponse.json({
      totalChats: 100,
      uniqueUsers: 25,
      totalTokens: 5000,
      avgTokensPerChat: 50,
      topQuestions: [
        { question: 'How do I reset my password?', count: 15 },
        { question: 'What are your business hours?', count: 10 },
        { question: 'How can I contact support?', count: 8 },
      ],
    });
  }),

  http.get(`${EXPRESS_API}/api/reports/chart`, () => {
    return HttpResponse.json({
      data: [
        { date: '2024-01-01', count: 10, tokens: 500 },
        { date: '2024-01-02', count: 15, tokens: 750 },
        { date: '2024-01-03', count: 12, tokens: 600 },
      ],
    });
  }),

  http.get(`${EXPRESS_API}/api/reports/csv`, () => {
    const csv = `Date,User,Question,Answer,Tokens
2024-01-01,user@example.com,How do I reset my password?,Visit the settings page,15
2024-01-02,admin@example.com,What are your hours?,9 AM to 5 PM,12`;

    return new HttpResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="chat-report.csv"',
      },
    });
  }),

  // Auth endpoints
  http.post('/api/bff/auth/login', async ({ request }) => {
    const body = await request.json();
    if (body.email === 'test@example.com' && body.password === 'password123') {
      return HttpResponse.json({
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          roles: ['org_admin'],
        },
      });
    }
    return HttpResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }),

  http.post('/api/bff/auth/logout', () => {
    return HttpResponse.json({ message: 'Logged out successfully' });
  }),

  http.get('/api/bff/auth/me', () => {
    return HttpResponse.json({
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      roles: ['org_admin'],
      organizationId: 'org-1',
    });
  }),
];
