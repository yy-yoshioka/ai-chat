'use client';

import React from 'react';
import { useWidgetsPage } from '@/app/_hooks/widgets/useWidgetsPage';
import { WidgetsPageHeader } from '@/app/_components/feature/widgets/WidgetsPageHeader';
import { WidgetsEmptyState } from '@/app/_components/feature/widgets/WidgetsEmptyState';
import { WidgetCard } from '@/app/_components/feature/widgets/WidgetCard';

export default function WidgetsPage({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = React.use(params);
  const { widgets, loading, handleDeleteWidget, handleToggleActive, copyEmbedCode } = useWidgetsPage(orgId);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">読み込み中...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <WidgetsPageHeader orgId={orgId} />

      {widgets.length === 0 ? (
        <WidgetsEmptyState orgId={orgId} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {widgets.map((widget) => (
            <WidgetCard
              key={widget.id}
              widget={widget}
              orgId={orgId}
              onToggleActive={handleToggleActive}
              onDelete={handleDeleteWidget}
              onCopyEmbedCode={copyEmbedCode}
            />
          ))}
        </div>
      )}
    </div>
  );
}
