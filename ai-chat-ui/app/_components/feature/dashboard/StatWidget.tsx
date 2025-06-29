import React from 'react';
import type { DashboardWidget, StatData } from '@/_schemas/dashboard';

interface StatWidgetProps {
  widget: DashboardWidget;
  onRemove: (id: string) => void;
}

export function StatWidget({ widget, onRemove }: StatWidgetProps) {
  const data = widget.data as StatData;
  if (!data) return null;

  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    purple: 'bg-purple-100 text-purple-600',
    red: 'bg-red-100 text-red-600',
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 relative group">
      <button
        onClick={() => onRemove(widget.id)}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600 transition-all"
      >
        ✕
      </button>
      <div className="flex items-center">
        <div
          className={`p-2 rounded-lg ${colorClasses[data.color as keyof typeof colorClasses] || colorClasses.blue}`}
        >
          <span className="text-2xl">{data.icon}</span>
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{widget.title}</p>
          <p className="text-2xl font-bold text-gray-900">
            {typeof data.value === 'number' ? data.value.toLocaleString() : data.value}
          </p>
        </div>
      </div>
    </div>
  );
}
