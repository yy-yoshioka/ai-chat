'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { PageHeader } from '@/_components/common/PageHeader';
import { DataRetentionSettings } from '@/_components/feature/settings/DataRetentionSettings';
import { RetentionJobHistory } from '@/_components/feature/settings/RetentionJobHistory';

export default function DataRetentionPage() {
  const params = useParams();
  const orgId = params.orgId as string;

  return (
    <div className="container mx-auto py-6 space-y-8">
      <PageHeader title="データ保持設定" description="データの自動削除とプライバシー管理" />

      <DataRetentionSettings orgId={orgId} />
      <RetentionJobHistory orgId={orgId} />
    </div>
  );
}
