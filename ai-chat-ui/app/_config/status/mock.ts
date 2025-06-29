import { Incident, SystemStatus, UptimeStat } from '@/app/_hooks/status/useStatus';

export let MOCK_SYSTEM: SystemStatus[] = [];
export let MOCK_INCIDENT: Incident[] = [];
export let MOCK_UPTIME: UptimeStat[] = [];

if (process.env.NODE_ENV !== 'production') {
  const now = new Date().toISOString();
  MOCK_SYSTEM = [
    {
      component: 'AI Chat API',
      status: 'operational',
      description: 'All endpoints healthy',
      lastUpdated: now,
    },
    {
      component: 'Chat Widget',
      status: 'operational',
      description: 'Widgets rendering normally',
      lastUpdated: now,
    },
    {
      component: 'Database',
      status: 'operational',
      description: 'Query latency nominal',
      lastUpdated: now,
    },
    {
      component: 'Authentication',
      status: 'operational',
      description: 'Login & SSO OK',
      lastUpdated: now,
    },
  ];

  MOCK_INCIDENT = [
    {
      id: '1',
      title: 'API Response Time Degradation',
      status: 'resolved',
      impact: 'minor',
      description: 'Slower responses observed.',
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-15T11:45:00Z',
      updates: [
        { timestamp: '2024-01-15T11:45:00Z', status: 'resolved', message: 'Issue mitigated.' },
        { timestamp: '2024-01-15T11:00:00Z', status: 'monitoring', message: 'Monitoring.' },
        { timestamp: '2024-01-15T10:30:00Z', status: 'investigating', message: 'Investigating.' },
      ],
    },
  ];

  MOCK_UPTIME = [
    { period: '90 days', percentage: 99.95 },
    { period: '30 days', percentage: 99.98 },
    { period: '7 days', percentage: 100.0 },
  ];
}
