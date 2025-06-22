'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Organization {
  id: string;
  name: string;
  plan: string;
  memberCount: number;
  isOwner: boolean;
  trialEndDate?: string;
}

export default function OrgSelectorPage() {
  const router = useRouter();
  const [organizations] = useState<Organization[]>([
    {
      id: 'default',
      name: 'Default Organization',
      plan: 'Pro',
      memberCount: 5,
      isOwner: true,
      trialEndDate: '2024-02-01',
    },
    {
      id: 'acme-corp',
      name: 'Acme Corporation',
      plan: 'Enterprise',
      memberCount: 25,
      isOwner: false,
    },
    {
      id: 'startup-inc',
      name: 'Startup Inc.',
      plan: 'Free',
      memberCount: 3,
      isOwner: true,
    },
  ]);

  const selectOrganization = (orgId: string) => {
    // Store selected org in localStorage for persistence
    localStorage.setItem('selectedOrgId', orgId);

    // Navigate to the dashboard of the selected organization
    router.push(`/admin/${orgId}/dashboard`);
  };

  const getPlanBadgeColor = (plan: string) => {
    switch (plan.toLowerCase()) {
      case 'free':
        return 'bg-gray-100 text-gray-800';
      case 'pro':
        return 'bg-blue-100 text-blue-800';
      case 'enterprise':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-2xl w-full mx-auto p-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">組織を選択</h1>
          <p className="text-gray-600">管理したい組織を選択してください</p>
        </div>

        <div className="space-y-4">
          {organizations.map((org) => (
            <div
              key={org.id}
              onClick={() => selectOrganization(org.id)}
              className="bg-white rounded-lg shadow-sm border-2 border-gray-200 hover:border-blue-300 p-6 cursor-pointer transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{org.name}</h3>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getPlanBadgeColor(org.plan)}`}
                    >
                      {org.plan}
                    </span>
                    {org.isOwner && (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        オーナー
                      </span>
                    )}
                  </div>

                  <div className="flex items-center text-sm text-gray-600 space-x-4">
                    <span>👥 {org.memberCount} メンバー</span>
                    {org.trialEndDate && (
                      <span className="text-orange-600">
                        ⏰ トライアル終了: {new Date(org.trialEndDate).toLocaleDateString('ja-JP')}
                      </span>
                    )}
                  </div>
                </div>

                <div className="ml-4">
                  <svg
                    className="w-6 h-6 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
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
          <Link href="/" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            ← メインサイトに戻る
          </Link>
        </div>

        <div className="mt-6 text-center">
          <button className="text-gray-600 hover:text-gray-800 text-sm">新しい組織を作成</button>
        </div>
      </div>
    </div>
  );
}
