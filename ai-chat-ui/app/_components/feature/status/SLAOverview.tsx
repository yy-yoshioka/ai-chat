'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Clock, Calendar } from 'lucide-react';

interface SLAOverviewProps {
  sla: {
    uptime: number;
    avgResponseTime: number;
    period: string;
  };
}

export function SLAOverview({ sla }: SLAOverviewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Uptime
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{sla.uptime.toFixed(2)}%</div>
          <p className="text-xs text-muted-foreground mt-1">{getUptimeStatus(sla.uptime)}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Avg Response Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{sla.avgResponseTime}ms</div>
          <p className="text-xs text-muted-foreground mt-1">
            {getResponseTimeStatus(sla.avgResponseTime)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Measurement Period
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{sla.period}</div>
          <p className="text-xs text-muted-foreground mt-1">Rolling average</p>
        </CardContent>
      </Card>
    </div>
  );
}

function getUptimeStatus(uptime: number): string {
  if (uptime >= 99.9) return 'Excellent';
  if (uptime >= 99.5) return 'Good';
  if (uptime >= 99) return 'Fair';
  return 'Needs improvement';
}

function getResponseTimeStatus(responseTime: number): string {
  if (responseTime < 100) return 'Excellent';
  if (responseTime < 300) return 'Good';
  if (responseTime < 1000) return 'Fair';
  return 'Slow';
}
