'use client';

import { useParams } from 'next/navigation';
import { PageHeader } from '@/_components/common/PageHeader';
import { PermissionsManager } from '@/_components/feature/security/PermissionsManager';
import PermissionGate from '@/_components/guard/PermissionGate';

export default function PermissionsPage() {
  const params = useParams();
  const orgId = params.orgId as string;

  return (
    <PermissionGate permission="SYSTEM_ADMIN">
      <div className="container mx-auto py-6 space-y-8">
        <PageHeader title="権限管理" description="ユーザーの権限とアクセス制御の管理" />

        <PermissionsManager orgId={orgId} />
      </div>
    </PermissionGate>
  );
}
