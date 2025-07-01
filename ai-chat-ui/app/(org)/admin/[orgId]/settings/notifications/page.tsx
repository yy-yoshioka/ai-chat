'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { PageHeader } from '@/app/_components/common/PageHeader';
import { NotificationSettings } from '@/app/_components/feature/settings/NotificationSettings';

export default function NotificationSettingsPage() {
  const params = useParams();
  const orgId = params.orgId as string;

  return (
    <div className="container mx-auto py-6">
      <PageHeader title="通知設定" description="メール通知とアプリ内通知の設定" />

      <div className="mt-8">
        <NotificationSettings orgId={orgId} />
      </div>
    </div>
  );
}
