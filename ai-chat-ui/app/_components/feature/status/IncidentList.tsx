'use client';

import { Incident } from '@/app/_schemas/system-health';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format, formatDistanceToNow } from 'date-fns';
import { AlertCircle, AlertTriangle, Info, Shield } from 'lucide-react';

interface IncidentListProps {
  incidents: Incident[];
}

export function IncidentList({ incidents }: IncidentListProps) {
  if (incidents.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No incidents to display
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {incidents.map((incident) => (
        <Card key={incident.id} className={`border-l-4 ${getSeverityBorder(incident.severity)}`}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                {getSeverityIcon(incident.severity)}
                <div>
                  <CardTitle className="text-base">{incident.title}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Started {formatDistanceToNow(new Date(incident.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Badge variant={getStatusVariant(incident.status)}>{incident.status}</Badge>
                <Badge variant="outline">{incident.severity}</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-3">{incident.description}</p>

            {incident.affectedServices.length > 0 && (
              <div className="mb-3">
                <span className="text-xs font-medium">Affected Services: </span>
                {incident.affectedServices.map((service) => (
                  <Badge key={service} variant="secondary" className="ml-1 text-xs">
                    {service}
                  </Badge>
                ))}
              </div>
            )}

            {incident.updates && incident.updates.length > 0 && (
              <div className="border-t pt-3 mt-3">
                <h4 className="text-sm font-medium mb-2">Recent Updates</h4>
                <div className="space-y-2">
                  {incident.updates.slice(0, 3).map((update, index) => (
                    <div key={update.id || index} className="text-xs">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Badge variant="outline" className="text-xs py-0">
                          {update.status}
                        </Badge>
                        <span>{format(new Date(update.createdAt), 'MMM d, HH:mm')}</span>
                      </div>
                      <p className="mt-1">{update.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {incident.resolvedAt && (
              <div className="text-xs text-muted-foreground mt-3">
                Resolved {formatDistanceToNow(new Date(incident.resolvedAt), { addSuffix: true })}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function getSeverityBorder(severity: string): string {
  switch (severity) {
    case 'critical':
      return 'border-l-red-600';
    case 'high':
      return 'border-l-orange-500';
    case 'medium':
      return 'border-l-yellow-500';
    case 'low':
      return 'border-l-blue-500';
    default:
      return 'border-l-gray-500';
  }
}

function getSeverityIcon(severity: string) {
  const className = 'h-5 w-5 flex-shrink-0';
  switch (severity) {
    case 'critical':
      return <AlertCircle className={`${className} text-red-600`} />;
    case 'high':
      return <AlertTriangle className={`${className} text-orange-500`} />;
    case 'medium':
      return <Info className={`${className} text-yellow-500`} />;
    case 'low':
      return <Shield className={`${className} text-blue-500`} />;
    default:
      return <Info className={`${className} text-gray-500`} />;
  }
}

function getStatusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'resolved':
      return 'default';
    case 'monitoring':
      return 'secondary';
    case 'investigating':
    case 'identified':
      return 'destructive';
    default:
      return 'outline';
  }
}
