import React from 'react';
import type { DashboardWidget } from '@/app/_schemas/dashboard';
import { StatWidget } from './StatWidget';
import { HealthWidget } from './HealthWidget';
import { ActivityWidget } from './ActivityWidget';
import { ChartWidget } from './ChartWidget';
import { AddWidgetModal } from './AddWidgetModal';

interface DashboardViewProps {
  widgets: DashboardWidget[];
  isLoading: boolean;
  showAddModal: boolean;
  onAddWidget: (type: string) => void;
  onRemoveWidget: (id: string) => void;
  onSetShowAddModal: (show: boolean) => void;
}

export function DashboardView({
  widgets,
  isLoading,
  showAddModal,
  onAddWidget,
  onRemoveWidget,
  onSetShowAddModal,
}: DashboardViewProps) {
  const renderWidget = (widget: DashboardWidget) => {
    switch (widget.type) {
      case 'stat':
        return <StatWidget widget={widget} onRemove={onRemoveWidget} />;
      case 'health':
        return <HealthWidget widget={widget} onRemove={onRemoveWidget} />;
      case 'activity':
        return <ActivityWidget widget={widget} onRemove={onRemoveWidget} />;
      case 'chart':
        return <ChartWidget widget={widget} onRemove={onRemoveWidget} />;
      default:
        return <div>Unknown widget type</div>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">読み込み中...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ダッシュボード</h1>
          <p className="text-gray-600">システム全体の状況を監視</p>
        </div>
        <button
          onClick={() => onSetShowAddModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          ウィジェット追加
        </button>
      </div>

      <div className="grid grid-cols-12 gap-4 auto-rows-min">
        {widgets.map((widget) => (
          <div
            key={widget.id}
            className={`col-span-${widget.position.w} row-span-${widget.position.h}`}
            style={{
              gridColumn: `span ${widget.position.w}`,
              minHeight: `${widget.position.h * 100}px`,
            }}
          >
            {renderWidget(widget)}
          </div>
        ))}
      </div>

      {showAddModal && (
        <AddWidgetModal onAddWidget={onAddWidget} onClose={() => onSetShowAddModal(false)} />
      )}
    </div>
  );
}
