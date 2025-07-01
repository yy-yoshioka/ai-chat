'use client';

import { useState } from 'react';
import { StatusDashboard } from '@/app/_components/feature/status/StatusDashboard';
import { MetricsChart } from '@/app/_components/feature/status/MetricsChart';
import { CreateIncidentModal } from '@/app/_components/feature/status/CreateIncidentModal';
import { useMetrics, useHealthCheck } from '@/app/_hooks/status/useMetrics';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PageHeader } from '@/app/_components/common/PageHeader';
import { AlertCircle, Plus, RefreshCw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { subHours } from 'date-fns';

export default function SystemHealthPage() {
  const [timeRange, setTimeRange] = useState('1h');
  const [selectedService, setSelectedService] = useState<string>('all');
  const [incidentModalOpen, setIncidentModalOpen] = useState(false);

  // Calculate date range based on selection
  const endDate = new Date();
  const startDate = getStartDate(timeRange);

  const { 
    processedMetrics, 
    isLoading: metricsLoading, 
    refresh: refreshMetrics 
  } = useMetrics({
    startDate,
    endDate,
    service: selectedService === 'all' ? undefined : selectedService,
  });

  const { health, isHealthy } = useHealthCheck();

  const services = ['all', 'api', 'database', 'redis', 'vector_db', 'external_api'];

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Health"
        description="Monitor system performance, incidents, and service health"
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refreshMetrics()}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button
              size="sm"
              onClick={() => setIncidentModalOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Report Incident
            </Button>
          </div>
        }
      />

      {/* Health Warning */}
      {!isHealthy && health && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-sm text-red-800">
              System health check failed. Some services may be experiencing issues.
            </p>
          </div>
        </div>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <StatusDashboard />
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Metrics Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium mb-1 block">
                    Time Range
                  </label>
                  <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1h">Last 1 hour</SelectItem>
                      <SelectItem value="6h">Last 6 hours</SelectItem>
                      <SelectItem value="24h">Last 24 hours</SelectItem>
                      <SelectItem value="7d">Last 7 days</SelectItem>
                      <SelectItem value="30d">Last 30 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <label className="text-sm font-medium mb-1 block">
                    Service
                  </label>
                  <Select value={selectedService} onValueChange={setSelectedService}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map(service => (
                        <SelectItem key={service} value={service}>
                          {service === 'all' ? 'All Services' : formatServiceName(service)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Metrics Charts */}
          {metricsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-64" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {processedMetrics && Object.entries(processedMetrics).map(([key, data]) => (
                <MetricsChart
                  key={key}
                  title={`${formatServiceName(data.service)} - ${formatMetricType(data.metricType)}`}
                  metrics={data}
                  color={getMetricColor(data.metricType)}
                />
              ))}
            </div>
          )}

          {(!processedMetrics || Object.keys(processedMetrics).length === 0) && !metricsLoading && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No metrics data available for the selected time range
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              System logs integration coming soon
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <CreateIncidentModal
        open={incidentModalOpen}
        onOpenChange={setIncidentModalOpen}
      />
    </div>
  );
}

function getStartDate(timeRange: string): Date {
  const now = new Date();
  switch (timeRange) {
    case '1h':
      return subHours(now, 1);
    case '6h':
      return subHours(now, 6);
    case '24h':
      return subHours(now, 24);
    case '7d':
      return subHours(now, 24 * 7);
    case '30d':
      return subHours(now, 24 * 30);
    default:
      return subHours(now, 1);
  }
}

function formatServiceName(service: string): string {
  return service
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function formatMetricType(type: string): string {
  return type
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function getMetricColor(metricType: string): string {
  const colors: Record<string, string> = {
    response_time: '#3b82f6',
    memory: '#10b981',
    cpu: '#f59e0b',
    error_rate: '#ef4444',
    connection_count: '#8b5cf6',
  };
  return colors[metricType] || '#6b7280';
}