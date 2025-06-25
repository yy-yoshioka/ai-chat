'use client';

import { useAuth } from '../../_hooks/auth/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Organization {
  id: string;
  name: string;
  role: string;
  lastAccessed?: string;
}

export default function OrgSelectorPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loadingOrgs, setLoadingOrgs] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      // Mock organizations - replace with actual API call
      setOrganizations([
        {
          id: 'org-demo',
          name: 'デモ株式会社',
          role: 'admin',
          lastAccessed: new Date().toISOString(),
        },
        {
          id: 'org-example',
          name: 'サンプル企業',
          role: 'member',
          lastAccessed: new Date(Date.now() - 86400000).toISOString(),
        },
      ]);
      setLoadingOrgs(false);
    }
  }, [user, loading, router]);

  const handleOrgSelect = (orgId: string) => {
    router.push(`/admin/${orgId}/dashboard`);
  };

  if (loading || loadingOrgs) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">組織を選択</h1>
          <p className="text-gray-600">アクセスする組織を選択してください</p>
        </div>

        <div className="space-y-4">
          {organizations.map((org) => (
            <div
              key={org.id}
              onClick={() => handleOrgSelect(org.id)}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md hover:border-blue-300 cursor-pointer transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 mb-1">{org.name}</h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span className="capitalize">
                      {org.role === 'admin' ? '管理者' : 'メンバー'}
                    </span>
                    {org.lastAccessed && (
                      <span>
                        最終アクセス: {new Date(org.lastAccessed).toLocaleDateString('ja-JP')}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-blue-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm mb-4">
            組織が見つからない場合は、管理者にお問い合わせください。
          </p>
          <Link href="/profile" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            プロフィール設定
          </Link>
        </div>
      </div>
    </div>
  );
}
