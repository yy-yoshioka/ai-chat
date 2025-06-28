'use client';

import { useEffect, useState } from 'react';
import { MOCK_INCIDENT, MOCK_SYSTEM, MOCK_UPTIME } from '@/app/_config/status/mock';

export interface SystemStatus {
  /* ← type alias でも可 */ component: string;
  status: 'operational' | 'degraded' | 'partial_outage' | 'major_outage';
  description: string;
  lastUpdated: string;
}
export interface Incident {
  id: string;
  title: string;
  status: 'investigating' | 'monitoring' | 'resolved' | 'identified';
  impact: 'minor' | 'major' | 'critical';
  description: string;
  createdAt: string;
  updatedAt: string;
  updates: Array<{
    timestamp: string;
    status: string;
    message: string;
  }>;
}
export interface UptimeStat {
  period: string;
  percentage: number;
}

export const useStatus = () => {
  const [system, setSystem] = useState<SystemStatus[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [uptime, setUptime] = useState<UptimeStat[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    // ▸ 本番: fetch('/api/status')
    setSystem(MOCK_SYSTEM);
    setIncidents(MOCK_INCIDENT);
    setUptime(MOCK_UPTIME);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    const t = setInterval(fetchData, 30_000);
    return () => clearInterval(t);
  }, []);

  return { system, incidents, uptime, loading };
};
