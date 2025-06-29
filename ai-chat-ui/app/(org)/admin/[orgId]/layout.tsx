'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../../_hooks/auth/useAuth';
import OrgAdminGuard from '@/app/_components/guard/OrgAdminGuard';
import { AdminSidebar } from '@/app/_components/layout/AdminSidebar';
import { AdminHeader } from '@/app/_components/layout/AdminHeader';

interface AdminLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    orgId: string;
  }>;
}

export default function AdminLayout({ children, params }: AdminLayoutProps) {
  const pathname = usePathname() || '';
  const { user } = useAuth();
  const { orgId } = React.use(params);

  return (
    <OrgAdminGuard orgId={orgId} requiredRole="viewer">
      <div className="min-h-screen bg-gray-50 flex">
        <AdminSidebar orgId={orgId} pathname={pathname} user={user} />

        <div className="flex-1 flex flex-col">
          <AdminHeader pathname={pathname} orgId={orgId} />
          <main className="flex-1 p-6 overflow-auto">{children}</main>
        </div>
      </div>
    </OrgAdminGuard>
  );
}
