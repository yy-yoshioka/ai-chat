'use client';

import React, { useState, useEffect } from 'react';

interface SystemStatus {
  component: string;
  status: 'operational' | 'degraded' | 'partial_outage' | 'major_outage';
  description: string;
  lastUpdated: string;
}

interface Incident {
  id: string;
  title: string;
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
  impact: 'minor' | 'major' | 'critical';
  description: string;
  createdAt: string;
  updatedAt: string;
  updates: {
    timestamp: string;
    status: string;
    message: string;
  }[];
}

const StatusPage: React.FC = () => {
  const [systemStatus, setSystemStatus] = useState<SystemStatus[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [uptime, setUptime] = useState<{ period: string; percentage: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatusData();

    // Refresh every 30 seconds
    const interval = setInterval(fetchStatusData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchStatusData = async () => {
    try {
      // Mock data - in production, this would fetch from your monitoring API
      setSystemStatus([
        {
          component: 'AI Chat API',
          status: 'operational',
          description: 'All API endpoints are functioning normally',
          lastUpdated: new Date().toISOString(),
        },
        {
          component: 'Chat Widget',
          status: 'operational',
          description: 'Chat widgets are loading and responding normally',
          lastUpdated: new Date().toISOString(),
        },
        {
          component: 'Database',
          status: 'operational',
          description: 'Database queries are executing within normal parameters',
          lastUpdated: new Date().toISOString(),
        },
        {
          component: 'Authentication',
          status: 'operational',
          description: 'User login and registration are working normally',
          lastUpdated: new Date().toISOString(),
        },
        {
          component: 'Payment Processing',
          status: 'operational',
          description: 'Stripe payment processing is functioning normally',
          lastUpdated: new Date().toISOString(),
        },
      ]);

      setIncidents([
        {
          id: '1',
          title: 'API Response Time Degradation',
          status: 'resolved',
          impact: 'minor',
          description: 'Some users experienced slower response times from the AI Chat API.',
          createdAt: '2024-01-15T10:30:00Z',
          updatedAt: '2024-01-15T11:45:00Z',
          updates: [
            {
              timestamp: '2024-01-15T11:45:00Z',
              status: 'resolved',
              message: 'The issue has been resolved. API response times have returned to normal.',
            },
            {
              timestamp: '2024-01-15T11:00:00Z',
              status: 'monitoring',
              message: 'We have identified the cause and are monitoring the system closely.',
            },
            {
              timestamp: '2024-01-15T10:30:00Z',
              status: 'investigating',
              message: 'We are investigating reports of slower API response times.',
            },
          ],
        },
      ]);

      setUptime([
        { period: '90 days', percentage: 99.95 },
        { period: '30 days', percentage: 99.98 },
        { period: '7 days', percentage: 100.0 },
      ]);
    } catch (error) {
      console.error('Failed to fetch status data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: SystemStatus['status']) => {
    switch (status) {
      case 'operational':
        return 'bg-green-500';
      case 'degraded':
        return 'bg-yellow-500';
      case 'partial_outage':
        return 'bg-orange-500';
      case 'major_outage':
        return 'bg-red-500';
    }
  };

  const getStatusTextColor = (status: SystemStatus['status']) => {
    switch (status) {
      case 'operational':
        return 'text-green-700';
      case 'degraded':
        return 'text-yellow-700';
      case 'partial_outage':
        return 'text-orange-700';
      case 'major_outage':
        return 'text-red-700';
    }
  };

  const getIncidentColor = (impact: Incident['impact']) => {
    switch (impact) {
      case 'minor':
        return 'border-yellow-400';
      case 'major':
        return 'border-orange-400';
      case 'critical':
        return 'border-red-400';
    }
  };

  const overallStatus = systemStatus.every((s) => s.status === 'operational')
    ? 'All Systems Operational'
    : 'Some Systems Experiencing Issues';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">System Status</h1>
              <p className="text-gray-600 mt-1">Current system status and incident history</p>
            </div>
            <div className="text-right">
              <div
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  overallStatus === 'All Systems Operational'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-orange-100 text-orange-800'
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full mr-2 ${
                    overallStatus === 'All Systems Operational' ? 'bg-green-500' : 'bg-orange-500'
                  }`}
                ></div>
                {overallStatus}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Last updated: {new Date().toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Current Status */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold">Current Status</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {systemStatus.map((system, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center">
                    <div
                      className={`w-3 h-3 rounded-full mr-3 ${getStatusColor(system.status)}`}
                    ></div>
                    <div>
                      <h3 className="font-medium">{system.component}</h3>
                      <p className="text-sm text-gray-600">{system.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-sm font-medium capitalize ${getStatusTextColor(system.status)}`}
                    >
                      {system.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Uptime Statistics */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold">Uptime Statistics</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {uptime.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {stat.percentage.toFixed(2)}%
                  </div>
                  <div className="text-sm text-gray-600 mt-1">{stat.period} uptime</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Incidents */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b flex items-center justify-between">
            <h2 className="text-xl font-semibold">Recent Incidents</h2>
            <a
              href="/api/status/rss"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
              RSS Feed
            </a>
          </div>
          <div className="p-6">
            {incidents.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-green-600 mb-2">
                  <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900">No recent incidents</h3>
                <p className="text-gray-600">All systems have been running smoothly.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {incidents.map((incident) => (
                  <div
                    key={incident.id}
                    className={`border-l-4 ${getIncidentColor(incident.impact)} pl-4`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{incident.title}</h3>
                        <div className="flex items-center mt-1 space-x-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                              incident.status === 'resolved'
                                ? 'bg-green-100 text-green-800'
                                : incident.status === 'monitoring'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-orange-100 text-orange-800'
                            }`}
                          >
                            {incident.status}
                          </span>
                          <span className="text-sm text-gray-500">{incident.impact} impact</span>
                        </div>
                      </div>
                      <time className="text-sm text-gray-500">
                        {new Date(incident.createdAt).toLocaleDateString()}
                      </time>
                    </div>

                    <p className="text-gray-600 mt-2">{incident.description}</p>

                    <div className="mt-4 space-y-2">
                      {incident.updates.map((update, updateIndex) => (
                        <div key={updateIndex} className="text-sm">
                          <div className="flex items-center space-x-2">
                            <time className="text-gray-500">
                              {new Date(update.timestamp).toLocaleString()}
                            </time>
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${
                                update.status === 'resolved'
                                  ? 'bg-green-100 text-green-800'
                                  : update.status === 'monitoring'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-orange-100 text-orange-800'
                              }`}
                            >
                              {update.status}
                            </span>
                          </div>
                          <p className="text-gray-600 mt-1">{update.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>
            Having issues? Contact our support team at{' '}
            <a href="mailto:support@aichat.com" className="text-blue-600 hover:text-blue-800">
              support@aichat.com
            </a>
          </p>
          <p className="mt-2">
            Subscribe to our{' '}
            <a
              href="/api/status/rss"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800"
            >
              RSS feed
            </a>{' '}
            for real-time status updates.
          </p>
        </div>
      </div>
    </div>
  );
};

export default StatusPage;
