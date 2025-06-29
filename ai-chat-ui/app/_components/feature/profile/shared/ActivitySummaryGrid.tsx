'use client';

import React from 'react';

interface ActivityItem {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  bgColor: string;
}

interface ActivitySummaryGridProps {
  activities: ActivityItem[];
}

export function ActivitySummaryGrid({ activities }: ActivitySummaryGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      {activities.map((activity, index) => (
        <div key={index} className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 text-sm">{activity.label}</span>
            <div
              className={`w-8 h-8 ${activity.bgColor} rounded-lg flex items-center justify-center`}
            >
              {activity.icon}
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{activity.value}</p>
        </div>
      ))}
    </div>
  );
}
