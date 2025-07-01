'use client';

import { useState } from 'react';
import { useOrganizations } from '@/app/_hooks/useOrganizations';
import { useOrganizationStats } from '@/app/_hooks/useOrganizationStats';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/app/_components/ui/card';
import { Button } from '@/app/_components/ui/button';
import { Skeleton } from '@/app/_components/ui/skeleton';
import { Badge } from '@/app/_components/ui/badge';
import { Building2, Users, Package, Settings, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

export default function OrganizationsPage() {
  const { organizations, loading, error, refetch } = useOrganizations();
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="container mx-auto py-8 space-y-4">
        <h1 className="text-3xl font-bold mb-6">Organizations</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Organizations</h1>
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-destructive mb-4">Failed to load organizations</p>
            <Button onClick={refetch}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Organizations</h1>
      </div>

      {organizations.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <Building2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No organizations found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {organizations.map((org) => (
            <Card key={org.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      {org.name}
                    </CardTitle>
                    <CardDescription>
                      Created {formatDistanceToNow(new Date(org.createdAt), { addSuffix: true })}
                    </CardDescription>
                  </div>
                  <Badge
                    variant={
                      org.plan === 'enterprise'
                        ? 'default'
                        : org.plan === 'pro'
                          ? 'secondary'
                          : 'outline'
                    }
                  >
                    {org.plan}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{org.userCount} users</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span>{org.widgetCount} widgets</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      className="flex-1"
                      onClick={() => setSelectedOrgId(org.id)}
                    >
                      <TrendingUp className="h-4 w-4 mr-1" />
                      View Stats
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/settings?org=${org.id}`}>
                        <Settings className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedOrgId && (
        <OrganizationStatsModal
          organizationId={selectedOrgId}
          onClose={() => setSelectedOrgId(null)}
        />
      )}
    </div>
  );
}

// Stats modal component
function OrganizationStatsModal({
  organizationId,
  onClose,
}: {
  organizationId: string;
  onClose: () => void;
}) {
  const { stats, loading, error } = useOrganizationStats(organizationId);

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <Card className="max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
        <CardHeader>
          <CardTitle>Organization Statistics</CardTitle>
          <CardDescription>Detailed metrics and usage data</CardDescription>
        </CardHeader>
        <CardContent>
          {loading && <Skeleton className="h-40 w-full" />}
          {error && <p className="text-destructive">Failed to load statistics</p>}
          {stats && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <p className="text-sm font-medium">Users</p>
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
                <p className="text-sm text-muted-foreground">{stats.activeUsers} active</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Widgets</p>
                <p className="text-2xl font-bold">{stats.totalWidgets}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Total Chats</p>
                <p className="text-2xl font-bold">{stats.totalChats}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">FAQs</p>
                <p className="text-2xl font-bold">{stats.totalFaqs}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Storage Used</p>
                <p className="text-2xl font-bold">
                  {(stats.storageUsed / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">API Calls Today</p>
                <p className="text-2xl font-bold">{stats.apiCallsToday}</p>
              </div>
            </div>
          )}
          <div className="mt-6 flex justify-end">
            <Button onClick={onClose}>Close</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

