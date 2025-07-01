import React from 'react';
import type { DashboardWidget, HealthData } from '@/app/_schemas/dashboard';

interface HealthWidgetProps {
  widget: DashboardWidget;
  onRemove: (id: string) => void;
}

export function HealthWidget({ widget, onRemove }: HealthWidgetProps) {
  const data = widget.data as HealthData;
  if (!data || !data.items) return null;

  return (
    <div className="bg-white rounded-lg shadow p-6 relative group">
      <button
        onClick={() => onRemove(widget.id)}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600 transition-all"
      >
        ✕
      </button>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{widget.title}</h3>
      <div className="space-y-4">
        {data.items.map((item, index) => (
          <div key={index}>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{item.name}</span>
              <span
                className={`text-sm font-medium ${
                  item.status === 'good'
                    ? 'text-green-600'
                    : item.status === 'warning'
                      ? 'text-yellow-600'
                      : 'text-red-600'
                }`}
              >
                {item.status === 'good' ? '良好' : item.status === 'warning' ? '注意' : 'エラー'}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
              <div
                className={`h-2 rounded-full ${
                  item.status === 'good'
                    ? 'bg-green-500'
                    : item.status === 'warning'
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                }`}
                style={{ width: `${item.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
