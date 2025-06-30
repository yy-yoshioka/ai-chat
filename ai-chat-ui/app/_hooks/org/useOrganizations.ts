'use client';

import { useEffect, useState } from 'react';
import { MOCK_ORGANIZATIONS } from '@/app/_mocks/organization';
import { fetchGet } from '@/app/_utils/fetcher';

interface Organization {
  id: string;
  name: string;
}

export const useOrganizations = () => {
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrgs = async () => {
      try {
        // ─── 本番用 API ───────────────────────────────
        if (process.env.NEXT_PUBLIC_USE_MOCKS !== 'true') {
          try {
            const data = await fetchGet<Organization[]>('/api/organizations');
            setOrgs(data);
            return;
          } catch {
            // API 失敗時はモックにフォールバック
          }
        }
        // ─── 開発 or API 失敗 → モック ────────────────
        setOrgs(MOCK_ORGANIZATIONS as unknown as Organization[]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrgs();
  }, []);

  return { orgs, loading };
};
