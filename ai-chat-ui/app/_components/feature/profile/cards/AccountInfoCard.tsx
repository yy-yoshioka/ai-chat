'use client';

import React from 'react';
import { ProfileInfoField } from '../shared/ProfileInfoField';
import { ActivitySummaryGrid } from '../shared/ActivitySummaryGrid';
import { ProfileIcons } from '@/app/_config/profile/icons';
import { DATE_FORMAT_OPTIONS } from '@/app/_config/profile/constants';
import type { UserProfile } from '@/app/_schemas/profile';

interface AccountInfoCardProps {
  profile: UserProfile;
  daysActive: number;
}

export function AccountInfoCard({ profile, daysActive }: AccountInfoCardProps) {
  const joinDate = new Date(profile.createdAt);
  const formattedJoinDate = joinDate.toLocaleDateString('ja-JP', DATE_FORMAT_OPTIONS);

  const activities = [
    {
      label: '総メッセージ数',
      value: '1,234',
      icon: ProfileIcons.message,
      bgColor: 'bg-green-100',
    },
    {
      label: '総チャット数',
      value: '89',
      icon: ProfileIcons.chat,
      bgColor: 'bg-blue-100',
    },
    {
      label: '最終アクティブ',
      value: '2時間前',
      icon: ProfileIcons.clock,
      bgColor: 'bg-purple-100',
    },
    {
      label: 'アクティブ日数',
      value: daysActive,
      icon: ProfileIcons.activity,
      bgColor: 'bg-indigo-100',
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">アカウント情報</h2>
      
      <div className="space-y-4 mb-8">
        <ProfileInfoField
          icon={ProfileIcons.email}
          label="メールアドレス"
          value={profile.email}
        />
        <ProfileInfoField
          icon={ProfileIcons.user}
          label="ユーザーID"
          value={profile.id}
        />
        <ProfileInfoField
          icon={ProfileIcons.shield}
          label="アカウントタイプ"
          value={
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              profile.isAdmin ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {profile.isAdmin ? '管理者' : '一般ユーザー'}
            </span>
          }
        />
        <ProfileInfoField
          icon={ProfileIcons.calendar}
          label="登録日"
          value={formattedJoinDate}
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">アクティビティサマリー</h3>
        <ActivitySummaryGrid activities={activities} />
      </div>
    </div>
  );
}