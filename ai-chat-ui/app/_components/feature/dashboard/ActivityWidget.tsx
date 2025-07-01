import React from 'react';
import type { DashboardWidget, ActivityData } from '@/app/_schemas/dashboard';

interface ActivityWidgetProps {
  widget: DashboardWidget;
  onRemove: (id: string) => void;
}

export function ActivityWidget({ widget, onRemove }: ActivityWidgetProps) {
  const data = widget.data as ActivityData;
  if (!data || !data.activities) return null;

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
        {data.activities.map((activity) => (
          <div key={activity.id} className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm text-gray-900">
                <span className="font-medium">{activity.action}</span> - {activity.user}
              </p>
              <p className="text-xs text-gray-500">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
