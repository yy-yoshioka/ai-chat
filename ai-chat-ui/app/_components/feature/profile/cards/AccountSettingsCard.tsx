'use client';

import React from 'react';
import Link from 'next/link';
import { ProfileIcons } from '@/app/_config/profile/icons';
import { PROFILE_ROUTES } from '@/app/_config/profile/constants';

interface AccountSettingsCardProps {
  onLogout: () => void;
}

export function AccountSettingsCard({ onLogout }: AccountSettingsCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">アカウント設定</h2>

      <div className="space-y-3">
        <Link
          href={PROFILE_ROUTES.SETTINGS}
          className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center space-x-3">
            {ProfileIcons.settings}
            <span className="text-gray-700">プロフィール設定</span>
          </div>
          <svg
            className="h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>

        <button
          onClick={onLogout}
          className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-red-50 transition-colors text-red-600"
        >
          <div className="flex items-center space-x-3">
            {ProfileIcons.logout}
            <span>ログアウト</span>
          </div>
        </button>

        <div className="pt-4 border-t border-gray-200">
          <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors text-gray-500">
            <div className="flex items-center space-x-3">
              {ProfileIcons.trash}
              <span>アカウントを削除</span>
            </div>
          </button>
          <p className="text-xs text-gray-500 mt-2 px-3">
            アカウントを削除すると、すべてのデータが失われます。この操作は取り消せません。
          </p>
        </div>
      </div>
    </div>
  );
}
