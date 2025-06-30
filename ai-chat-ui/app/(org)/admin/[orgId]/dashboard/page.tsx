'use client';

import React from 'react';
import { useDashboard } from '@/app/_hooks/dashboard/useDashboard';
import { DashboardView } from '@/app/_components/feature/dashboard';

export default function AdminDashboard({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = React.use(params);
  const { widgets, isLoading, showAddModal, setShowAddModal, addWidget, removeWidget } =
    useDashboard(orgId);

  return (
    <DashboardView
      widgets={widgets}
      isLoading={isLoading}
      showAddModal={showAddModal}
      onAddWidget={addWidget}
      onRemoveWidget={removeWidget}
      onSetShowAddModal={setShowAddModal}
    />
  );
}
