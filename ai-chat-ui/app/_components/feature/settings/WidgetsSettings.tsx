import React from 'react';
import Link from 'next/link';

interface WidgetsSettingsProps {
  orgId: string;
}

export function WidgetsSettings({ orgId }: WidgetsSettingsProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">ウィジェット設定</h3>
          <Link
            href={`/admin/${orgId}/widgets`}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            ウィジェット管理へ
          </Link>
        </div>
        <p className="text-gray-600">
          チャットウィジェットの作成・編集・管理は専用のウィジェット管理ページで行えます。
        </p>
      </div>
    </div>
  );
}
