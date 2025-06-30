'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/app/_components/feature/superadmin/layout/Sidebar';
import TopHeader from '@/app/_components/feature/superadmin/layout/TopHeader';
import LoadingScreen from '@/app/_components/feature/superadmin/layout/LoadingScreen';
import UnauthorizedAccess from '@/app/_components/feature/superadmin/layout/UnauthorizedAccess';
import { useSuperAdminAuth } from '@/app/_hooks/superadmin/useSuperAdminAuth';

interface SuperAdminLayoutProps {
  children: React.ReactNode;
}

export default function SuperAdminLayout({ children }: SuperAdminLayoutProps) {
  const pathname = usePathname();
  const { user, loading, isAuthorized } = useSuperAdminAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isAuthorized) {
    return <UnauthorizedAccess />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar pathname={pathname || ''} user={user} />

      <div className="flex-1 flex flex-col">
        <TopHeader pathname={pathname || ''} />
        <main className="flex-1 p-6 overflow-auto bg-gray-50">{children}</main>
      </div>
    </div>
  );
}
