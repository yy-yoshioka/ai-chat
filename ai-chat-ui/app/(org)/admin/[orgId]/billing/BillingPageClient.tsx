'use client';
import { useState } from 'react';

import { useBilling } from '@/app/_hooks/billing/useBilling';
import ScreenMessage from '@/app/_components/feature/billing/admin-billing/screen/ScreenMessage';
import TabBar from '@/app/_components/feature/billing/admin-billing/screen/TabBar';
import PlanTab from '@/app/_components/feature/billing/admin-billing/tab-plans/PlanTab';
import UsageTab from '@/app/_components/feature/billing/admin-billing/tab-usage/UsageTab';
import InvoiceTab from '@/app/_components/feature/billing/admin-billing/tab-usage/InvoiceTab';

export default function BillingPageClient({ orgId }: { orgId: string }) {
  const [tab, setTab] = useState<'plan' | 'usage' | 'invoices'>('plan');
  const { data, isLoading, error } = useBilling(orgId);

  if (isLoading) return <ScreenMessage type="loading" />;
  if (error) return <ScreenMessage type="error" message={error.message} />;
  if (!data) return <ScreenMessage type="empty" />;

  return (
    <>
      <TabBar value={tab} onChange={setTab} />
      {tab === 'plan' && <PlanTab billing={data} orgId={orgId} />}
      {tab === 'usage' && <UsageTab usage={data.usage} />}
      {tab === 'invoices' && <InvoiceTab orgId={orgId} />}
    </>
  );
}
