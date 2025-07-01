'use client';

import { useStatus } from '@/app/_hooks/status/useStatus';
import { useIncidents } from '@/app/_hooks/status/useIncidents';
import { ServiceStatusCard } from './ServiceStatusCard';
import { SLAOverview } from './SLAOverview';
import { IncidentList } from './IncidentList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';

export function StatusDashboard() {
  const { status, sla, isLoading: statusLoading } = useStatus();
  const { incidents, isLoading: incidentsLoading } = useIncidents(7);

  if (statusLoading || incidentsLoading) {
    return <StatusDashboardSkeleton />;
  }

  // Calculate overall system status
  const overallStatus = calculateOverallStatus(status);
  const activeIncidents = incidents.filter(i => i.status !== 'resolved');

  return (
    <div className="space-y-6">
      {/* Overall Status Banner */}
      <div className={`p-4 rounded-lg ${getStatusColor(overallStatus)}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getStatusIcon(overallStatus)}
            <div>
              <h2 className="text-lg font-semibold">
                {getStatusMessage(overallStatus)}
              </h2>
              <p className="text-sm opacity-90">
                {activeIncidents.length > 0
                  ? `${activeIncidents.length} active incident${activeIncidents.length > 1 ? 's' : ''}`
                  : 'All systems operational'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SLA Overview */}
      {sla && <SLAOverview sla={sla} />}

      {/* Service Status Grid */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Service Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {status &&
            Object.entries(status).map(([service, serviceStatus]) => (
              <ServiceStatusCard
                key={service}
                service={service}
                status={serviceStatus.status}
                message={serviceStatus.message}
              />
            ))}
        </div>
      </div>

      {/* Active Incidents */}
      {activeIncidents.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Active Incidents</h3>
          <IncidentList incidents={activeIncidents} />
        </div>
      )}

      {/* Recent Resolved Incidents */}
      {incidents.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Incident History</h3>
          <IncidentList 
            incidents={incidents.filter(i => i.status === 'resolved').slice(0, 5)} 
            showResolved 
          />
        </div>
      )}
    </div>
  );
}

function StatusDashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-20 w-full" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    </div>
  );
}

function calculateOverallStatus(status: any): string {
  if (!status) return 'unknown';
  const statuses = Object.values(status).map((s: any) => s.status);
  if (statuses.some(s => s === 'unhealthy')) return 'unhealthy';
  if (statuses.some(s => s === 'degraded')) return 'degraded';
  return 'healthy';
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'healthy':
      return 'bg-green-100 text-green-800';
    case 'degraded':
      return 'bg-yellow-100 text-yellow-800';
    case 'unhealthy':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'healthy':
      return <CheckCircle className="h-6 w-6" />;
    case 'degraded':
      return <AlertTriangle className="h-6 w-6" />;
    case 'unhealthy':
      return <AlertCircle className="h-6 w-6" />;
    default:
      return <AlertCircle className="h-6 w-6" />;
  }
}

function getStatusMessage(status: string): string {
  switch (status) {
    case 'healthy':
      return 'All Systems Operational';
    case 'degraded':
      return 'Partial System Degradation';
    case 'unhealthy':
      return 'System Issues Detected';
    default:
      return 'Status Unknown';
  }
}