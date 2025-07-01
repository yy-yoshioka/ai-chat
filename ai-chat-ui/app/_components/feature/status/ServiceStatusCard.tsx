'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, AlertTriangle, XCircle, HelpCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ServiceStatusCardProps {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
  message?: string;
  responseTime?: number;
}

export function ServiceStatusCard({
  service,
  status,
  message,
  responseTime,
}: ServiceStatusCardProps) {
  return (
    <Card className={`border-l-4 ${getBorderColor(status)}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium capitalize">
            {formatServiceName(service)}
          </CardTitle>
          {getStatusIcon(status)}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-2">
          <Badge variant={getStatusVariant(status)} className="capitalize">
            {status}
          </Badge>
          {responseTime && <span className="text-xs text-muted-foreground">{responseTime}ms</span>}
        </div>
        {message && <p className="text-xs text-muted-foreground">{message}</p>}
      </CardContent>
    </Card>
  );
}

function formatServiceName(service: string): string {
  return service
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function getBorderColor(status: string): string {
  switch (status) {
    case 'healthy':
      return 'border-l-green-500';
    case 'degraded':
      return 'border-l-yellow-500';
    case 'unhealthy':
      return 'border-l-red-500';
    default:
      return 'border-l-gray-500';
  }
}

function getStatusIcon(status: string) {
  const className = 'h-5 w-5';
  switch (status) {
    case 'healthy':
      return <CheckCircle className={`${className} text-green-500`} />;
    case 'degraded':
      return <AlertTriangle className={`${className} text-yellow-500`} />;
    case 'unhealthy':
      return <XCircle className={`${className} text-red-500`} />;
    default:
      return <HelpCircle className={`${className} text-gray-500`} />;
  }
}

function getStatusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'healthy':
      return 'default';
    case 'degraded':
      return 'secondary';
    case 'unhealthy':
      return 'destructive';
    default:
      return 'outline';
  }
}
