'use client';

import { useParams } from 'next/navigation';
import AuthGuard from '@/app/_components/guard/AuthGuard';
import { useAdminChats } from '@/app/_hooks/chat/useAdminChats';
import { AdminChatsView } from '@/app/_components/feature/chat/admin';

export default function AdminChatsPage() {
  const params = useParams();
  const orgId = (params?.orgId as string) || 'default';
  const {
    activeTab,
    setActiveTab,
    metrics,
    loading,
    selectedDate,
    setSelectedDate,
    statusFilter,
    setStatusFilter,
    filteredChats,
  } = useAdminChats(orgId);

  return (
    <AuthGuard>
      <AdminChatsView
        activeTab={activeTab}
        onTabChange={setActiveTab}
        metrics={metrics}
        loading={loading}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        filteredChats={filteredChats}
      />
    </AuthGuard>
  );
}
