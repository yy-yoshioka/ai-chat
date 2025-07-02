'use client';

import { useParams } from 'next/navigation';
import { PageHeader } from '@/_components/common/PageHeader';
import { SecurityDashboard } from '@/_components/feature/security/SecurityDashboard';
import PermissionGate from '@/_components/guard/PermissionGate';

export default function SecurityPage() {
  const params = useParams();
  const orgId = params.orgId as string;

  return (
    <PermissionGate permission="AUDIT_READ">
      <div className="container mx-auto py-6 space-y-8">
        <PageHeader
          title="セキュリティダッシュボード"
          description="セキュリティイベントとアクセス制御の監視"
        />

        <SecurityDashboard orgId={orgId} />
      </div>
    </PermissionGate>
  );
}
