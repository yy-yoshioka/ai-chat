import { use } from 'react';
import BillingPageClient from './BillingPageClient';

export default function BillingPage({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = use(params);
  return <BillingPageClient orgId={orgId} />;
}
