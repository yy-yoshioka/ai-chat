'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { PageHeader } from '@/_components/common/PageHeader';
import { APIKeyManager } from '@/_components/feature/settings/APIKeyManager';

export default function APISettingsPage() {
  const params = useParams();
  const orgId = params.orgId as string;

  return (
    <div className="container mx-auto py-6">
      <PageHeader title="API設定" description="APIキーの管理とWebhook設定" />

      <div className="mt-8">
        <APIKeyManager orgId={orgId} />
      </div>
    </div>
  );
}
