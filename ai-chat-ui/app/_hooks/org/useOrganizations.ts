'use client';

import { useEffect, useState } from 'react';
import { MOCK_ORGANIZATIONS } from '@/app/_mocks/organization';
import { fetcherWithAuth } from '@/app/_utils/fetcher';
import { Organization } from '@/app/_schemas/organizations';

export const useOrganizations = () => {
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchOrgs = async () => {
      try {
        setLoading(true);
        setError(null);
        // ─── 本番用 API ───────────────────────────────
        if (process.env.NEXT_PUBLIC_USE_MOCKS !== 'true') {
          try {
            const data = await fetcherWithAuth('/api/bff/organizations');
            setOrgs(data);
            return;
          } catch (err) {
            console.error('Failed to fetch organizations:', err);
            setError(err instanceof Error ? err : new Error('Failed to fetch organizations'));
            // API 失敗時はモックにフォールバック
          }
        }
        // ─── 開発 or API 失敗 → モック ────────────────
        setOrgs(
          MOCK_ORGANIZATIONS.map((org) => ({
            ...org,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            plan: 'free' as const,
            userCount: 5,
            widgetCount: 3,
          }))
        );
      } finally {
        setLoading(false);
      }
    };
    fetchOrgs();
  }, []);

  return { orgs, loading, error };
};
