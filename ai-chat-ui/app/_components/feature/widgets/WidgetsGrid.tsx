'use client';

import React from 'react';
import { WidgetCard } from './WidgetCard';
import { WidgetsEmptyState } from './WidgetsEmptyState';
import type { WidgetSettings } from '@/app/_schemas/widget';

interface WidgetsGridProps {
  widgets: WidgetSettings[];
  orgId: string;
  onToggleActive: (widgetId: string, isActive: boolean) => void;
  onCopyEmbed: (widgetKey: string) => void;
  onCopyId: (widgetId: string) => void;
  onCreateClick: () => void;
}

export function WidgetsGrid({
  widgets,
  orgId,
  onToggleActive,
  onCopyEmbed,
  onCopyId,
  onCreateClick,
}: WidgetsGridProps) {
  if (widgets.length === 0) {
    return <WidgetsEmptyState onCreateClick={onCreateClick} />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {widgets.map((widget) => (
        <WidgetCard
          key={widget.id}
          widget={widget}
          orgId={orgId}
          onToggleActive={onToggleActive}
          onCopyEmbed={onCopyEmbed}
          onCopyId={onCopyId}
        />
      ))}
    </div>
  );
}