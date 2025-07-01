import { AdminLayout } from '@/app/_components/layout/AdminLayout';
import OrgAdminGuard from '@/app/_components/guard/OrgAdminGuard';
import { PageHeader } from '@/app/_components/common/PageHeader';
import { WebhooksList } from '@/app/_components/feature/webhooks/WebhooksList';

export default async function WebhooksPage({
  params,
}: {
  params: { orgId: string };
}) {
  return (
    <OrgAdminGuard>
      <AdminLayout organizationSlug={params.orgId}>
        <div className="p-6">
          <PageHeader
            title="Webhook設定"
            breadcrumbs={[
              { label: 'ダッシュボード', href: `/admin/${params.orgId}/dashboard` },
              { label: '設定', href: `/admin/${params.orgId}/settings` },
              { label: 'Webhook', href: `/admin/${params.orgId}/webhooks` },
            ]}
          />

          <div className="mt-6">
            <WebhooksList />
          </div>
        </div>
      </AdminLayout>
    </OrgAdminGuard>
  );
}