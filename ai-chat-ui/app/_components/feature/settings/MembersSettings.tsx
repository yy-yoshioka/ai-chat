import React from 'react';
import Link from 'next/link';

interface MembersSettingsProps {
  orgId: string;
}

export function MembersSettings({ orgId }: MembersSettingsProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">メンバー管理</h3>
          <Link
            href={`/admin/${orgId}/users`}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            ユーザー管理へ
          </Link>
        </div>
        <p className="text-gray-600">詳細なメンバー管理は専用のユーザー管理ページで行えます。</p>
      </div>
    </div>
  );
}