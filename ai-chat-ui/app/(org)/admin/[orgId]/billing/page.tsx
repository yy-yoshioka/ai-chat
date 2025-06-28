'use client';
import { useState } from 'react';
import TabBar from '@/app/_components/feature/billing/pg/TabBar';
import PlanTab from '@/app/_components/feature/billing/pg/PlanTab';
import UsageTab from '@/app/_components/feature/billing/pg/UsageTab';
import InvoiceTab from '@/app/_components/feature/billing/pg/InvoiceTab';
import ScreenMessage from '@/app/_components/feature/billing/pg/ScreenMessage';
import { useBilling } from '@/app/_hooks/billing/useBilling';

export default function BillingPage({ params }: { params: { orgId: string } }) {
  const { orgId } = params;
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
