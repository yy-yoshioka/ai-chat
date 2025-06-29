import React from 'react';
import type { DashboardWidget } from '@/_schemas/dashboard';

interface ChartWidgetProps {
  widget: DashboardWidget;
  onRemove: (id: string) => void;
}

export function ChartWidget({ widget, onRemove }: ChartWidgetProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6 relative group">
      <button
        onClick={() => onRemove(widget.id)}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600 transition-all"
      >
        ✕
      </button>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{widget.title}</h3>
      <div className="h-32 bg-gray-50 rounded-lg flex items-center justify-center">
        <div className="text-center text-gray-500">
          <div className="text-3xl mb-2">📈</div>
          <p>チャートデータ</p>
          <p className="text-sm">（実装予定）</p>
        </div>
      </div>
    </div>
  );
}