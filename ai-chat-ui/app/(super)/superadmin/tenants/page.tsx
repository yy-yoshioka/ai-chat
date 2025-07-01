'use client';

import { useState } from 'react';
import { TenantStats } from './_components/TenantStats';
import { TenantsTable } from './_components/TenantsTable';
import { mockTenants } from './data';

export default function TenantsPage() {
  const [tenants] = useState(mockTenants);

  return (
    <div className="space-y-6">
      <TenantStats tenants={tenants} />
      <TenantsTable tenants={tenants} />
    </div>
  );
}
